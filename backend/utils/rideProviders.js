const axios = require('axios');

class RideProviders {
  constructor() {
    this.providers = {
      uber: {
        name: 'Uber',
        baseUrl: 'https://api.uber.com/v1.2',
        vehicles: {
          bike: 'UberMoto',
          auto: 'UberAuto',
          car: 'UberGo'
        }
      },
      ola: {
        name: 'Ola',
        baseUrl: 'https://api.olaservices.com/v1',
        vehicles: {
          bike: 'bike',
          auto: 'auto',
          car: 'micro'
        }
      },
      rapido: {
        name: 'Rapido',
        baseUrl: 'https://api.rapido.com/v1',
        vehicles: {
          bike: 'bike',
          auto: 'auto',
          car: 'cab'
        }
      }
    };
  }

  async calculateRoute(fromCoords, toCoords) {
    try {
      // In a real implementation, use Google Maps Distance Matrix API
      // For now, calculate approximate distance and duration
      const distance = this.calculateDistance(fromCoords, toCoords);
      const avgSpeed = 25; // km/h average speed in city
      const duration = Math.round((distance / avgSpeed) * 60); // minutes

      return {
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        duration
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error('Failed to calculate route');
    }
  }

  calculateDistance(coord1, coord2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLon = this.deg2rad(coord2.lng - coord1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  async getAllQuotes(params) {
    const { from, to, vehicleType, distance, duration } = params;

    try {
      const [uberQuote, olaQuote, rapidoQuote] = await Promise.allSettled([
        this.getUberQuote(params),
        this.getOlaQuote(params),
        this.getRapidoQuote(params)
      ]);

      const quotes = [];

      if (uberQuote.status === 'fulfilled') {
        quotes.push(uberQuote.value);
      }
      if (olaQuote.status === 'fulfilled') {
        quotes.push(olaQuote.value);
      }
      if (rapidoQuote.status === 'fulfilled') {
        quotes.push(rapidoQuote.value);
      }

      return quotes;
    } catch (error) {
      console.error('Get all quotes error:', error);
      throw new Error('Failed to get ride quotes');
    }
  }

  async getUberQuote(params) {
    const { vehicleType, distance, duration } = params;

    try {
      // Mock implementation - replace with actual Uber API call
      const baseRates = {
        bike: { base: 15, perKm: 8 },
        auto: { base: 25, perKm: 12 },
        car: { base: 35, perKm: 15 }
      };

      const rate = baseRates[vehicleType] || baseRates.car;
      const basePrice = rate.base + (distance * rate.perKm);
      const surgeMultiplier = this.getSurgeMultiplier();
      const price = Math.round(basePrice * surgeMultiplier);

      return {
        name: 'uber',
        available: vehicleType !== 'bike' || Math.random() > 0.2, // 80% availability for bikes
        price,
        currency: 'INR',
        etaPickup: Math.max(2, Math.round(Math.random() * 8)), // 2-8 minutes
        etaDestination: duration + Math.round(Math.random() * 5), // Add some variance
        vehicleDetails: {
          type: this.providers.uber.vehicles[vehicleType],
          model: this.getRandomVehicleModel(vehicleType),
          capacity: this.getVehicleCapacity(vehicleType)
        },
        surgeMultiplier
      };
    } catch (error) {
      console.error('Uber quote error:', error);
      throw new Error('Failed to get Uber quote');
    }
  }

  async getOlaQuote(params) {
    const { vehicleType, distance, duration } = params;

    try {
      // Mock implementation - replace with actual Ola API call
      const baseRates = {
        bike: { base: 12, perKm: 7 },
        auto: { base: 20, perKm: 10 },
        car: { base: 30, perKm: 13 }
      };

      const rate = baseRates[vehicleType] || baseRates.car;
      const basePrice = rate.base + (distance * rate.perKm);
      const surgeMultiplier = this.getSurgeMultiplier();
      const price = Math.round(basePrice * surgeMultiplier);

      return {
        name: 'ola',
        available: Math.random() > 0.15, // 85% availability
        price,
        currency: 'INR',
        etaPickup: Math.max(3, Math.round(Math.random() * 10)), // 3-10 minutes
        etaDestination: duration + Math.round(Math.random() * 3),
        vehicleDetails: {
          type: this.providers.ola.vehicles[vehicleType],
          model: this.getRandomVehicleModel(vehicleType),
          capacity: this.getVehicleCapacity(vehicleType)
        },
        surgeMultiplier
      };
    } catch (error) {
      console.error('Ola quote error:', error);
      throw new Error('Failed to get Ola quote');
    }
  }

  async getRapidoQuote(params) {
    const { vehicleType, distance, duration } = params;

    try {
      // Rapido primarily focuses on bikes and autos
      if (vehicleType === 'car') {
        // Limited car availability
        if (Math.random() > 0.3) {
          return {
            name: 'rapido',
            available: false,
            reason: 'Car service not available in this area'
          };
        }
      }

      const baseRates = {
        bike: { base: 10, perKm: 6 },
        auto: { base: 18, perKm: 9 },
        car: { base: 35, perKm: 16 }
      };

      const rate = baseRates[vehicleType] || baseRates.bike;
      const basePrice = rate.base + (distance * rate.perKm);
      const surgeMultiplier = this.getSurgeMultiplier();
      const price = Math.round(basePrice * surgeMultiplier);

      return {
        name: 'rapido',
        available: true,
        price,
        currency: 'INR',
        etaPickup: Math.max(2, Math.round(Math.random() * 6)), // 2-6 minutes
        etaDestination: duration + Math.round(Math.random() * 4),
        vehicleDetails: {
          type: this.providers.rapido.vehicles[vehicleType],
          model: this.getRandomVehicleModel(vehicleType),
          capacity: this.getVehicleCapacity(vehicleType)
        },
        surgeMultiplier
      };
    } catch (error) {
      console.error('Rapido quote error:', error);
      throw new Error('Failed to get Rapido quote');
    }
  }

  getSurgeMultiplier() {
    const hour = new Date().getHours();
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20);
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

    let multiplier = 1.0;

    if (isRushHour) {
      multiplier += 0.3 + (Math.random() * 0.4); // 1.3 to 1.7
    }
    if (isWeekend) {
      multiplier += 0.1 + (Math.random() * 0.2); // Additional 0.1 to 0.3
    }

    // Random surge for special events
    if (Math.random() > 0.9) {
      multiplier += 0.5 + (Math.random() * 0.5); // Additional 0.5 to 1.0
    }

    return Math.round(multiplier * 10) / 10; // Round to 1 decimal place
  }

  getRandomVehicleModel(vehicleType) {
    const models = {
      bike: ['Honda Activa', 'TVS Jupiter', 'Suzuki Access', 'Bajaj Pulsar'],
      auto: ['Bajaj RE', 'TVS King', 'Mahindra Alfa', 'Piaggio Ape'],
      car: ['Maruti Swift', 'Hyundai i20', 'Tata Tiago', 'Honda City']
    };

    const typeModels = models[vehicleType] || models.car;
    return typeModels[Math.floor(Math.random() * typeModels.length)];
  }

  getVehicleCapacity(vehicleType) {
    const capacities = {
      bike: 2,
      auto: 3,
      car: 4
    };

    return capacities[vehicleType] || 4;
  }

  async getUpdatedPrices(cachedProviders, vehicleType) {
    // Update cached prices with current surge multipliers
    return cachedProviders.map(provider => {
      const surgeMultiplier = this.getSurgeMultiplier();
      const updatedPrice = Math.round(provider.basePrice * surgeMultiplier);

      return {
        name: provider.name,
        available: Math.random() > 0.1, // 90% availability for cached routes
        price: updatedPrice,
        currency: 'INR',
        etaPickup: provider.baseDuration + Math.round(Math.random() * 3),
        etaDestination: provider.baseDuration + Math.round(Math.random() * 5),
        vehicleDetails: {
          type: this.providers[provider.name].vehicles[vehicleType],
          model: this.getRandomVehicleModel(vehicleType),
          capacity: this.getVehicleCapacity(vehicleType)
        },
        surgeMultiplier
      };
    });
  }
}

module.exports = new RideProviders();
