import express from "express";
import weatherData from "../models/weatherDataModel.js";

const router = express.Router();

// route to insert a new weatherStation
router.post("/", async (req, res) => {  

  try {
    await weatherData.create(req.body)
    res.status(200).json({ message: 'Weather station data added successfully' });
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
})

// Route for inserting multiple sensor readings for an existing weather station
router.post('/:deviceName/readings', async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const sensorReadings = req.body;

    // Find the weather station by its device name
    const weatherStation = await weatherData.find({deviceName: deviceName})

    // If no weather station is found give an error
    if (weatherStation.length === 0) {
      return res.status(404).json({ message: 'Weather station not found' });
    }

    await weatherData.create(req.body)

    console.log(weatherStation)
    
    // // Save the weather station to the database
    // await weatherStation.save();

    res.status(200).json({ message: 'Sensor readings added successfully' });
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});


const weatherStationsRoute = router;
export default weatherStationsRoute;