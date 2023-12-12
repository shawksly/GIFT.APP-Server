const router = require('express').Router()

const User = require('../models/users.models')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const validateSession = require('../middleware/validateSession')

const encryptPassword = (password) => {
  const encrypt = bcrypt.hashSync(password,10)
  console.log(encrypt)
}

//! Signup Route

router.post('/signup', async (req, res) =>{
  
  try{
    const user = new User({
      userName: req.body.userName,
      img: req.body.img,
      email: req.body.email,
      friends: [],
      friendRequests: [],
      password: bcrypt.hashSync(req.body.password, 10)
    });

    const newUser = await user.save();

    const token= jwt.sign({ id: newUser['_id'] },process.env.JWT,{ expiresIn: '1 day' });

    res.status(200).json({
      user: newUser,
      message: "New User Created!",
      token
    });

  }catch (err){
    res.status(500).json({
      ERROR: err.message
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

// get list of friends (accepted and requested)
router.get('/friends/list', validateSession, async (req, res) => {
  try {
    
    let userId = req.user._id;

    const { friends, friendRequests } = await User.findOne({_id: userId})
    console.log('1', friends, '2', friendRequests);

    const friendsList = [];

    for (const friendId of friends) {
      const {_id, userName, img, email} = await User.findOne({_id: friendId});
      friendsList.push({_id, userName, img, email})
    }

    console.log(friendsList)

    const friendRequestsList = []

    for (const friendId of friendRequests) {
      const {_id, userName, img, email} = await User.findOne({_id: friendId});
      // {userName, img, email} = found;
      friendRequestsList.push({_id, userName, img, email});
    }

    console.log("test", friendRequestsList)

    res.status(200).json({
      message: "Lists found!",
      friendsList,
      friendRequestsList
    })

  } catch (error) {
    res.status(500).json({
      ERROR: err.message
    });
  }
});

// remove friend
router.delete('/friends/remove/:friendEmail', validateSession, async (req, res) => {
  try {
    let userId = req.user._id;
    let { friendEmail } = req.params;

    const them = await User.findOne({ email: friendEmail });
    console.log('them ', them)

    const us = await User.findOne({ _id: userId });
    console.log('us ', us)

    // if we're not friends, don't attempt this
    if (!them.friends?.includes(userId) || !us.friends?.includes(them._id)) {
      throw new Error("There was an error. You aren't friends.")
    } else {

      //remove us from their array
      let themIndex = them.friends?.indexOf(userId);
      them.friends?.splice(themIndex, 1);

      //remove them from our array
      let usIndex = us.friends?.indexOf(them._id);
      us.friends?.splice(usIndex, 1);

      // update both ddatabase entries
      const updatedThem = await User.findOneAndUpdate({ email: friendEmail }, { friends: them.friends }, { new: true })
      const updatedUs = await User.findOneAndUpdate({ _id: userId }, { friends: us.friends}, { new: true })

      res.status(200).json({
        message: 'Friends no more! Good riddance!',
        You: {updatedUs},
        Them: {updatedThem}
      })
    }

  } catch (err) {
    res.status(500).json({
      ERROR: err.message
    });
  };
});

// post friend request
router.post('/friends/:friendEmail', validateSession, async (req, res) => {
  try {
    let userId = req.user._id;
    let { friendEmail } = req.params;

    const them = await User.findOne({ email: friendEmail });
    console.log('them ', them)

    const us = await User.findOne({ _id: userId });
    console.log('us ', us)

    // if you're friend requesting yourself
    if (friendEmail === req.user.email)
      throw new Error("self-love is great, but this...?");

    // if their friends list includes us, and our friends list includes them
    if (them.friends?.includes(userId) && us.friends?.includes(them._id))
      throw new Error("Already friends!");

    // if we've already sent them a friend request (and our id is in their list) AND they haven't sent one to us
    if (them.friendRequests?.includes(userId))
      throw new Error("Friend request already sent!")

    // if we havent' sent a request, but they have, we're friends now!
    if (!them.friendRequests?.includes(userId) && us.friendRequests?.includes(them._id)) {

      // add my id to their local array
      them.friends.push(userId);

      // update their friends mongo
      const updatedThem = await User.findOneAndUpdate({ email: friendEmail }, { friends: them.friends }, { new: true });

      // remove their id from my local requests array
      let index = us.friendRequests?.indexOf(them._id);
      us.friendRequests?.splice(index, 1);

      // add it to my local friends array
      us.friends.push(them._id);

      // update my friends and friendrequests mongo
      const updatedUs = await User.findOneAndUpdate({ _id: userId }, { friends: us.friends, friendRequests: us.friendRequests }, { new: true })

      res.status(200).json({
        message: 'You made a friend!',
        You: {updatedUs},
        Them: {updatedThem}
      });

      // if we're both not on each other's friend requests list
    } else if (!them.friendRequests?.includes(userId) && !us.friendRequests?.includes(them._id)) {

      // add my id to their requests array
      them.friendRequests.push(userId);

      // update their requests mongo
      const updatedThem = await User.findOneAndUpdate({ email: friendEmail }, { friendRequests: them.friendRequests }, { new: true });

      res.status(200).json({
        message: 'Friend request sent!',
        You: { us },
        Them: { updatedThem }
      });
    } else {

      // if somehow the situation doesn't match any of the above situations (which I don't *think* is possible)
      throw new Error("Apparantly, it's complicated")
    }


  } catch (err) {
    res.status(500).json({
      ERROR: err.message
    });
  };
});

//! UPDATE USER

router.patch('/:userId',validateSession, async (req,res) =>{
  try{
    let _id = req.params.userId;
    let owner = req.user.id;

    let updatedInfo = req.body;

    if(_id !== owner)
      throw new Error("incorrect user")

    if(updatedInfo.password)
      updatedInfo.password = bcrypt.hashSync(updatedInfo.password,10)

    const updated = await User.findOneAndUpdate({_id}, updatedInfo, {new: true});

    if (!updated)
      throw new Error("Invalid User")

    res.status(200).json({
      message: `User ${updated._id} Updated`,
      updated
    })

  }catch(err){
    res.status(500).json({
      ERROR: err.message
    })
  }

})

module.exports = router