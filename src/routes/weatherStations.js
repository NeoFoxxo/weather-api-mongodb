import express from "express";
import weatherData from "../models/weatherDataModel.js";

const router = express.Router();

// route to insert a new weatherStation
router.post("/", async (req, res) => {  
  try {
    await weatherData.create(req.body)
    res.status(200).json({ message: `Weather station ${req.body.deviceName} added successfully` });
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
})

// route to inserting multiple sensor readings for a specific weather station
router.post("/:deviceName", async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
   
    // Find the weather station by its device name
    const weatherStation = await weatherData.find({ deviceName: deviceName })

    // If no weather station is found give an error
    if (weatherStation.length === 0) {
      return res.status(404).json({ message: `Weather station '${deviceName}' not found` });
    }

    const insertedData = await weatherData.create(req.body);

    console.log(insertedData)

    res.status(200).json({ message: `${req.body.length} ${deviceName} sensor readings added successfully` });
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

// route to find the maximum precipitation recorded in the last 5 months for a specific sensor
router.get("/:deviceName/max-precipitation", async (req, res) => {
  try {
    const deviceName = req.params.deviceName;

    // get the month 5 months ago
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    // query to get maximum precipitation recorded in that last 5 month period
    const result = await weatherData.aggregate([
      { $match: { deviceName, time: { $gte: fiveMonthsAgo } } },
      { $group: { _id: '$deviceName', maxPrecipitation: { $max: '$precipitation' }, time: { $last: '$time' } } }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: `No data found for '${deviceName}' in the last 5 months` });
    }

    // get the max precipiatation and the time from the first result
    const { maxPrecipitation, time } = result[0];
    
    res.json({ deviceName, maxPrecipitation, time });
  }  
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

// route to get temperature, atmospheric pressure, radiation and precipitation from a sensor on a specific date
router.get("/:deviceName/readings/:date", async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const rawDate = req.params.date;

    // convert the provided date to a Date object so it can be used in the query
    const date = new Date(rawDate)

    // query to get readings from a sensor on the provided date
    const result = await weatherData.aggregate([
      { $match: { deviceName, time: { $eq: date } } }
    ]);

    console.log(result)

    if (result.length === 0) {
      return res.status(404).json({ message: `No data found for '${deviceName}' at ${date}` });
    }

    // get the max precipiatation and the time from the first result
    const { temperature, atmosphericPressure, solarRadiation, precipitation } = result[0];

    res.json({ temperature, atmosphericPressure, solarRadiation, precipitation });
  }  
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

// route to get max temperature out of all stations in a specific date range
router.get("/max-temperature", async (req, res) => {
  try {
    
    // get start and end dates from the query params
    const rawStartDate = req.query.startDate;
    const rawEndDate = req.query.endDate;

    // convert dates
    const startDate = new Date(rawStartDate)
    const endDate = new Date(rawEndDate);

    // query to get the max temperature from all documents in the date range
    const result = await weatherData.aggregate([
      { $match: { time: { $gte: startDate, $lt: endDate } } },

      // get all results in descending order
      { $sort: { temperature: -1 } },

      // only get the first result (the highest temperature)
      { $limit: 1 },

      // show the device name and the max temperature of it
      { $project: { deviceName: 1, maxTemperature: '$temperature' } }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: `No data found in the provided date range` });
    }

    // get the max precipiatation and the time from the first result
    const { deviceName, maxTemperature } = result[0];

    res.json({ deviceName, maxTemperature });
  }  
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

// route to update the precipitation value of a specific document
router.post("/:entryID/precipitation", async (req, res) => {

  const entryID = req.params.entryID;
  const newPrecipitation = req.body.precipitation;

  try {
    const weatherStation = await weatherData.findByIdAndUpdate(entryID, { precipitation: newPrecipitation })
    
    console.log(weatherStation);

    // if no user is found with that id give an error
    if (weatherStation === null) {
      return res.status(404).json({ message: `Weather station entry with ID: '${entryID}' was not found` });
    }
    
    res.status(200).json({ message: `Precipiatation of the ${weatherStation.deviceName} entry was successfully updated to ${req.body.precipitation}` });
  } 
  catch (error) {

    // if the user gives an incorrectly formatted user id give a specific error
    if (error.name === 'CastError') {
      return res.status(500).json({ message: `The entry ID provided is not valid` });
    }

    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

const weatherStationsRoute = router;
export default weatherStationsRoute;