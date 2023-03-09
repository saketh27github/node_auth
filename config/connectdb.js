import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
        const DB_OPTIONS = {
            dbName: "ExpressAuth"
        }
        mongoose.set("strictQuery", false);
        await mongoose.connect(DATABASE_URL, DB_OPTIONS)
        console.log("Database is connected")

    } catch (err) {
        console.log(err);
    }
}
export default connectDB;
