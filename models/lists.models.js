const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({

  title:{
    type:String,
    required: true,
  },
  description:{
    type: String,
    required: false
  },
  list:{
    required: true,
    type: []
  },
  owner:{
    type: String,
    required: true
  }

})

module.exports=mongoose.model('List', ListSchema);