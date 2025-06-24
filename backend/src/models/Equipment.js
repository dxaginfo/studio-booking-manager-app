const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define(
  'Equipment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studioId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Studios',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('available', 'in-use', 'maintenance'),
      defaultValue: 'available',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true, // Enables soft deletes
  }
);

// Instance methods
Equipment.prototype.markAsInUse = function () {
  this.status = 'in-use';
  return this.save();
};

Equipment.prototype.markAsAvailable = function () {
  this.status = 'available';
  return this.save();
};

Equipment.prototype.markForMaintenance = function () {
  this.status = 'maintenance';
  this.lastMaintenanceDate = new Date();
  return this.save();
};

// Class methods
Equipment.findAvailable = function (studioId) {
  return this.findAll({
    where: {
      studioId,
      status: 'available',
      quantity: {
        [sequelize.Op.gt]: 0,
      },
    },
  });
};

Equipment.findByCategory = function (category) {
  return this.findAll({
    where: {
      category,
      quantity: {
        [sequelize.Op.gt]: 0,
      },
    },
  });
};

module.exports = Equipment;