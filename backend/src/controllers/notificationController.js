const asyncHandler = require('express-async-handler');
const { Notification } = require('../models');

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const includeRead = req.query.includeRead === 'true';

  const notifications = await Notification.findByUser(req.user.id, {
    limit,
    offset,
    includeRead,
  });

  // Get total count for pagination
  const count = await Notification.count({
    where: {
      userId: req.user.id,
      ...(includeRead ? {} : { isRead: false }),
    },
  });

  res.json({
    notifications,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check if notification belongs to user
  if (notification.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  notification.isRead = true;
  await notification.save();

  res.json({ message: 'Notification marked as read' });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user.id);

  res.json({ message: 'All notifications marked as read' });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check if notification belongs to user
  if (notification.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  await notification.destroy();

  res.json({ message: 'Notification removed' });
});

/**
 * @desc    Create notification (Admin/Staff only)
 * @route   POST /api/notifications
 * @access  Private/Admin/Staff
 */
const createNotification = asyncHandler(async (req, res) => {
  const { userId, bookingId, type, title, content, deliveryMethod } = req.body;

  const notification = await Notification.create({
    userId,
    bookingId,
    type: type || 'general',
    title,
    content,
    deliveryMethod: deliveryMethod || 'in-app',
  });

  res.status(201).json(notification);
});

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
};