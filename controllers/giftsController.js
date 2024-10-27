const router = require('express').Router()
const List = require('../models/lists.models')
const Gift = require('../models/gifts.models')
const User = require('../models/users.models')
const validateSession = require('../middleware/validateSession')


function errorResponse(res, err) {
  res.status(500).json({
    ERROR: err.message,
  });
};

//! ADD GIFT TO LIST
router.post('/create/:listId', validateSession, async (req,res)=>{

  try{
    const gift = new Gift({
      title: req.body.title,
      img: req.body.img,
      price: req.body.price,
      description: req.body.description,
      emoji: req.body.emoji,
      link: req.body.link,
      purchased: false,
      owner: req.user._id,
      list: req.params.listId
    });

    const targetList = await List.findOne({_id: req.params.listId});
    const giftList = targetList.gifts;

    giftList.push(gift);

    const updated = await List.findOneAndUpdate({_id: req.params.listId}, {gifts: giftList}, {new: true});

    if(!updated)
      throw new Error("Incorrect List")

    const newGift = await gift.save();

    res.status(200).json({
      message: "gift added!",
      newGift,
      updated
    })
  }catch (err){
    errorResponse(res,err)
  }
})

//! Gifts per List
router.get('/gift/:listId',validateSession, async (req,res) =>{

  try{
    const getGifts = await Gift.find({list: req.params.listId})

    if (getGifts.length > 0) {
    res.status(200).json({ getGifts })
    } else {
    console.log('error', req.params.listId)
    res.status(404).json({ message: "no gifts found" })
    };

  }catch (err){
    console.log(err)
    errorResponse(res,err)
  }
});

//! Update Gift

router.patch('/update/:giftId',validateSession, async (req,res) => {

  try{
    let _id = req.params.giftId;
    let owner = req.user.id
    let updatedGift = req.body
    
    const updated = await Gift.findOneAndUpdate({ _id: _id, owner:owner}, updatedGift, {new:true});

    if(!updated)
      throw new Error('invalid list owner')

    res.status(200).json({
      message: "gift updated",
      updated
    })

  }catch(err){
    errorResponse(res,err)
  }
});

//! Purchase Gift

router.patch('/purchase/:giftId', async (req,res) => {

  try{
    let _id = req.params.giftId;
    let updatedGift = req.body
    
    const updated = await Gift.findOneAndUpdate({ _id: _id}, updatedGift, {new:true});

    if(!updated)
      throw new Error('invalid list owner')

    res.status(200).json({
      message: "gift updated",
      updated
    })

  }catch(err){
    errorResponse(res,err)
  }
});

//! delete gift

router.delete('/delete/:giftId',validateSession, async (req,res) =>{

  try{
    let { giftId }= req.params
    let owner = req.user._id

    const deleteGift= await Gift.deleteOne({
      _id: giftId, owner: owner})

      if(!deleteGift.deletedCount)
        throw new Error('cannot find gift or not owner of gift')

    res.status(200).json({
      message: 'gift deleted',
      deleteGift
    })
      
  }catch (err){
    errorResponse(res,err)
  }
})

module.exports= router;