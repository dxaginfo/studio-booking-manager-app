const asyncHandler = require('express-async-handler');
const { Studio, Equipment, Booking, sequelize } = require('../models');

/**
 * @desc    Get all studios
 * @route   GET /api/studios
 * @access  Public
 */
const getStudios = asyncHandler(async (req, res) => {
  // Query parameters for filtering
  const { available, minRate, maxRate, features } = req.query;
  
  let whereConditions = { isActive: true };
  
  // Add price range filters if provided
  if (minRate) {
    whereConditions.hourlyRate = {
      ...whereConditions.hourlyRate,
      [sequelize.Op.gte]: parseFloat(minRate),
    };
  }
  
  if (maxRate) {
    whereConditions.hourlyRate = {
      ...whereConditions.hourlyRate,
      [sequelize.Op.lte]: parseFloat(maxRate),
    };
  }
  
  // Get all studios matching filters
  const studios = await Studio.findAll({
    where: whereConditions,
    order: [['name', 'ASC']],
  });
  
  // If features filter is provided, filter studios by features
  let filteredStudios = studios;
  if (features) {
    const featureArray = features.split(',');
    filteredStudios = studios.filter(studio => {
      const studioFeatures = studio.features || [];
      return featureArray.every(feature => studioFeatures.includes(feature));
    });
  }
  
  // If available filter is provided, filter studios by availability
  if (available === 'true' && req.query.startTime && req.query.endTime) {
    const { startTime, endTime } = req.query;
    
    // Get bookings that overlap with the requested time
    const bookings = await Booking.findAll({
      where: {
        status: {
          [sequelize.Op.notIn]: ['cancelled'],
        },
        [sequelize.Op.or]: [
          {
            startTime: {
              [sequelize.Op.between]: [startTime, endTime],
            },
          },
          {
            endTime: {
              [sequelize.Op.between]: [startTime, endTime],
            },
          },
          {
            [sequelize.Op.and]: [
              { startTime: { [sequelize.Op.lte]: startTime } },
              { endTime: { [sequelize.Op.gte]: endTime } },
            ],
          },
        ],
      },
      attributes: ['studioId'],
    });
    
    // Get studio IDs that are booked
    const bookedStudioIds = bookings.map(booking => booking.studioId);
    
    // Filter out booked studios
    filteredStudios = filteredStudios.filter(
      studio => !bookedStudioIds.includes(studio.id)
    );
  }
  
  res.json(filteredStudios);
});

/**
 * @desc    Get single studio by ID
 * @route   GET /api/studios/:id
 * @access  Public
 */
const getStudioById = asyncHandler(async (req, res) => {
  const studio = await Studio.findByPk(req.params.id, {
    include: [{ model: Equipment, as: 'equipment' }],
  });

  if (!studio) {
    res.status(404);
    throw new Error('Studio not found');
  }

  res.json(studio);
});

/**
 * @desc    Create a new studio
 * @route   POST /api/studios
 * @access  Private/Admin
 */
const createStudio = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    hourlyRate,
    sizeSqft,
    maxCapacity,
    features,
    imageUrl,
  } = req.body;

  const studio = await Studio.create({
    name,
    description,
    hourlyRate,
    sizeSqft,
    maxCapacity,
    features,
    imageUrl,
  });

  res.status(201).json(studio);
});

/**
 * @desc    Update a studio
 * @route   PUT /api/studios/:id
 * @access  Private/Admin
 */
const updateStudio = asyncHandler(async (req, res) => {
  const studio = await Studio.findByPk(req.params.id);

  if (!studio) {
    res.status(404);
    throw new Error('Studio not found');
  }

  const {
    name,
    description,
    hourlyRate,
    sizeSqft,
    maxCapacity,
    features,
    imageUrl,
    isActive,
  } = req.body;

  studio.name = name || studio.name;
  studio.description = description || studio.description;
  studio.hourlyRate = hourlyRate || studio.hourlyRate;
  studio.sizeSqft = sizeSqft || studio.sizeSqft;
  studio.maxCapacity = maxCapacity || studio.maxCapacity;
  studio.features = features || studio.features;
  studio.imageUrl = imageUrl || studio.imageUrl;
  studio.isActive = isActive !== undefined ? isActive : studio.isActive;

  const updatedStudio = await studio.save();

  res.json(updatedStudio);
});

/**
 * @desc    Delete a studio
 * @route   DELETE /api/studios/:id
 * @access  Private/Admin
 */
const deleteStudio = asyncHandler(async (req, res) => {
  const studio = await Studio.findByPk(req.params.id);

  if (!studio) {
    res.status(404);
    throw new Error('Studio not found');
  }

  // Check if studio has active bookings
  const activeBookings = await Booking.findAll({
    where: {
      studioId: studio.id,
      status: {
        [sequelize.Op.notIn]: ['cancelled', 'completed'],
      },
      startTime: {
        [sequelize.Op.gte]: new Date(),
      },
    },
  });

  if (activeBookings.length > 0) {
    res.status(400);
    throw new Error('Cannot delete studio with active bookings');
  }

  // Use soft delete to keep booking history
  await studio.destroy();

  res.json({ message: 'Studio removed' });
});

/**
 * @desc    Get studio availability
 * @route   GET /api/studios/:id/availability
 * @access  Public
 */
const getStudioAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide start and end dates');
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Validate date range
  if (start >= end) {
    res.status(400);
    throw new Error('End date must be after start date');
  }
  
  // Get bookings for the studio in the date range
  const bookings = await Booking.findAll({
    where: {
      studioId: req.params.id,
      status: {
        [sequelize.Op.notIn]: ['cancelled'],
      },
      [sequelize.Op.or]: [
        {
          startTime: {
            [sequelize.Op.between]: [start, end],
          },
        },
        {
          endTime: {
            [sequelize.Op.between]: [start, end],
          },
        },
        {
          [sequelize.Op.and]: [
            { startTime: { [sequelize.Op.lte]: start } },
            { endTime: { [sequelize.Op.gte]: end } },
          ],
        },
      ],
    },
    order: [['startTime', 'ASC']],
  });
  
  // Format bookings for client
  const formattedBookings = bookings.map(booking => ({
    id: booking.id,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
  }));
  
  res.json(formattedBookings);
});

module.exports = {
  getStudios,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
  getStudioAvailability,
};