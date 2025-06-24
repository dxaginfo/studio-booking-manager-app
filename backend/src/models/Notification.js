const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define(
  'Notification',
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
    bookingId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Bookings',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('confirmation', 'reminder', 'cancellation', 'payment', 'general'),
      defaultValue: 'general',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deliveryMethod: {
      type: DataTypes.ENUM('in-app', 'email', 'sms', 'all'),
      defaultValue: 'in-app',
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    smsSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

// Instance methods
Notification.prototype.markAsRead = function () {
  this.isRead = true;
  return this.save();
};

Notification.prototype.markAsEmailSent = function () {
  this.emailSent = true;
  return this.save();
};

Notification.prototype.markAsSmsSent = function () {
  this.smsSent = true;
  return this.save();
};

// Class methods
Notification.findByUser = function (userId, options = {}) {
  const { limit = 20, offset = 0, includeRead = false } = options;
  
  const whereClause = { userId };
  
  if (!includeRead) {
    whereClause.isRead = false;
  }
  
  return this.findAll({
    where: whereClause,
    order: [['sentAt', 'DESC']],
    limit,
    offset,
  });
};

Notification.findByBooking = function (bookingId) {
  return this.findAll({
    where: { bookingId },
    order: [['sentAt', 'DESC']],
  });
};

Notification.markAllAsRead = async function (userId) {
  return await this.update(
    { isRead: true },
    {
      where: {
        userId,
        isRead: false,
      },
    }
  );
};

// Static methods for creating different types of notifications
Notification.createBookingConfirmation = async function (booking, user) {
  const studio = await sequelize.models.Studio.findByPk(booking.studioId);
  
  return await this.create({
    userId: booking.userId,
    bookingId: booking.id,
    type: 'confirmation',
    title: 'Booking Confirmed',
    content: `Your booking for ${studio.name} on ${new Date(booking.startTime).toLocaleString()} has been confirmed.`,
    deliveryMethod: 'all',
  });
};

Notification.createBookingReminder = async function (booking, user) {
  const studio = await sequelize.models.Studio.findByPk(booking.studioId);
  
  return await this.create({
    userId: booking.userId,
    bookingId: booking.id,
    type: 'reminder',
    title: 'Upcoming Booking Reminder',
    content: `Reminder: Your session at ${studio.name} is scheduled for ${new Date(booking.startTime).toLocaleString()}.`,
    deliveryMethod: 'all',
  });
};

Notification.createBookingCancellation = async function (booking, user) {
  const studio = await sequelize.models.Studio.findByPk(booking.studioId);
  
  return await this.create({
    userId: booking.userId,
    bookingId: booking.id,
    type: 'cancellation',
    title: 'Booking Cancelled',
    content: `Your booking for ${studio.name} on ${new Date(booking.startTime).toLocaleString()} has been cancelled.`,
    deliveryMethod: 'all',
  });
};

Notification.createPaymentConfirmation = async function (payment, booking, user) {
  return await this.create({
    userId: booking.userId,
    bookingId: booking.id,
    type: 'payment',
    title: 'Payment Received',
    content: `Your payment of $${payment.amount} for booking #${booking.id.substring(0, 8)} has been processed successfully.`,
    deliveryMethod: 'all',
  });
};

module.exports = Notification;