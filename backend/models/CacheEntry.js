const mongoose = require('mongoose');

const cacheEntrySchema = new mongoose.Schema({
  routeHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  from: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  to: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'car'],
    required: true
  },
  distance: Number,
  duration: Number,
  providers: [{
    name: String,
    basePrice: Number,
    baseDuration: Number,
    lastUpdated: Date
  }],
  hitCount: {
    type: Number,
    default: 1
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // 30 minutes TTL
  }
}, {
  timestamps: true
});

// Update hit count on access
cacheEntrySchema.methods.incrementHitCount = function() {
  this.hitCount += 1;
  return this.save();
};

module.exports = mongoose.model('CacheEntry', cacheEntrySchema);
