const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
    lowercase: true 
  },
  password: {
    type: String,
    required: true,
    minlength: 6 
  },
  role: {
    type: String,
    enum: ['user', 'admin'], 
    default: 'user' 
  }
}, {
  timestamps: true 
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); 
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
