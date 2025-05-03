const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @route   POST api/appointments
// @desc    Create an appointment
// @access  Private Client
router.post('/', [
    protect,
    authorize('client'),
    [
      check('professional', 'Professional is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('time', 'Time is required').not().isEmpty(),
    ]
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const { professional, date, time, notes } = req.body;
  
    try {   
        // Validate professional exists
        const proUser = await User.findById(professional);
        if (!proUser || proUser.role !== 'professional') {
            return res.status(400).json({ msg: 'Professional not found' });
        }

        const existingDayAppointment = await Appointment.findOne({
            client: req.user.id,
            professional: professional,
            date: date // only date, ignore time
        });
        
        if (existingDayAppointment) {
            return res.status(400).json({
            msg: 'You already have an appointment with this professional on this day.'
            });
        }
    
        // Prevent double-booking same time slot
        const conflict = await Appointment.findOne({ professional, date, time });
        if (conflict) {
            return res.status(400).json({ msg: 'This time slot is already booked with the selected professional.' });
        }

        // Prevent client from booking multiple appointments at same time, even with different pros
        const clientConflict = await Appointment.findOne({
            client: req.user.id,
            date,
            time
        });
        if (clientConflict) {
            return res.status(400).json({
            msg: 'You already have an appointment at this time.'
            });
        }
    
        const appointment = new Appointment({
            client: req.user.id,
            professional,
            date,
            time,
            notes
        });
    
        await appointment.save();
    
        // Email notifications
        const clientUser = await User.findById(req.user.id);
    
        await sendEmail({
            to: clientUser.email,
            subject: 'Appointment Confirmation',
            text: `Your appointment with ${proUser.name} on ${date} at ${time} has been booked.`
        });
    
        await sendEmail({
            to: proUser.email,
            subject: 'New Appointment Booked',
            text: `Appointment with ${clientUser.name} on ${date} at ${time}.`
        });
    
        res.status(201).json(appointment);
        } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
        }
    }
);

// @route   GET api/appointments
// @desc    Get all appointments
// @access  Private/Admin
router.get('/', 
    protect, 
    authorize('admin'),
    async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const appointments = await Appointment.find()
            .populate('client', 'name email')
            .populate('professional', 'name email profession');
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/appointments/my-appointments'
// @desc    Get current user's appointments
// @access  Private Client/Professional
router.get('/my-appointments', 
    protect,
    authorize('client', 'professional'),
    async (req, res) => {
    try {
        let appointments;
        
        if (req.user.role === 'client') {
            appointments = await Appointment.find({ client: req.user.id })
                .populate('professional', 'name email profession')
                .sort({ date: 1 });
        } else if (req.user.role === 'professional') {
            appointments = await Appointment.find({ professional: req.user.id })
                .populate('client', 'name email phone')
                .sort({ date: 1 });
        } else {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(appointments);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/appointments/:id
// @desc    Get appointment by ID
// @access  Private Client/Professional
router.get('/:id', 
    protect, 
    authorize('client', 'professional'), 
    async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id.trim())
        .populate('client', 'name email')
        .populate('professional', 'name email');
  
      if (!appointment) {
        return res.status(404).json({ msg: 'Appointment not found' });
      }
  
      // Check if the user is either client or professional in the appointment
      if (
        req.user.id !== appointment.client._id.toString() &&
        req.user.id !== appointment.professional._id.toString()
      ) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
  
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route   PUT api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', 
    protect, 
    authorize('client', 'professional'),
    [
        check('date', 'Date is required').optional().not().isEmpty(),
        check('time', 'Time is required').optional().not().isEmpty(),
        check('status', 'Status is required').optional().not().isEmpty()
    ],
    async (req, res) => {
    const { date, time, status, notes } = req.body;

    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        const userIsClient = req.user.id === appointment.client.toString();
        const userIsPro = req.user.id === appointment.professional.toString();

        if (!userIsClient && !userIsPro) {
            return res.status(401).json({ msg: 'Not authorized' });
          }
    
    
    
          // Time conflict check (optional)
          if (date || time) {
            const checkDate = date || appointment.date;
            const checkTime = time || appointment.time;
    
            const conflict = await Appointment.findOne({
              professional: appointment.professional,
              date: checkDate,
              _id: { $ne: appointment._id },
              time: checkTime,
            });
    
            if (conflict) {
              return res.status(400).json({ msg: 'Time slot already booked' });
            }
          }
        
        // Update values
        appointment.date = date || appointment.date;
        appointment.time = time || appointment.time;
        appointment.status = status || appointment.status;
        appointment.notes = notes || appointment.notes;

        if (userIsPro && status) {
            appointment.status = status;
          }

        // Auto mark as completed if past + 30min and was confirmed
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const now = new Date();
        const limitTime = new Date(appointmentDateTime.getTime() + 30 * 60 * 1000);
        // && appointment.status === 'confirmed'
        if (now > limitTime ) {
            appointment.status = 'completed';
            appointment.completedAt = now;
        }

        await appointment.save();

         // Notify the client via socket
        req.io.to(appointment.client.toString()).emit('appointmentStatusChanged', {
            appointmentId: appointment._id,
            newStatus: status
        });

        // émettre l'événement
        io.emit('appointmentStatusUpdated', {
        appointmentId: appointment._id,
        status: appointment.status
        });


        // Send update email
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('client', 'name email')
            .populate('professional', 'name email');

        const emailData = {
            to: populatedAppointment.client.email,
            subject: 'Appointment Updated',
            text: `Your appointment with ${populatedAppointment.professional.name} has been updated. New details: ${appointment.date} at ${appointment.time}. Status: ${appointment.status}`
        };
        const emailData2 = {
            to: populatedAppointment.professional.email,
            subject: 'Appointment Updated',
            text: `Your appointment with ${populatedAppointment.client.name} has been updated. New details: ${appointment.date} at ${appointment.time}. Status: ${appointment.status}`
        };

        await sendEmail(emailData);
        await sendEmail(emailData2);


        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Appointment not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', protect,
    authorize('client', 'professional')
    
    , async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
        .populate('client', 'name email')
        .populate('professional', 'name email');

        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        if (req.user.id !== appointment.client._id.toString() &&
            req.user.id !== appointment.professional._id.toString()) {
        return res.status(401).json({ msg: 'Not authorized' });
}

        // Send cancellation email
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('client', 'name email')
            .populate('professional', 'name email');

        const emailData = {
            to: populatedAppointment.client.email,
            subject: 'Appointment Cancelled',
            text: `Your appointment with ${populatedAppointment.professional.name} on ${appointment.date} has been cancelled.`
        };
        const emailData2 = {
            to: populatedAppointment.professional.email,
            subject: 'Appointment Cancelled',
            text: `Your appointment with ${populatedAppointment.client.name} on ${appointment.date} has been cancelled.`
        };

        appointment.status = 'cancelled';
        await appointment.save();

        // await await Appointment.findByIdAndDelete(req.params.id);
        await sendEmail(emailData);
        await sendEmail(emailData2);

        res.json({ msg: 'Appointment removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Appointment not found' });
        }
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   PUT api/appointments/:id/admin-cancel
// @desc    Admin cancels appointment
// @access  Private/Admin
router.put('/:id/admin-cancel', 
    protect,
    authorize('admin'),
    async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('client', 'name email')
            .populate('professional', 'name email');

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        // Send notifications
        const emailData = {
            to: appointment.client.email,
            subject: 'Appointment Cancelled by Admin',
            text: `Your appointment with ${appointment.professional.name} has been cancelled by admin.`
        };
        const emailData2 = {
            to: appointment.professional.email,
            subject: 'Appointment Cancelled by Admin',
            text: `Your appointment with ${appointment.client.name} has been cancelled by admin.`
        };

        await sendEmail(emailData);
        await sendEmail(emailData2);

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/appointments/:id/admin-cancel
// @desc    Admin cancels appointment
// @access  Private/Admin
router.put('/:id/admin-cancel', 
    protect,
    authorize('admin'),
    async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('client', 'name email')
            .populate('professional', 'name email');

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        // Send notifications
        const emailData = {
            to: appointment.client.email,
            subject: 'Appointment Cancelled by Admin',
            text: `Your appointment with ${appointment.professional.name} has been cancelled by admin.`
        };
        const emailData2 = {
            to: appointment.professional.email,
            subject: 'Appointment Cancelled by Admin',
            text: `Your appointment with ${appointment.client.name} has been cancelled by admin.`
        };

        await sendEmail(emailData);
        await sendEmail(emailData2);

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// get available time slots for a professional on a given date
router.get('/available-slots/:professionalId/:date', 
    protect,
    authorize('client', 'professional'),
    async (req, res) => {
    const { professionalId, date } = req.params;
    const clientId = req.user.id;

    const allSlots = [];
  
    for (let hour = 9; hour <= 17; hour++) {
        allSlots.push(`${hour}:00`);
        allSlots.push(`${hour}:30`);
    }
  
    try {
        // Get all appointments on that day for the professional
        const proAppointments = await Appointment.find({ professional: professionalId, date });
        
        // Get all appointments on that day for the current client (with any pro)
        const clientAppointments = await Appointment.find({ client: clientId, date });

        const bookedSlotsByPro = proAppointments.map(a => a.time);
        const bookedSlotsByClient = clientAppointments.map(a => a.time);

        // Merge both types of blocks
        const bookedSlots = Array.from(new Set([...bookedSlotsByPro, ...bookedSlotsByClient]));

        // Check if the logged-in client has any appointment with this pro on that date
        const alreadyBookedThatDay = proAppointments.some(app => app.client.toString() === clientId);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
  
        res.json({ 
            allSlots, 
            bookedSlots, 
            availableSlots,
            alreadyBookedThatDay
        });
    }   catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching slots' });
    }
  });
module.exports = router;

