const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const moment = require('moment');

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', 
    protect,
    authorize('admin'), // Ensure only admin can access this route
    async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/professionals
// @desc    Get all professionals
// @access  Private
router.get('/professionals',
    protect,
     // Ensure only admin can access this route
     async (req, res) => {
    try {
        const professionals = await User.find({ role: 'professional' }).select('-password');
        res.json(professionals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id',
    protect,
    authorize('admin'), // Ensure only admin can access this route
    async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id',
    protect,
    authorize('admin'), // Ensure only admin can access this route
    async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { name, email, role, profession } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.profession = profession || user.profession;

        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id',
    protect,
    authorize('admin'), // Ensure only admin can access this route
    async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await user.deleteOne();

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/stats/registrations
// @desc    Get user registration statistics
// @access  Private/Admin
router.get('/stats/registrations', 
    protect,
    authorize('admin'),
    async (req, res) => {
    try {
        // Get registration counts for last 30 days
        const registrationStats = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Format the response
        const dates = [];
        const counts = [];
        
        // Fill in missing dates with 0 counts
        const startDate = moment().subtract(30, 'days');
        const endDate = moment();
        
        for (let m = moment(startDate); m.diff(endDate) <= 0; m.add(1, 'days')) {
            const dateStr = m.format('YYYY-MM-DD');
            const stat = registrationStats.find(s => s._id === dateStr);
            
            dates.push(dateStr);
            counts.push(stat ? stat.count : 0);
        }

        res.json({
            dates,
            counts
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/stats/roles
// @desc    Get user role distribution statistics
// @access  Private/Admin
router.get('/stats/roles',
    protect,
    authorize('admin'),
    async (req, res) => {
    try {
        const roleStats = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format the response
        const roles = [];
        const counts = [];
        
        roleStats.forEach(stat => {
            roles.push(stat._id);
            counts.push(stat.count);
        });

        res.json({
            roles,
            counts
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;