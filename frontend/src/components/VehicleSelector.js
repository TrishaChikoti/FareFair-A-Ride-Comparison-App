import React from 'react';
import { FiTruck, FiCar } from 'react-icons/fi';
import { GiMotorcycle } from 'react-icons/gi';

const VehicleSelector = ({ selectedVehicle, onVehicleChange }) => {
  const vehicles = [
    { id: 'bike', label: 'Bike', icon: GiMotorcycle },
    { id: 'auto', label: 'Auto', icon: FiTruck },
    { id: 'car', label: 'Car', icon: FiCar }
  ];

  return (
    <div className="flex space-x-4 mb-6">
      {vehicles.map((vehicle) => {
        const IconComponent = vehicle.icon;
        return (
          <button
            key={vehicle.id}
            onClick={() => onVehicleChange(vehicle.id)}
            className={`vehicle-selector flex-1 ${
              selectedVehicle === vehicle.id ? 'selected' : ''
            }`}
          >
            <IconComponent size={24} />
            <span className="ml-2 font-medium">{vehicle.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default VehicleSelector;
