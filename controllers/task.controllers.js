const { sendResponse, AppError } = require('../helpers/utils.js');

const User = require('../models/User');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

const taskController = {};

taskController.createTask = async (req, res, next) => {
  // const task = {
  //   name: 'test',
  //   description: 'test',
  //   status: 'pending',
  //   user: '63bbdde74bdcce989670514c',
  // };
  const errors = validationResult(req); //for express-validator
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const task = req.body;
  try {
    if (!task || Object.keys(task).length === 0) throw new AppError(400, 'Bad Request', 'Create Task Error');
    let createdTask;
    if (task.user) {
      // assign user if there is a userid in body
      let assignedUser = await User.findOne({ _id: task.user });
      if (!assignedUser) throw new AppError(400, 'Bad Request', 'Cannot find user');
      createdTask = await Task.create(task).then(async (task) => {
        try {
          assignedUser.tasks.push(task._id);
          assignedUser = await assignedUser.save();
        } catch (error) {
          next(error);
        }
      });
    } else createdTask = await Task.create(task);
    sendResponse(res, 200, true, createdTask, null, 'Create Task Success');
  } catch (error) {
    next(error);
  }
};

taskController.getAllTasks = async (req, res, next) => {
  //in real project you will getting condition from from req then construct the filter object for query
  // empty filter mean get all
  const allowedFilter = ['name', 'status', 'createdAt', 'updatedAt'];
  const filter = req.query;
  const filterKeys = Object.keys(filter);
  try {
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) throw new AppError(400, 'Bad Request', `Query key ${key} is not available`);
    });
    //mongoose query
    let listOfFound = await Task.find(filter).sort({ createdAt: -1 });
    listOfFound = listOfFound.filter((task) => task.isDeleted === false); //filter soft delete
    sendResponse(res, 200, true, { tasks: listOfFound }, null, 'Found list of users success');
  } catch (err) {
    next(err);
  }
};

taskController.getSpecificTask = async (req, res, next) => {
  const { taskId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    if (!taskId) throw new AppError(400, 'Bad Request', 'Find Task Error');
    const specificTask = await Task.findOne({ _id: taskId }).populate('user', 'name role'); //only return name and role
    sendResponse(res, 200, true, specificTask, null, 'get specific task Success');
  } catch (error) {
    next(error);
  }
};

taskController.updateTaskById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { taskId } = req.params;
  const updateBody = req.body;
  try {
    const task = await Task.findOne({ _id: taskId });
    // if status check
    if (task.status === 'done' && updateBody.status !== 'archive')
      throw new AppError(400, 'Bad Request', 'Can only set status from done to archive');

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateBody, { new: true });

    // if task already have assign user , delete that person and push into new user
    if (updateBody.user) {
      let assignedUser = await User.findOne({ _id: updateBody.user });
      if (!assignedUser) throw new AppError(404, 'Bad Request', 'Cannot find user');
      if (!assignedUser.tasks.includes(updatedTask._id)) assignedUser.tasks.push(updatedTask._id);
      else throw new AppError(404, 'Bad Request', 'already have task');
      assignedUser = await assignedUser.save();
      console.log('new user', assignedUser);
    }
    if (task.user !== updateBody.user || (task.user && !updateBody.user)) {
      let assignedOldUser = await User.findOne({ _id: task.user });
      assignedOldUser.tasks = assignedOldUser.tasks.filter((task) => task !== task._id);
      assignedOldUser = await assignedOldUser.save();
      console.log('old user', assignedOldUser);
    }
    sendResponse(res, 200, true, { data: updatedTask }, null, 'Update task success');
  } catch (error) {
    next(error);
  }
};

taskController.deleteTaskById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { taskId } = req.params;
  try {
    const deletedTask = await Task.findByIdAndUpdate(taskId, { isDeleted: true }, { new: true });
    sendResponse(res, 200, true, { data: deletedTask }, null, 'Delete task success');
  } catch (error) {
    next(error);
  }
};
module.exports = taskController;
