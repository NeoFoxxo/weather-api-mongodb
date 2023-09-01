import 'dotenv/config';
import express from "express";
import db from "./utils/database.js";
import weatherStationsRoute from './routes/weatherStations.js';

const app = express();

// allows json requests to be read
app.use(express.json());

app.use('/weather-stations', weatherStationsRoute);

app.get('/', (req, res) => {
    res.send('its working....');
})
  
app.listen(5000, () => {
    console.log("Server running on port 5000");
})