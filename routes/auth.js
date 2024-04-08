const multer=require( 'multer')
const express=require('express')
const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
  dp
} = require("../controllers/userController");
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const router = require("express").Router();

router.post("/login", login);
router.post("/register",upload.single('avatarImage'), register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);
router.post("/dp",dp)
module.exports = router;
