// GIFT APP II

require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose')

const{PORT,MONGO} = process.env;

// mongoose.connect(`${process.env.MONGO}`)
// https://stackoverflow.com/questions/57337218/how-to-connect-to-specific-database-with-mongoose-and-node
mongoose
  .connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'GIFTAPP-Database',
  })
  .then(() => {
    console.log('Connected to the Database.');
  })
  .catch(err => console.error(err));

const db = mongoose.connection;

db.once('open', ()=>console.log(`connected to MongoDB!`));

app.use(express.json());
app.use(require('cors')());

//! CONTROLLERS TO BE PLACED HERE
const users = require('./controllers/userController');
const lists = require('./controllers/listsController');
const gifts = require('./controllers/giftsController');
//! App.use placed here
app.use('/user',users)
app.use('/lists',lists)
app.use('/gifts',gifts)
app.get('/test', (req,res)=> {
  res.status(200).json({message: `server is accessible`, port: process.env.PORT})
})
//! s3 STUFF


const uploadURL = require('./s3');
app.use(express.static("static"))
app.get('/geturl', async (req,res)=>{
  const url = await uploadURL()
  console.log(url)
  res.status(200).json(url)
})

app.listen(PORT, () => console.log(`App is listening on ${PORT}`))