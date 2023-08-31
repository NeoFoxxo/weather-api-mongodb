import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL)

.then(() => {
  mongoose.set("strictQuery", false);
  console.log("connected to database")
})

.catch((error) => {
  console.log(`error connecting to database ${error}`)
});

const db = mongoose.connection;

// export so that we can connect to the database from any file
export default db;