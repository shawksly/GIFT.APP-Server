const jwt = require('jsonwebtoken')
const User = require('../models/users.models')

async function validateSession(req,res,next){
  try{
    const token = req.headers.authorization

    const decoded = await jwt.verify(token, process.env.JWT);

    const user = await User.findById(decoded.id);

    if (!user) throw new Error('User not found')

    req.user = user;

    return next()
  }catch (err){
    res.status(403).json({message: err.message})
  }

}

module.exports= validateSession