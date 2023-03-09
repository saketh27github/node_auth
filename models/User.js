import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: { type: String },
    email: { type: String },
    password: { type: String },
    ts: { type: Boolean }

})
const UserModel = mongoose.model("user", userSchema);
export default UserModel;