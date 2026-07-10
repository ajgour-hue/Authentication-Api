import  {config}  from "./config.js";
import mongoose from "mongoose";


// Function to connect to DB 
const connecToDB  = async () => {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to MongoDB");
   
}

export default connecToDB
