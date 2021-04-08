const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('user/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('user/logoutALL', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/user/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/user/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'invalid updates' });
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/user/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
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

router.post(
  '/user/me/profilePic',
  auth,
  upload.single('profilePic'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.profilePic = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);

router.delete('/user/me/profilePic', auth, async (req, res) => {
  req.user.profilePic = undefined;
  await req.user.save();
  res.send();
});

module.exports = router;
