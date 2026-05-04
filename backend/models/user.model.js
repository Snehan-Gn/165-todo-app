const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer un email valide']
    },
    password: {
      type: String,
      required: true
    },
    name: String,
    address: String,
    zip: Number,
    location: String
  },
  {
    timestamps: true 
  }
);

module.exports = mongoose.model('User', userSchema);
