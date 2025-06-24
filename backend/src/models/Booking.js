const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    studioId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Studios',
        key: 'id',
      },
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterStart(value) {
          if (new Date(value) <= new Date(this.startTime)) {
            throw new Error('End time must be after start time');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'partial', 'completed', 'refunded'),
      defaultValue: 'pending',
    },
  },
  {
    timestamps: true,
    paranoid: true, // Enables soft deletes
    hooks: {
      beforeCreate: async (booking) => {
        // Check for overlapping bookings
        const existingBooking = await Booking.findOne({
          where: {
            studioId: booking.studioId,
            status: {
              [sequelize.Op.notIn]: ['cancelled'],
            },
            [sequelize.Op.or]: [
              {
                startTime: {
                  [sequelize.Op.between]: [booking.startTime, booking.endTime],
                },
              },
              {
                endTime: {
                  [sequelize.Op.between]: [booking.startTime, booking.endTime],
                },
              },
              {
                [sequelize.Op.and]: [
                  { startTime: { [sequelize.Op.lte]: booking.startTime } },
                  { endTime: { [sequelize.Op.gte]: booking.endTime } },
                ],
              },
            ],
          },
        });

        if (existingBooking) {
          throw new Error('The studio is already booked during this time');
        }
      },
    },
  }
);

// Instance methods
Booking.prototype.getDuration = function () {
  return (new Date(this.endTime) - new Date(this.startTime)) / (1000 * 60 * 60); // Duration in hours
};

Booking.prototype.calculatePrice = async function () {
  const Studio = sequelize.models.Studio;
  const studio = await Studio.findByPk(this.studioId);
  
  if (!studio) {
    throw new Error('Studio not found');
  }
  
  const hourlyRate = parseFloat(studio.hourlyRate);
  const duration = this.getDuration();
  
  this.totalPrice = hourlyRate * duration;
  return this.totalPrice;
};

// Class methods
Booking.findByUser = function (userId) {
  return this.findAll({
    where: { userId },
    order: [['startTime', 'DESC']],
  });
};

Booking.findByStudio = function (studioId) {
  return this.findAll({
    where: { studioId },
    order: [['startTime', 'ASC']],
  });
};

Booking.findUpcoming = function (userId) {
  return this.findAll({
    where: {
      userId,
      startTime: {
        [sequelize.Op.gt]: new Date(),
      },
      status: {
        [sequelize.Op.notIn]: ['cancelled'],
      },
    },
    order: [['startTime', 'ASC']],
  });
};

module.exports = Booking;