const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Studio = sequelize.define(
  'Studio',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sizeSqft: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    paranoid: true, // Enables soft deletes
  }
);

// Class methods
Studio.findAvailable = async function (startTime, endTime) {
  // Find studios that don't have bookings overlapping with the requested time
  // This is a simplistic version; in a real app, would need to check Booking model
  return await this.findAll({
    where: {
      isActive: true,
    },
  });
};

Studio.getStudioWithEquipment = async function (studioId) {
  // This assumes an Equipment model and association exists
  return await this.findByPk(studioId, {
    include: [{ model: sequelize.models.Equipment }],
  });
};

module.exports = Studio;