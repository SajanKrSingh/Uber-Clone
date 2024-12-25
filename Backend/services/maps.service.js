const axios = require("axios");
const captainModel = require("../models/captain.model");

const apiKey = process.env.GOOGLE_MAPS_API;
if (!apiKey) {
  throw new Error("Google Maps API key is not configured");
}

module.exports.getAddressCoordinate = async (address) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
      };
    } else {
      console.error(`Google API Error: ${JSON.stringify(response.data)}`);
      throw new Error("Unable to fetch coordinates: " + response.data.status);
    }
  } catch (error) {
    console.error(
      `Error fetching coordinates for address: ${address}`,
      error.message
    );
    throw new Error(`Error fetching coordinates: ${error.message}`);
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const element = response.data.rows[0].elements[0];
      if (element.status === "ZERO_RESULTS") {
        console.warn(`No routes found from ${origin} to ${destination}`);
        return null; // Return null instead of throwing
      }
      return element;
    } else {
      console.error(`Google API Error: ${JSON.stringify(response.data)}`);
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error(
      `Error fetching distance and time for ${origin} to ${destination}`,
      err.message
    );
    throw new Error(`Error fetching distance and time: ${err.message}`);
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("Query input is required");
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      return response.data.predictions
        .map((prediction) => prediction.description)
        .filter((value) => value);
    } else {
      console.error(`Google API Error: ${JSON.stringify(response.data)}`);
      throw new Error("Unable to fetch suggestions");
    }
  } catch (err) {
    console.error(
      `Error fetching autocomplete suggestions for input: ${input}`,
      err.message
    );
    throw new Error(`Error fetching suggestions: ${err.message}`);
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
  if (!ltd || !lng || !radius) {
    throw new Error("Latitude, Longitude, and Radius are required");
  }

  try {
    console.log(
      `Searching captains at Latitude: ${ltd}, Longitude: ${lng}, Radius: ${radius} km`
    );
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, ltd], radius / 6371], // Radius in kilometers
        },
      },
    });

    if (captains.length === 0) {
      console.warn("No captains found in the specified radius");
      return []; // Return empty array instead of throwing
    }

    return captains;
  } catch (err) {
    console.error(
      `Error fetching captains in the radius with Latitude: ${ltd}, Longitude: ${lng}, Radius: ${radius}`,
      err.message
    );
    throw new Error(`Error fetching captains in the radius: ${err.message}`);
  }
};
