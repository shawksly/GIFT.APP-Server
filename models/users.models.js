const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

  userName:{
    type: String,
    required: true,
    unique: true,
  },
  img:{
    type:String
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  friends:{
    type: []
  },
  friendRequests:{
    type: []
  }
});

module.exports=mongoose.model('User',UserSchema)