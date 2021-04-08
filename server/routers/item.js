const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const Item = require('../models/item');
const auth = require('../middleware/auth');
const { update } = require('../models/user');

//Post an item up for sale
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

//See all items up for sale
router.get('/items', auth, async (req, res) => {
  try {
    const items = await Item.find({
      sold: {
        status: false,
      }.sort({ date: -1 }),
    });
    res.status(200).send(item);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server Error');
  }
});

//Particular details of an item
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

//Edit item by Seller
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

//Bid on an Item
router.post('/bid/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const currentBid = item.bids.bid;
    const newBid = {
      bid: req.body.bid,
      user: req.user.id,
    };
    if (newBid.bid < currentBid) {
      return res.status(400).send('bid a higher value');
    }
    item.bids.unshift(newBid);
    await item.save();
    res.send(item.bids);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('server error');
  }
});

//Mark the item sold
router.post('/sell/:item_id/:buyer_id', auth, async (req, res) => {
  const seller = await User.findById(req.params.id);
  const item = await Item.findById(req.params.item_id);
  const buyer = await User.findById(req.params.buyer_id);

  try {
    if (items.sold.length > 0) {
      return res.status(400).send('item is already sold');
    }
    const newSold = {
      to: buyer.id,
      status: true,
    };
    items.sold.unshift(newSold);
    await item.save();
    res.send(item);
  } catch (e) {
    res.status(500).send('server error');
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true);
  },
});

router.post('/item/:id/image', auth, upload.single('image'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  const item = await Item.findById(req.params.id);
  item.image = req.file.buffer;
  await item.save();
});

module.exports = router;
