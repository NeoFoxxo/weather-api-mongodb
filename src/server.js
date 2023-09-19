import "dotenv/config";
import express from "express";
import db from "./utils/database.js";
import weatherStationsRoute from "./routes/weatherStations.js";
import usersRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

const { verify } = jwt;

// allows json requests to be read
app.use(express.json());
  
// enable CORS for google
app.use(cors({
    origin: 'https://www.google.com',
    methods: ['GET','POST','DELETE','PUT', 'PATCH']
}));

// use middleware to only allow access to endpoints if the JWT token provided is valid
app.use((req, res, next) => {
  try {
    // first check if the user is trying to login, if they are let them past
    if (req.path != "/auth/login") {
      const authHeader = req.headers['authorization'];

      // split the header so that we only get the JWT token
      const token = authHeader && authHeader.split(' ')[1]
    
      if (token == null) {
        return res.status(401).json({ message: `You are not authorised to access this content` });
      }

      // verify if the token is valid and let the user past
      verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
          return res.status(403).json({ message: `The provided authorization token has expired or is invalid` });
        }
        else {
          req.user = user;
          next();
        }
      });
    }
    else {
      next();
    }
  }
  catch (error) {
    console.log(error)
    return res.status(403).json({ message: `The provided authorization token has expired or is invalid` });
  }
});

// setup all the routes
app.use('/weather-stations', weatherStationsRoute)
app.use('/users', usersRoute);
app.use('/auth', authRoute);

app.get('/', (req, res) => {
  res.send('its working....');
})

app.listen(5000, () => {
    console.log("Server running on port 5000");
})