import mongoose from "mongoose";
const { Schema } = mongoose;

const validRoles = ['admin', 'teacher', 'student'];

const userDataSchema = new Schema({

  username: {
    type: String,
    required: [true, "username is required"],
    // username will be converted to lowercase once submitted
    lowercase: true,
    // username must be unique
    unique: true
  },
  password: {
    type: String,
    required: [true, "password is required"]
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    // make sure that a correct role is provided
    validate: {
      validator: function(value) {
        return validRoles.includes(value);
      },
      message: "Invalid Role! Role must be admin, teacher, or student"
    }
  },
  lastSession: {
    type: Date,
    default: Date.now
  },
  
},
{ timestamps: true })
                                                  // collection name
const User = mongoose.model("User", userDataSchema, "users");

export default User;