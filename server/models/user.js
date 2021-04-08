const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

//virtualSchema

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

// hash the plain text password b4 saving
userSchema.pre('save', async function (next) {
  //this has to be a standard function due to binding
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//remove items when user is deleted

const User = mongoose.model('User', userSchema);

module.exports = User;
