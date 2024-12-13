const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // No need to define username and password because passport-local-mongoose will auto define it for us;

  // username: {
  //     type: String,
  //     required: true,
  // },
  // password: {
  //     type: String, Number
  // }
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.plugin(passportLocalMongoose);

let User = mongoose.model("User", userSchema);
module.exports = User;
