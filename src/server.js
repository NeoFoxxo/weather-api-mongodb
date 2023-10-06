import "dotenv/config";
import express from "express";
import db from "./utils/database.js";
import weatherStationsRoute from "./routes/weatherStations.js";
import usersRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import User from "./models/userDataModel.js";
import https from "https";
import fs from "fs";

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
      verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, user) => {

        let existingUser;
        
        // check if the account stored in the JWT actually still exists
        if (user) {
          existingUser = await User.findOne({ username: user.username })
        }

        if (error) {
          return res.status(403).json({ message: `The provided authorization token has expired or is invalid` });
        }
        // if the account does exist let the user through
        else if (existingUser) {
          req.user = user;
          next();
        }
        // else the account must not exist and the JWT was for a deleted account
        else {
          return res.status(403).json({ message: `The provided authorization token has expired or is invalid` });
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

// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
})

// uncomment if using https

// const server = https.createServer({
//     key: fs.readFileSync("./https/private.key"),
//     cert: fs.readFileSync("./https/certificate.crt")
// }, app);

// start the server with https
// server.listen(443, () => {
//     console.log("server listening on port 443 https://localhost");
// });