const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getSpecificTask,
  updateTaskById,
  deleteTaskById,
} = require('../controllers/task.controllers.js');
const { check, body, param } = require('express-validator');

/**
 * @route POST api/tasks
 * @description create a new task
 * @access public
 * @allowedQueries: name,description,status,user(not required)
 */
router.post(
  '/',
  [
    body('name').isLength({ min: 5 }).withMessage('Please enter a valid name (5 minimum characters)'),
    body('description').isLength({ min: 5 }).withMessage('Please enter a valid description (5 minimum characters)'),
    body('status').isString().not().isEmpty().isLength({ min: 1, max: 50 }),
  ],
  createTask,
);

/**
 * @route GET api/tasks
 * @description Get a list of tasks
 * @access public
 * @allowedQueries: name,createdAt,updatedAt,status
 */
router.get('/', getAllTasks);

/**
 * @route GET api/tasks/:taskId
 * @description Get a specific task
 * @access public
 * @allowedQueries:
 */
router.get('/:taskId', param('taskId').isMongoId().withMessage('Not Mongo ID'), getSpecificTask);

/**
 * @route put api/tasks/:taskId
 * @description update and assign a specific task
 * @access public
 * @allowedQueries: name, desc, user
 */
router.put('/:taskId', param('taskId').isMongoId().withMessage('Not Mongo ID'), updateTaskById);

/**
 * @route delete api/tasks/:taskId
 * @description soft delete a specific task
 * @access public
 * @allowedQueries:
 */
router.delete('/:taskId', param('taskId').isMongoId().withMessage('Not Mongo ID'), deleteTaskById);
module.exports = router;
