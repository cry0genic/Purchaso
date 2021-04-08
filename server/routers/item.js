const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const Item = require('../models/item');
const auth = require('../middleware/auth');

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

//edit task by ITEM OWNER

module.exports = router;
