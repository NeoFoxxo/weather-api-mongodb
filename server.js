import 'dotenv/config';
import express from "express";
import db from "./utils/database.js";

const app = express();

console.log(db.config)

app.get('/', (req, res) => {
    res.send('its working....');
})
  
app.listen(5000, () => {
    console.log(`Server running on port ${5000}`);
})