const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Bookings',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'refunded', 'failed'),
      defaultValue: 'pending',
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    refundDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentIntentId: {
      type: DataTypes.STRING, // For Stripe integration
      allowNull: true,
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      afterCreate: async (payment) => {
        // Update booking payment status when payment is created
        if (payment.status === 'completed') {
          const Booking = sequelize.models.Booking;
          const booking = await Booking.findByPk(payment.bookingId);
          
          if (booking) {
            // Check if payment amount matches booking total price
            if (parseFloat(payment.amount) === parseFloat(booking.totalPrice)) {
              booking.paymentStatus = 'completed';
            } else if (parseFloat(payment.amount) < parseFloat(booking.totalPrice)) {
              booking.paymentStatus = 'partial';
            }
            await booking.save();
          }
        }
      },
      afterUpdate: async (payment) => {
        // Update booking payment status when payment is updated
        if (payment.changed('status') && payment.status === 'refunded') {
          const Booking = sequelize.models.Booking;
          const booking = await Booking.findByPk(payment.bookingId);
          
          if (booking) {
            booking.paymentStatus = 'refunded';
            await booking.save();
          }
        }
      },
    },
  }
);

// Instance methods
Payment.prototype.processRefund = async function (amount) {
  // In a real application, you would integrate with payment gateway API
  this.refundedAmount = amount || this.amount;
  this.refundDate = new Date();
  this.status = 'refunded';
  return await this.save();
};

// Class methods
Payment.findByBooking = function (bookingId) {
  return this.findAll({
    where: { bookingId },
    order: [['createdAt', 'DESC']],
  });
};

Payment.findByUser = async function (userId) {
  const Booking = sequelize.models.Booking;
  const bookings = await Booking.findAll({
    where: { userId },
    attributes: ['id'],
  });
  
  const bookingIds = bookings.map(booking => booking.id);
  
  return this.findAll({
    where: {
      bookingId: {
        [sequelize.Op.in]: bookingIds,
      },
    },
    order: [['createdAt', 'DESC']],
    include: [{ model: Booking, attributes: ['startTime', 'endTime', 'studioId'] }],
  });
};

module.exports = Payment;