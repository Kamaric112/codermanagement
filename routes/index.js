const express = require('express');

const router = express.Router();
const { sendResponse, AppError } = require('../helpers/utils.js');
const userRouter = require('./user.api.js');
const taskRouter = require('./task.api.js');

router.use('/users', userRouter);
router.use('/tasks', taskRouter);

/* GET home page. */
router.get('/', (req, res) => {
  res.status(200).send('Welcome to CoderSchool!');
});

module.exports = router;
