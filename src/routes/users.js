import express from "express";
import User from "../models/userDataModel.js";
import * as bcrypt from "bcrypt";

const router = express.Router();

// route to create a new user
router.post("/", async (req, res) => {  

  // check if the user is authorised to create a new user
  if (req.user.role === "admin") {
    
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
        return res.status(409).json({ message: `username '${req.body.username}' is already taken` });
      }
      res.status(500).json({ messsage: error.message })
    }
  }
  else {
    return res.status(401).json({ message: `You are not authorised to access this content` });
  }
});

// route to delete a user
router.delete("/delete/:id", async (req, res) => {  

  // check if the user is authorised to delete a user
  if (req.user.role === "admin") {
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
  }
  else {
    return res.status(401).json({ message: `You are not authorised to access this content` });
  }
});

// endpoint to delete multiple students in a date range of when the last logged in
router.delete("/delete-students", async (req, res) => {  

  // check if the user is authorised to delete a user
  if (req.user.role === "admin") {

    try { 
      const rawStartDate = req.query.startDate;
      const rawEndDate = req.query.endDate;

      // do some validation
      if (!rawStartDate) {
        return res.status(400).json({ message: `startDate is required` });
      }
      
      if (!rawEndDate) {
        return res.status(400).json({ message: `endDate is required` });
      }

      // convert dates
      const startDate = new Date(rawStartDate)
      const endDate = new Date(rawEndDate);

      // query get only the ids of the student accounts in the date range
      const students = await User.aggregate([
        { $match: { lastSession: { $gte: startDate, $lt: endDate }, role: "student" } },
        { $project: { _id: 1 } }
      ]);

      // throw a 404 if no accounts are found
      if (students.length === 0) {
        return res.status(404).json({ message: `No student accounts active in the provided date range` });
      }

      // loop over the students id's found in the first query and delete them
      const result = await User.deleteMany(
        { _id: { $in: students.map(student => student._id) } }
      );

      res.status(200).json({ message: `${result.deletedCount} student accounts deleted successfully` });
    }  
    catch (error) {
      console.log(error.message);
      res.status(500).json({ messsage: error.message })
    }
  }
  else {
    return res.status(401).json({ message: `You are not authorised to access this content` });
  }
});


// route to change the role of all users in a specific date range
router.put("/roles", async (req, res) => {  

  // check if the user is authorised to delete a user
  if (req.user.role === "admin") {

    const validRoles = ['admin', 'teacher', 'student'];

    try { 
      const rawStartDate = req.body.startDate;
      const rawEndDate = req.body.endDate;
      const newRole = req.body.role;

      // do some validation
      if (!rawStartDate) {
        return res.status(400).json({ message: `startDate is required` });
      }
      
      if (!rawEndDate) {
        return res.status(400).json({ message: `endDate is required` });
      }
      
      if (!newRole) {
        return res.status(400).json({ message: `Role is required` });
      }

      // check if the user has given a valid role and throw a 400 if they haven't
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({ message: "Invalid Role! Role must be admin, teacher, or student" }); 
      }

      // convert dates
      const startDate = new Date(rawStartDate)
      const endDate = new Date(rawEndDate);

      // query to get the ids of the accounts in the date range
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
  }
  else {
    return res.status(401).json({ message: `You are not authorised to access this content` });
  }
});

// route to retrieve all admin users
router.get("/admin", async (req, res) => {  

  const limitRaw = req.query.limit;

  // check if the limit is provided and if it is NOT an integer then throw a 400 error
  if (limitRaw && !Number.isInteger(parseInt(limitRaw))) {
    return res.status(400).json({ message: "Limit must be an integer" }); 
  } 

  // convert the limit to an integer
  const limit = parseInt(limitRaw);

  // check if the user is authorised to view all admin accounts
  if (req.user.role === "admin") {
    try { 
      
      let adminUsers;

      // if the user has provided a limit, use it.
      if (limit) {
        // retrieve all admin users from the database
        adminUsers = await User.find({ role: "admin" }).limit(limit);
      }
      else {
        // retrieve all admin users from the database
        adminUsers = await User.find({ role: "admin" });
      }

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
  }
  else {
    return res.status(401).json({ message: `You are not authorised to access this content` });
  }
});

const usersRoute = router;
export default usersRoute;