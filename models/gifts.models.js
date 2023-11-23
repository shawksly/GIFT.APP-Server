const mongoose = require('mongoose')

const GiftSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true,
  },
  img:{
    type: [],
    required: false
  },
  price:{
    type: Number,
    required: true
  },
  description:{
    type: String,
    required: true
  }
})

module.exports=mongoose.model('gifts', GiftSchema)