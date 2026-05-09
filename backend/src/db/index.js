import mongoose from "mongoose";
const connectDB= async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGO DB connected");
    }
    catch(e){
        console.log("Mongo DB connection error", e);
        process.exit(1);
    }
}
export default connectDB;