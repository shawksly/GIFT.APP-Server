const router = require('express').Router();
const validateSession = require('../middleware/validateSession');
const List = require('../models/lists.models');
const User = require('../models/users.models');

function errorRepsonse(res, err) {
  res.status(500).json({
    ERROR: err.message,
  });
}

//! Create List

router.post('/create', validateSession, async (req, res) => {
  try {
    const list = new List({
      title: req.body.title,
      description: req.body.description,
      gifts: [],
      emoji: req.body.emoji,
      owner: req.user._id,
    });

    const newList = await list.save();

    res.status(200).json({
      message: 'List Created',
      list: newList,
    });
  } catch (err) {
    errorRepsonse(res, err);
  }
});

//! get friend's lists

router.get('/friends', validateSession, async (req, res) => {
  try {
    let userId = req.user._id;
    console.log({ userId: req.user });

    const { friends } = await User.findById(userId);
    console.log({ friends });

    const friendsLists = [];

    for (const friendId of friends) {
      const list = await List.find({ owner: friendId });
      if (list.length >= 1) friendsLists.push(list);
    }

    friendsLists.length > 0
      ? res.status(200).json({ friendsLists })
      : res.status(404).json({ message: 'no lists found' });

  } catch (err) {
    errorRepsonse(res, err);
  }
});

//! LIST BY ID

router.get('/:listId', validateSession, async (req, res) => {
  try {
    console.log(req.params.listId);
    const singleList = await List.findOne({ _id: req.params.listId });

    if (!singleList) {
      throw new Error('List not found');
    }

    if (!singleList.owner) {
      throw new Error('List owner not found');
    }

    const user = await User.findById(singleList.owner);

    res.status(200).json({ found: singleList, owner: user });
  } catch (err) {
    errorRepsonse(res, err);
  }
});

//! All Lists

router.get('/all/lists', validateSession, async (req, res) => {
  try {
    const getAllLists = await List.find();

    getAllLists.length > 0
      ? res.status(200).json({ getAllLists })
      : res.status(404).json({ message: 'no lists available' });
  } catch (err) {
    errorRepsonse(res, err);
  }
});

//! get all Lists by owner
router.get('/list/owner/:ownerId', validateSession, async (req, res) => {
  try {
    const listOwner = await List.find({ owner: req.params.ownerId });

    listOwner.length > 0
      ? res.status(200).json({ listOwner })
      : res.status(404).json({ message: 'no lists found' });
  } catch (err) {
    errorRepsonse(res, err);
  }
});

//! Update Lists

router.patch('/:listId', validateSession, async (req, res) => {
  try {
    let _id = req.params.listId;
    let owner = req.user.id;

    let updatedList = req.body;

    const updated = await List.findOneAndUpdate({ _id, owner }, updatedList, {
      new: true,
    });

    if (!updated) throw new Error('Invalid Room/user Combination');

    res.status(200).json({
      message: `${updated._id} Updated!`,
      updated,
    });
  } catch (err) {
    errorRepsonse(res, err);
  }
});

//! Delete List

router.delete('/:listId', validateSession, async (req, res) => {
  try {
    let { listId } = req.params;
    let owner = req.user.id;

    const deleteList = await List.deleteOne({ _id: listId, owner });

    if (!deleteList.deletedCount)
      throw new Error('Could not find list/ not owner of List');

    res.status(200).json({
      message: 'list deleted',
      deleteList,
    });
  } catch (err) {
    errorRepsonse(res, err);
  }
});

module.exports = router;
