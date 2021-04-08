const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Item = require('../models/item');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('email is invalid');
        }
        if (!value.toLowerCase().includes('pilani.bits-pilani.ac.in')) {
          throw new Error('please login using BITSmail only');
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('password cannot contain "password"');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    profilePic: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('items', {
  ref: 'Item',
  localfield: '_id',
  foreignfied: 'seller',
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'adityahere');

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('unable to login');
  }
  return user;
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre('remove', async function (next) {
  const user = this;
  await Item.deleteMany({ seller: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
