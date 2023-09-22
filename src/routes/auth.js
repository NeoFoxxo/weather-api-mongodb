import express from "express";
import User from "../models/userDataModel.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const { sign } = jwt;

// login the user and sign a JWT
router.post('/login', async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password){
    return res.status(400).json({ message: `Please provide both a username and password` });
  }

  try {
    // see if a user with that username exists
    const existingUser = await User.findOne({ username: username })

    if (existingUser) {

      // compare the login password with the hashed customer password
      bcrypt.compare(password, existingUser.password, async (err, match) => {

        // if the password is correct sign a JWT token
        if (match) {

          // store only the username and role in the JWT
          const user = { username: existingUser.username, role: existingUser.role }

          // create JWT and make it expire after 1 hour
          const accessToken = sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

          // update the lastSession value to the current date since the user successfully logged in
          await User.updateOne({ _id: existingUser._id }, { lastSession: Date.now() })

          res.status(200).json({ message: `${username} successfully logged in`, accessToken: accessToken });
        } 

        else {
          res.status(401).json({ message: "Invalid account credentials" });
        }

      });
    } 
    else {
      return res.status(404).json({ message: `Account with username ${username} was not found` });
    }
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

const authRoute = router;
export default authRoute;