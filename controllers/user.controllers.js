const { sendResponse, AppError } = require('../helpers/utils.js');

const User = require('../models/User');
const { validationResult } = require('express-validator');

const userController = {};

userController.createUser = async (req, res, next) => {
  const user = {
    name: req.body.name,
    role: 'employee',
  };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    if (!user.name) throw new AppError(400, 'Bad Request', 'Create user Error');
    const createdUser = await User.create(user);
    sendResponse(res, 200, true, createdUser, null, 'Create user Success');
  } catch (error) {
    next(error);
  }
};

userController.getAllUsers = async (req, res, next) => {
  //in real project you will getting condition from from req then construct the filter object for query
  // empty filter mean get all
  const allowedFilter = ['name', 'role', 'name'];
  const filter = req.query;
  const filterKeys = Object.keys(filter);
  try {
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) throw new AppError(400, 'Bad Request', `Query key ${key} is not available`);
    });
    //mongoose query
    const listOfFound = await User.find(filter).populate('tasks');
    sendResponse(res, 200, true, { users: listOfFound }, null, 'Found list of users success');
  } catch (err) {
    next(err);
  }
};

userController.getSpecificUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userName } = req.params;
  try {
    if (!userName) throw new AppError(400, 'Bad Request', 'Find User Error');
    const specificUser = await User.findOne({ name: userName }).populate('tasks');
    sendResponse(res, 200, true, specificUser, null, 'get specific user Success');
  } catch (error) {
    next(error);
  }
};
userController.addReference = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userName } = req.params;
  const { ref } = req.body;
  try {
    let found = await User.findOne({ name: userName });
    console.log(userName);
    found.tasks.push(ref);
    found = await found.save();
    sendResponse(res, 200, true, { user: found }, null, 'add task reference success');
  } catch (error) {}
};

module.exports = userController;
