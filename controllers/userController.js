const User = require("../models/userModel");
const bcrypt = require("bcrypt");
//const generateToken = require("../config/generateToken");
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};
const { S3Client, PutObjectCommand,GetObjectCommand } =require ("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv=require('dotenv')
const crypto=require('crypto')
const sharp=require( 'sharp')

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
dotenv.config()
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})
module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);

    let fileName;
    
      
    
    if(!(req.file===undefined)){
      
      const file = req.file 
      const caption = req.body.caption
      const fileBuffer = await sharp(file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer()
       fileName = generateFileName()
       
      const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
          ContentType: file.mimetype
        }
      
        // Send the upload to S3
        if(!fileName) fileName="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        await s3Client.send(new PutObjectCommand(uploadParams));}
        
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      avatarImage:fileName,
      isAvatarImageSet:true
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};
// const helper=async (avatarImage)=>{
//   const getObjectParams={
//     Bucket:process.env.AWS_BUCKET_NAME,
//     Key:avatarImage
//   }
//   const command = new GetObjectCommand(getObjectParams);
//   const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
//   return url;
// }
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    // users.map(async (user)=>{
    //   user.avatarImage=await helper(user.avatarImage)
    // })
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
module.exports.dp=async(req,res,next)=>{
  if(req.body.params.avatarImage==undefined){ return res.json("no")
}
else{
  if(req.body.params.avatarImage.data==undefined&&req.body.params.avatarImage.length<65){
   // console.log(req.body.params.avatarImage)
    const getObjectParams={
      Bucket:process.env.AWS_BUCKET_NAME,
      Key:req.body.params.avatarImage
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return res.json(url);
  }
  
  else{
    return res.json(req.body.params.avatarImage.data)
  }}
}
