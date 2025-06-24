const sequelize = require('../config/database');
const User = require('./User');
const Studio = require('./Studio');
const Booking = require('./Booking');
const Equipment = require('./Equipment');
const Payment = require('./Payment');
const Notification = require('./Notification');

// Define associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Studio.hasMany(Booking, { foreignKey: 'studioId', as: 'bookings' });
Booking.belongsTo(Studio, { foreignKey: 'studioId', as: 'studio' });

Studio.hasMany(Equipment, { foreignKey: 'studioId', as: 'equipment' });
Equipment.belongsTo(Studio, { foreignKey: 'studioId', as: 'studio' });

Booking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Booking.hasMany(Notification, { foreignKey: 'bookingId', as: 'notifications' });
Notification.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Define scopes

// User scopes
User.addScope('withBookings', {
  include: [{ model: Booking, as: 'bookings' }],
});

User.addScope('withNotifications', {
  include: [{ model: Notification, as: 'notifications' }],
});

// Studio scopes
Studio.addScope('withEquipment', {
  include: [{ model: Equipment, as: 'equipment' }],
});

Studio.addScope('withBookings', {
  include: [{ model: Booking, as: 'bookings' }],
});

// Booking scopes
Booking.addScope('withStudio', {
  include: [{ model: Studio, as: 'studio' }],
});

Booking.addScope('withUser', {
  include: [{ model: User, as: 'user' }],
});

Booking.addScope('withPayments', {
  include: [{ model: Payment, as: 'payments' }],
});

Booking.addScope('withNotifications', {
  include: [{ model: Notification, as: 'notifications' }],
});

Booking.addScope('complete', {
  include: [
    { model: Studio, as: 'studio' },
    { model: User, as: 'user' },
    { model: Payment, as: 'payments' },
    { model: Notification, as: 'notifications' },
  ],
});

// Module exports
module.exports = {
  sequelize,
  User,
  Studio,
  Booking,
  Equipment,
  Payment,
  Notification,
};