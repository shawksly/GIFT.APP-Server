// GIFT APP II

require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose')

const{PORT,MONGO} = process.env;

mongoose.connect(`${process.env.MONGO}/GiftMe`)

const db = mongoose.connection;

db.once('open', ()=>console.log(`connected to: ${MONGO}`));

app.use(express.json());

//! CONTROLLERS TO BE PLACED HERE



//! App.use placed here

app.get('/test', (req,res)=> {
  res.status(200).json({message: `server is accessible`, port: process.env.PORT})
})

app.listen(PORT, () => console.log(`App is listening on ${PORT}`))