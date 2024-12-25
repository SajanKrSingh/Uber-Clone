const captainModel = require('../models/captain.model');

// Create a new captain
module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType, location
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType || !location) {
        throw new Error('All fields, including location, are required');
    }

    // Validate location structure
    if (!location.lng || !location.ltd) {
        throw new Error('Location must include both longitude (lng) and latitude (ltd)');
    }

    // Hash password
    const hashedPassword = await captainModel.hashPassword(password);

    // Create new captain
    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password: hashedPassword,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        },
        location: {
            type: 'Point',
            coordinates: [location.lng, location.ltd], // GeoJSON format
        },
        status: 'inactive', // Initially set as inactive
        socketId: null, // Initially no socketId, will be updated upon connection
    });

    return captain;
};

// Get all active captains
module.exports.getActiveCaptains = async () => {
    try {
        const captains = await captainModel.find({ status: 'active' });
        if (captains.length === 0) {
            console.log('No active captains found');
            return [];
        } else {
            console.log(`Found ${captains.length} active captains`);
            return captains;
        }
    } catch (error) {
        console.error('Error fetching active captains:', error);
        throw new Error('Unable to fetch active captains');
    }
};

// Update captain location
module.exports.updateCaptainLocation = async (captainId, location) => {
    try {
        if (!location || !location.lng || !location.ltd) {
            throw new Error('Location must include both longitude (lng) and latitude (ltd)');
        }

        // Update captain's location
        const updatedCaptain = await captainModel.findByIdAndUpdate(
            captainId,
            { location: { type: 'Point', coordinates: [location.lng, location.ltd] } },
            { new: true }
        );

        if (!updatedCaptain) {
            throw new Error('Captain not found');
        }

        console.log(`Updated location for captain ${captainId}`);
        return updatedCaptain;
    } catch (error) {
        console.error(`Error updating captain location: ${error.message}`);
        throw new Error('Unable to update location');
    }
};
