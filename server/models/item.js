const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  baseBid: {
    type: Number,
    default: 0,
    required: true,
  },
  bids: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      bid: {
        type: Number,
      },
    },
  ],
  image: {
    type: Buffer,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  sold: [
    {
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        //status false means unsold else sold
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
