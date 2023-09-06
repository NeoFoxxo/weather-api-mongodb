import mongoose from "mongoose";
const { Schema } = mongoose;

const weatherDataSchema = new Schema({
  deviceName: {
    type: String,
    required: [true, "device name is required"]
  },
  precipitation: {
    type: Number,
    double: true,
    required: [true, "precipitation is required"]
  },
  atmosphericPressure: {
    type: Number,
    double: true,
    required: [true, "atmospheric pressure is required"]
  },
  latitude: {
    type: Number,
    double: true,
    required: [true, "latitude is required"]
  },
  longitude: {
    type: Number,
    double: true,
    required: [true, "longitude is required"]
  },
  temperature: {
    type: Number,
    double: true,
    required: [true, "temperature is required"]
  },
  time: {
    type: Date,
    required: [true, "time is required"]
  },
  humidity: {
    type: Number,
    double: true,
    required: [true, "humidity is required"]
  },
  maxWindSpeed: {
    type: Number,
    double: true,
    required: [true, "max wind speed is required"]
  },
  solarRadiation: {
    type: Number,
    double: true,
    required: [true, "solar radiation is required"]
  },
  vaporPressure: {
    type: Number,
    double: true,
    required: [true, "vapor pressure is required"]
  },
  windDirection: {
    type: Number,
    double: true,
    required: [true, "wind direction is required"]
  },
})
                                                                    // collection name
const weatherData = mongoose.model("weatherData", weatherDataSchema, "weatherData");

export default weatherData;