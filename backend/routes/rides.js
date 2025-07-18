const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { RideQuery, CacheEntry } = require('../models');
const rideProviders = require('../utils/rideProviders');
const auth = require('../middleware/auth');

// Search for rides
router.post('/search', [
  body('from.address').notEmpty().withMessage('Source address is required'),
  body('from.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid source latitude required'),
  body('from.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid source longitude required'),
  body('to.address').notEmpty().withMessage('Destination address is required'),
  body('to.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid destination latitude required'),
  body('to.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid destination longitude required'),
  body('vehicleType').optional().isIn(['bike', 'auto', 'car']).withMessage('Invalid vehicle type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { from, to, vehicleType = 'car' } = req.body;

    // Generate route hash for caching
    const routeString = `${from.coordinates.lat},${from.coordinates.lng}-${to.coordinates.lat},${to.coordinates.lng}-${vehicleType}`;
    const crypto = require('crypto');
    const routeHash = crypto.createHash('md5').update(routeString).digest('hex');

    // Check cache first
    let cacheEntry = await CacheEntry.findOne({ routeHash });

    if (cacheEntry) {
      // Update hit count
      await cacheEntry.incrementHitCount();

      // Use cached data with some real-time adjustments
      const providers = await rideProviders.getUpdatedPrices(cacheEntry.providers, vehicleType);

      return res.json({
        success: true,
        data: {
          from,
          to,
          vehicleType,
          distance: cacheEntry.distance,
          duration: cacheEntry.duration,
          providers,
          cached: true
        }
      });
    }

    // Calculate distance and duration
    const routeInfo = await rideProviders.calculateRoute(from.coordinates, to.coordinates);

    // Get quotes from all providers
    const providers = await rideProviders.getAllQuotes({
      from,
      to,
      vehicleType,
      distance: routeInfo.distance,
      duration: routeInfo.duration
    });

    // Create new ride query
    const rideQuery = new RideQuery({
      userId: req.user ? req.user.id : null,
      from,
      to,
      vehicleType,
      distance: routeInfo.distance,
      duration: routeInfo.duration,
      providers,
      sessionId: req.sessionId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await rideQuery.save();

    // Cache the result
    const newCacheEntry = new CacheEntry({
      routeHash,
      from,
      to,
      vehicleType,
      distance: routeInfo.distance,
      duration: routeInfo.duration,
      providers: providers.map(p => ({
        name: p.name,
        basePrice: p.price,
        baseDuration: p.etaPickup,
        lastUpdated: new Date()
      }))
    });

    await newCacheEntry.save();

    res.json({
      success: true,
      data: {
        from,
        to,
        vehicleType,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        providers,
        cached: false
      }
    });

  } catch (error) {
    console.error('Ride search error:', error);
    res.status(500).json({
      error: 'Failed to search rides',
      message: error.message
    });
  }
});

// Get ride history
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rides = await RideQuery.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await RideQuery.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        rides,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Ride history error:', error);
    res.status(500).json({
      error: 'Failed to fetch ride history',
      message: error.message
    });
  }
});

// Select provider (for analytics)
router.post('/select', [
  body('queryId').isMongoId().withMessage('Valid query ID required'),
  body('provider').isIn(['uber', 'ola', 'rapido']).withMessage('Invalid provider')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { queryId, provider } = req.body;

    const rideQuery = await RideQuery.findById(queryId);
    if (!rideQuery) {
      return res.status(404).json({
        error: 'Ride query not found'
      });
    }

    rideQuery.selectedProvider = provider;
    await rideQuery.save();

    res.json({
      success: true,
      message: 'Provider selection recorded'
    });

  } catch (error) {
    console.error('Provider selection error:', error);
    res.status(500).json({
      error: 'Failed to record provider selection',
      message: error.message
    });
  }
});

// Get popular routes
router.get('/popular', async (req, res) => {
  try {
    const popularRoutes = await RideQuery.aggregate([
      {
        $group: {
          _id: {
            from: '$from.address',
            to: '$to.address',
            vehicleType: '$vehicleType'
          },
          count: { $sum: 1 },
          avgPrice: { $avg: '$providers.price' },
          lastQueried: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: popularRoutes
    });

  } catch (error) {
    console.error('Popular routes error:', error);
    res.status(500).json({
      error: 'Failed to fetch popular routes',
      message: error.message
    });
  }
});

module.exports = router;
