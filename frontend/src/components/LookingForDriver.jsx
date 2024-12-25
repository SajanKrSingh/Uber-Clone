import React, { useEffect } from "react";
import axios from "axios";

const LookingForDriver = ({
  pickup,
  destination,
  fare,
  vehicleType,
  setVehicleFound,
}) => {
  // Function to send the ride request to the backend
  const sendRideRequest = async () => {
    try {
      // Ensure you retrieve the token from localStorage or cookies
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authorization token is missing");
        return;
      }

      const rideDetails = {
        pickup,
        destination,
        vehicleType,
        fare: fare[vehicleType],
      };

      const response = await axios.post(
        `http://localhost:3000/rides/create`,
        rideDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the headers
          },
        }
      );
      console.log("Ride request sent:", response.data);
    } catch (error) {
      console.error("Error sending ride request:", error);
      console.error("Response:", error.response?.data);
    }
  };

  useEffect(() => {
    if (pickup && destination && vehicleType) {
      sendRideRequest(); // Send ride request when component mounts or inputs are updated
    }
  }, [pickup, destination, vehicleType]);

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => setVehicleFound(false)}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5">Looking for a Driver</h3>

      <div className="flex gap-2 justify-between flex-col items-center">
        <img
          className="h-20"
          src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
          alt=""
        />
        <div className="w-full mt-5">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className="text-lg font-medium">Pickup Location</h3>
              <p className="text-sm -mt-1 text-gray-600">{pickup}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-lg font-medium">Destination</h3>
              <p className="text-sm -mt-1 text-gray-600">{destination}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line"></i>
            <div>
              <h3 className="text-lg font-medium">₹{fare[vehicleType]}</h3>
              <p className="text-sm -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LookingForDriver;
