
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');


//récupérer les professionnels avec filtrage par profession
// @route   GET api/professionals
router.get('/professionals', protect, authorize('client'), async (req, res) => {
    try {
      const { profession } = req.query;
      const query = { role: 'professional' };
  
      if (profession) {
        query.profession = profession;
      }
  
      const professionals = await User.find(query).select('name email profession phone');
      res.json(professionals);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

//récupérer les professionnels par id
// @route   GET api/professionals/:id
router.get('/professionals/:id', protect, authorize('client'), async (req, res) => {
    try {
      const professional = await User.findById(req.params.id).select('name email profession phone');
  
      if (!professional) {
        return res.status(404).json({ msg: 'Professional not found' });
      }
  
      res.json(professional);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  

module.exports = router;