const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');

module.exports = {
    async createRide(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { pickup, destination, vehicleType } = req.body;

        try {
            const ride = await rideService.createRide({
                user: req.user._id,
                pickup,
                destination,
                vehicleType,
            });
            
            const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

            console.log(`Pickup Coordinates: ${pickupCoordinates.ltd}, ${pickupCoordinates.lng}`);

            const captainsInRadius = await mapService.getCaptainsInTheRadius(
                pickupCoordinates.ltd,
                pickupCoordinates.lng,
                120
            );
            
            console.log('Captains Detected in Radius:', captainsInRadius);

            if (!captainsInRadius.length) {
                console.warn('No captains found in the radius.');
                return res.status(200).json({
                    message: 'No captains available at the moment.',
                    ride
                }); // Return here to avoid resending a response
            }

            // Fetch user-populated ride data
            const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

            // Notify captains in radius
            captainsInRadius.forEach((captain) => {
                console.log(`Captain ${captain._id} has coordinates: ${captain.location.latitude}, ${captain.location.longitude}`);
                if (!captain.socketId) {
                    console.error(`Captain ${captain._id} does not have a socketId.`);
                    return;
                }

                console.log(`Notifying Captain: ${captain._id}, Socket ID: ${captain.socketId}`);
                try {
                    sendMessageToSocketId(captain.socketId, {
                        event: 'new-ride',
                        data: rideWithUser,
                    });
                    console.log(`Message sent successfully to Captain ${captain._id}`);
                } catch (error) {
                    console.error(`Error sending message to Captain ${captain._id}:`, error);
                }
            });

            // Send success response after all operations
            return res.status(201).json({
                message: 'Ride created successfully',
                ride,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    },

    async getFare(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { pickup, destination } = req.query;

        try {
            const fare = await rideService.getFare(pickup, destination);
            return res.status(200).json(fare);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    },

    async confirmRide(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId } = req.body;

        try {
            const ride = await rideService.confirmRide({ rideId, captain: req.captain });

            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-confirmed',
                data: ride,
            });

            return res.status(200).json(ride);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    },

    async startRide(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId, otp } = req.query;

        try {
            const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-started',
                data: ride,
            });

            return res.status(200).json(ride);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    },

    async endRide(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId } = req.body;

        try {
            const ride = await rideService.endRide({ rideId, captain: req.captain });

            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-ended',
                data: ride,
            });

            return res.status(200).json(ride);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    },
};
