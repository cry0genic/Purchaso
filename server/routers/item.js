const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const Item = require('../models/item');
const auth = require('../middleware/auth');
const { update } = require('../models/user');
const Item = require('../models/item');

//post a item up for sale
router.post('/item', auth, async (req, res) => {
  const item = new Item({
    ...req.body,
    seller: req.user._id,
  });

  try {
    await item.save();
    res.status(201).send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

//see all items up for sale
router.get('/items', auth, async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.status(200).send(item);
    //do not show items already sold
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server Error');
  }
});

//particular details of an item
router.get('/item/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(400).send('item not found');
    }
    res.send(item);
  } catch (e) {
    res.status(500).send('server error');
  }
});

router.patch('/item/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'description', 'baseBid'];
  const isValidOperation = updates.every((update) => {
    allowedUpdates.includes(update);
  });
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).send('item not found');
    }
    if (item.seller.toString() !== req.user.id) {
      return res.status(401).send('user not authorized');
    }
    if (!isValidOperation) {
      return res.status(400).send('invalid updates');
    }
    updates.forEach((update) => {
      item[update] = req.body[update];
    });
    await item.save();
    res.send(item);
  } catch (e) {
    res.status(500).send('server error');
  }
});

router.post('/bid/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const newBid = {
      bid: req.body.bid,
      user: req.user.id,
    };
    item.bids.unshift(newBid);
    await item.save();
    res.send(item.bids);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('server error');
  }
});

//mark as sold by Owner

module.exports = router;
