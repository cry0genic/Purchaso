const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const Item = require('../models/item');
const auth = require('../middleware/auth');

// API https://{url}/item
// Desc Post an item up for sale
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

// API https://{url}/items
// Desc See all items up for sale
router.get('/items', auth, async (req, res) => {
  try {
    const items = await Item.find({ notAvailable: false });
    res.status(200).send(items);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server Error');
  }
});

// API https://{url}/item/:id
// Desc View details of a particular item
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

// API https://{url}/item/:id
// Desc Edit item by Seller
router.patch('/item/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'name', 'baseBid'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'inavlid updates' });
  }
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).send('item not found');
    }
    if (item.seller.toString() !== req.user.id) {
      return res.status(401).send('user not authorized');
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

// API https://{url}/bid/:id
// Desc Bid on a particular item
router.post('/bid/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const bidArray = item.bids;
    const descBid = bidArray.sort((a, b) => {
      parseFloat(b.bid) - parseFloat(a.bid);
    });
    const maxBid = descBid[0];

    const newBid = {
      bid: req.body.bid,
      user: req.user.id,
    };

    if (newBid.bid < maxBid.bid) {
      return res.status(400).send('bid a higher value than' + maxBid.bid);
    }
    item.bids.unshift(newBid);
    await item.save();
    res.send(item.bids);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('server error');
  }
});

// API https://{url}/sell/:item_id/:buyer_id
// Desc Mark an item sold by Seller
router.post('/sell/:item_id/:buyer_id', auth, async (req, res) => {
  const item = await Item.findById(req.params.item_id);
  const buyer = await User.findById(req.params.buyer_id);

  try {
    if (item.seller.id !== req.user.id) {
      //item.seller.toString() !== req.user.id
      return res.status(401).send('not authorized');
    }
    if (item.notAvailable === true) {
      return res.status(400).send('item is already sold');
    }
    item.sold = buyer.id;
    item.notAvailable = true;
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

// API https://{url}/item/:id/image
// Desc Upload image to an item
router.post('/item/:id/image', auth, upload.single('image'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  const item = await Item.findById(req.params.id);
  item.image = req.file.buffer;
  await item.save();
});

module.exports = router;
