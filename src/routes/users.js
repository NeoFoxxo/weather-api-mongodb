import express from "express";
import weatherData from "../models/weatherDataModel.js";

const router = express.Router();

router.post("/", async (req, res) => {  

  try {
    const user = await weatherData.create(req.body)
    res.status(200).json(weatherStation)
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
})

const weatherStationsRoute = router;
export default weatherStationsRoute;