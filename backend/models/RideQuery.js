const mongoose = require('mongoose');

const rideQuerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous queries
  },
  from: {
    address: {
      type: String,
      required: [true, 'Source address is required']
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Source latitude is required']
      },
      lng: {
        type: Number,
        required: [true, 'Source longitude is required']
      }
    }
  },
  to: {
    address: {
      type: String,
      required: [true, 'Destination address is required']
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Destination latitude is required']
      },
      lng: {
        type: Number,
        required: [true, 'Destination longitude is required']
      }
    }
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'car'],
    default: 'car',
    index: true
  },
  distance: {
    type: Number, // in kilometers
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  providers: [{
    name: {
      type: String,
      enum: ['uber', 'ola', 'rapido'],
      required: true
    },
    available: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    etaPickup: {
      type: Number, // in minutes
      required: true
    },
    etaDestination: {
      type: Number, // in minutes
      required: true
    },
    vehicleDetails: {
      type: String,
      model: String,
      capacity: Number
    },
    surgeMultiplier: {
      type: Number,
      default: 1.0
    }
  }],
  selectedProvider: {
    type: String,
    enum: ['uber', 'ola', 'rapido']
  },
  sessionId: {
    type: String,
    index: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for efficient queries
rideQuerySchema.index({ "from.coordinates": "2dsphere" });
rideQuerySchema.index({ "to.coordinates": "2dsphere" });
rideQuerySchema.index({ vehicleType: 1, createdAt: -1 });

// Generate route hash for caching
rideQuerySchema.methods.generateRouteHash = function() {
  const crypto = require('crypto');
  const routeString = `${this.from.coordinates.lat},${this.from.coordinates.lng}-${this.to.coordinates.lat},${this.to.coordinates.lng}-${this.vehicleType}`;
  return crypto.createHash('md5').update(routeString).digest('hex');
};

module.exports = mongoose.model('RideQuery', rideQuerySchema);
