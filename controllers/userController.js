const router = require('express').Router()

const User = require('../models/users.models')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const encryptPassword = (password) => {
  const encrypt = bcrypt.hashSync(password,10)
  console.log(encrypt)
}

//! Signup Route

router.post('/signup', async (req,res) =>{
  
  try{
    const user = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: encryptPassword(req.body.password)
    });

    const newUser = await user.save();

    const token= jwt.sign({id: newUser ['_id']},process.env.JWT,{expiresIn: '1 day'});

    res.status(200).json({
      user: newUser,
      message: "New User Created!",
      token
    });

  }catch (err){
    res.status(500).json({
      ERROR: err.messaege
    });
  }
});


router.post('/login', async (req,res) =>{
  try{
    const {email,password} = req.body

    const user = await User.findOne({ email:email});
  if (!user) throw new Error('Email or Password do not match');

  const token = jwt.sign({ id: user._id },process.env.JWT,{ expiresIn: '1 day'});

  const passwordMatch = await bcrypt.compare(password, user.password);

  if(!passwordMatch) throw new Error('Email or Password do not match')

  res.status(200).json({
    user,
    message: "Login Successful",
    token
  })
  }catch (err){
    res.status(500).json({
      ERROR: err.message
    })
  }
  
})

module.exports = router