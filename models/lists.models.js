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
  gifts:{
    required: true,
    type: []
  },
  owner:{
    type: String
  }

});

module.exports=mongoose.model('List', ListSchema);