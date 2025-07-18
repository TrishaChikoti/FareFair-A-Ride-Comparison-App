const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('rideHistory');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email already in use'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(email && { email }) },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Failed to deactivate account',
      message: error.message
    });
  }
});

// Add saved location
router.post('/saved-locations', auth, [
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, address, coordinates } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if location already exists
    const existingLocation = user.preferences.savedLocations.find(
      loc => loc.name.toLowerCase() === name.toLowerCase()
    );

    if (existingLocation) {
      return res.status(400).json({
        error: 'Location with this name already exists'
      });
    }

    // Add new location
    user.preferences.savedLocations.push({
      name,
      address,
      coordinates
    });

    await user.save();

    res.json({
      success: true,
      data: user.preferences.savedLocations
    });

  } catch (error) {
    console.error('Add saved location error:', error);
    res.status(500).json({
      error: 'Failed to add saved location',
      message: error.message
    });
  }
});

// Remove saved location
router.delete('/saved-locations/:locationId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.preferences.savedLocations = user.preferences.savedLocations.filter(
      loc => loc._id.toString() !== req.params.locationId
    );

    await user.save();

    res.json({
      success: true,
      data: user.preferences.savedLocations
    });

  } catch (error) {
    console.error('Remove saved location error:', error);
    res.status(500).json({
      error: 'Failed to remove saved location',
      message: error.message
    });
  }
});

module.exports = router;
