const mongoose = require('mongoose')

const GiftSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true,
  },
  img:{
    type:String
  },
  price:{
    type: Number,
    required: true
  },
  emoji:{
    type:String,
    required:false
  },
  description:{
    type: String,
    required: false
  },
  link:{
    type: String,
    required: false
  },
  owner: String,
  list: String
})

module.exports=mongoose.model('gifts', GiftSchema)