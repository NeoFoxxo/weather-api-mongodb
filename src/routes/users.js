import express from "express";
import User from "../models/userDataModel.js";
import * as bcrypt from 'bcrypt';

const router = express.Router();

// route to create a new user
router.post("/", async (req, res) => {  

  try {
    if (!req.body.password){
      return res.status(400).json({ message: `Password required!` });
    }
    
    // hash password as usual
    const hashedPassword = await bcrypt.hash(req.body.password, 8);

    await User.create({
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role
    });
    
    res.status(200).json({ message: `User ${req.body.username} added successfully` });
  } 
  catch (error) {
    // if the mongoose validation fails throw a 400 error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    // this error code is thrown when a username is not unique
    if (error.code === 11000) {
      return res.status(400).json({ message: `username '${req.body.username}' is already taken` });
    }
    res.status(500).json({ messsage: error.message })
  }
});

// route to delete a user
router.delete("/delete/:id", async (req, res) => {  

  const userID = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userID)

    // if no user is found with that id give an error
    if (deletedUser === null) {
      return res.status(404).json({ message: `User with ID: '${userID}' was not found` });
    }

    res.status(200).json({ message: `User ${deletedUser.username} deleted successfully` });
  } 
  catch (error) {

    // if the user gives an incorrectly formatted user id give a specific error
    if (error.name === 'CastError') {
      return res.status(400).json({ message: `The user ID provided is not valid` });
    }

    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

// route to change the role of all users in a specific date range
router.put("/roles", async (req, res) => {  

  const validRoles = ['admin', 'teacher', 'student'];

  try { 
    const rawStartDate = req.body.startDate;
    const rawEndDate = req.body.endDate;
    const newRole = req.body.role;

    // check if the user has given a valid role and throw a 400 if they haven't
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid Role! Role must be admin, teacher, or student" }); 
    }

    // convert dates
    const startDate = new Date(rawStartDate)
    const endDate = new Date(rawEndDate);

    // query to the ids of the accounts in the date range
    const accounts = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $project: { _id: 1 } }
    ]);

    // throw a 404 if no accounts are found
    if (accounts.length === 0) {
      return res.status(404).json({ message: `No accounts created in the provided date range` });
    }

    // loop over the account id's found in the first query and update their roles to the new role
    const result = await User.updateMany(
      { _id: { $in: accounts.map(account => account._id) } },
      { role: newRole }
    );

    res.status(200).json({ message: `${result.modifiedCount} accounts changed to the ${newRole} role successfully` });
  }  
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

// route to retrieve all admin users
router.get("/admin", async (req, res) => {  

  try { 
    // retrieve all admin users from the database
    const adminUsers = await User.find({ role: "admin" });

    // throw a 404 if no admin accounts are found
    if (adminUsers.length === 0) {
      return res.status(404).json({ message: `No admin accounts were found` });
    }

    // return the admin users as a JSON response
    res.status(200).json(adminUsers);
  }  
  catch (error) {
    console.log(error.message);
    res.status(500).json({ messsage: error.message })
  }
});

const usersRoute = router;
export default usersRoute;