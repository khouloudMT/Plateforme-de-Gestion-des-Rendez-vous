const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @route   POST api/appointments
// @desc    Create an appointment
// @access  Private
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
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { professional, date, time, notes } = req.body;

    try {
        // Check if professional exists
        const professionalUser = await User.findById(professional);
        if (!professionalUser || professionalUser.role !== 'professional') {
            return res.status(400).json({ msg: 'Professional not found' });
        }

        // client cant make more than one appointment with the same professional
        // chack if the appointment exists
        const existingAppointment = await Appointment.findOne({
            client: req.user.id,
            professional: req.body.professional,
            date: req.body.date
          });
          
          if (existingAppointment) {
            return res.status(400).json({ msg: 'You already have an appointment with this professional on this date.' });
          }
        // create appointment
        const appointment = new Appointment({
            client: req.user.id,
            professional,
            date,
            time,
            notes
        });

        await appointment.save();

        // Populate professional details for email
        const savedAppointment = await Appointment.findById(appointment._id)
            .populate('professional', 'name email');

        // Send confirmation email
        const client = await User.findById(req.user.id);
        
        const emailData = {
            to: client.email,
            subject: 'Appointment Confirmation',
            text: `Your appointment with ${savedAppointment.professional.name} on ${date} at ${time} has been booked.`
        };

        await sendEmail(emailData);

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

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

// @route   GET api/appointments/me
// @desc    Get current user's appointments
// @access  Private
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
                .populate('client', 'name email')
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
// @access  Private
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

        // Check if user is client or professional associated with the appointment
        if (req.user.id !== appointment.client.toString() && req.user.id !== appointment.professional.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Only allow status change by professional
        if (status && req.user.id !== appointment.professional.toString()) {
            return res.status(401).json({ msg: 'Only the professional can change the status' });
        }

        // Check for time conflicts if time is being updated
        if (date || time) {
            const checkDate = date || appointment.date;
            const checkTime = time || appointment.time;
            const existingAppointment = await Appointment.findOne({
                professional: appointment.professional,
                date: checkDate,
                _id: { $ne: appointment._id },
                $or: [
                    {
                        time: { $lt: checkTime }
                    }
                ]
            });

            if (existingAppointment) {
                return res.status(400).json({ msg: 'Time slot already booked' });
            }
        }

        appointment.date = date || appointment.date;
        appointment.time = time || appointment.time;
        appointment.status = status || appointment.status;
        appointment.notes = notes || appointment.notes;

        await appointment.save();

        // Send update email
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('client', 'name email')
            .populate('professional', 'name email');

        const emailData = {
            to: populatedAppointment.client.email,
            subject: 'Appointment Updated',
            text: `Your appointment with ${populatedAppointment.professional.name} has been updated. New details: ${appointment.date} at ${appointment.time}. Status: ${appointment.status}`
        };

        await sendEmail(emailData);

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

        await await Appointment.findByIdAndDelete(req.params.id);
        await sendEmail(emailData);

        res.json({ msg: 'Appointment removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Appointment not found' });
        }
        res.status(500).json({ message: "Server Error" });
    }
});




module.exports = router;