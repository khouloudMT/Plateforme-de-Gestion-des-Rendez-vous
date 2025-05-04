const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @route   GET /api/stats/appointments
// @desc    Get appointment statistics
// @access  Private/Admin
router.get('/appointments', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const completed = await Appointment.countDocuments({ status: 'completed' });
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const confirmed = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });
    const expired = await Appointment.countDocuments({ status: 'expired' });

    res.json({
      total,
      completed,
      pending,
      confirmed,
      cancelled,
      expired
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/stats/status
// @desc    Get appointment status distribution
// @access  Private/Admin
router.get(
    '/status',
     protect, 
     authorize('admin'), 
     async (req, res) => {
        try {
            const result = await Appointment.aggregate([
            {
                $group: {
                _id: '$status',
                count: { $sum: 1 }
                }
            }
            ]);

            const statuses = result.map(item => item._id);
            const counts = result.map(item => item.count);

            res.json({
            statuses,
            counts
            });
        } 
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }


});

// @route   GET /api/stats/monthly
// @desc    Get monthly statistics
// @access  Private/Admin
router.get('/monthly', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    res.json({
      totalUsers,
      newUsers,
      totalAppointments,
      completedAppointments
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;