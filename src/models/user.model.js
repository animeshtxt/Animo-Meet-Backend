import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, requierd: true },
  token: { type: String },
});

const User = mongoose.model("User", UserSchema);
export { User };
