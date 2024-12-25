const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

/**
 * Initializes the WebSocket server and sets up event listeners.
 * @param {Object} server - The HTTP server instance.
 */
function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173", // Update to your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    /**
     * Event: Join (register user or captain with optional location).
     */
    socket.on("join", async ({ userId, userType, location }) => {
      try {
        if (!userId || !userType) {
          console.error("Missing userId or userType in join event");
          return;
        }

        // Handle Captain Connection with Location Update
        if (userType === "captain") {
          if (!location || !location.latitude || !location.longitude) {
            console.error("Missing location details for captain.");
            return;
          }

          await captainModel.findByIdAndUpdate(
            userId,
            {
              socketId: socket.id,
              location: {
                type: "Point",
                coordinates: [location.longitude, location.latitude], // GeoJSON format
              },
            },
            { new: true }
          );

          console.log(
            `Captain ${userId} connected with Socket ID: ${socket.id} and location updated.`
          );
        }
        // Handle User Connection
        else if (userType === "user") {
          await userModel.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true }
          );

          console.log(`User ${userId} connected with Socket ID: ${socket.id}`);
        }
        // Invalid UserType
        else {
          console.warn(
            `Invalid userType "${userType}" provided in join event.`
          );
        }
      } catch (err) {
        console.error(
          `Error updating socketId/location for ${userType}: ${err.message}`
        );
      }
    });

    /**
     * Event: New Ride (emit to captains in proximity).
     */
    socket.on("new-ride", async ({ rideId, userId, location }) => {
      try {
        // Emit the ride request to the user for confirmation
        const user = await userModel.findById(userId);
        if (user?.socketId) {
          io.to(user.socketId).emit("new-ride", { rideId });
          console.log(`Ride ${rideId} emitted to user ${userId}`);
        } else {
          console.error(`User ${userId} not found or socketId missing.`);
        }

        // Find nearby captains using geospatial queries
        const captains = await captainModel.find({
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [location.longitude, location.latitude],
              },
              $maxDistance: 5000, // Max distance in meters (5 km)
            },
          },
        });

        if (captains.length > 0) {
          captains.forEach((captain) => {
            if (captain.socketId) {
              io.to(captain.socketId).emit("new-ride", { rideId, location });
              console.log(`Ride ${rideId} emitted to captain ${captain._id}`);
            }
          });
        } else {
          console.log("No captains found within the specified radius.");
        }
      } catch (err) {
        console.error(`Error processing new ride request: ${err.message}`);
      }
    });

    /**
     * Event: Ride Status Update (accept/reject ride).
     */
    socket.on(
      "ride-status-update",
      async ({ rideId, status, userId, captainId }) => {
        try {
          const user = await userModel.findById(userId);
          const captain = await captainModel.findById(captainId);

          // Notify the user about the ride status
          if (user?.socketId) {
            io.to(user.socketId).emit("ride-status-update", { rideId, status });
          }

          // Notify the captain about the ride status
          if (captain?.socketId) {
            io.to(captain.socketId).emit("ride-status-update", {
              rideId,
              status,
            });
          }

          console.log(`Ride ${rideId} status updated to ${status}`);
        } catch (err) {
          console.error(`Error sending ride status update: ${err.message}`);
        }
      }
    );

    /**
     * Event: Disconnect (cleanup).
     */
    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      try {
        // Clear socketId for both users and captains
        await userModel.updateMany(
          { socketId: socket.id },
          { $unset: { socketId: 1 } }
        );
        await captainModel.updateMany(
          { socketId: socket.id },
          { $unset: { socketId: 1 } }
        );
      } catch (err) {
        console.error(`Error during disconnect cleanup: ${err.message}`);
      }
    });
  });
}

/**
 * Utility function to send a message to a specific socket ID.
 * @param {string} socketId - The socket ID of the recipient.
 * @param {Object} messageObject - The message object containing event and data.
 */
const sendMessageToSocketId = (socketId, messageObject) => {
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
    console.log(`Message sent to Socket ID: ${socketId}`);
  } else {
    console.error("Socket.io instance not initialized.");
  }
};

module.exports = { initializeSocket, sendMessageToSocketId };
