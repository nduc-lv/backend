import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {type: String, require: true},
  gender: {type: Number, require: true},
  language: {type: Number, require: true},
  email: {type: String, require: true},
  password: {type: String, require: true},
  token: {type: String, require: true},
  followed: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  age: {type: Number, require: true},
  sexualInterests: {type: Number, require: true}
});

export default mongoose.model("User", UserSchema);