const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, addReference, getSpecificUser } = require('../controllers/user.controllers.js');
const { body, param } = require('express-validator');
/**
 * @route POST api/users
 * @description Create a new user
 * @access private, manager
 * @requiredBody: name
 */

router.post('/', body('name').isString().isLength({ min: 5 }).withMessage('Please enter a valid string'), createUser);

/**
 * @route GET api/users
 * @description Get a list of users
 * @access public
 * @allowedQueries: name,role
 */
router.get('/', getAllUsers);

/**
 * @route GET api/users
 * @description Get specific of users
 * @access public
 * @requiredParams: userId
 */
router.get('/:userName', param('userName').isMongoId().withMessage('Not Mongo ID'), getSpecificUser);

/**
 * @route PUT api/users/:userid
 * @description  assign user to task by id
 * @access public
 * @requiredBody: taskId
 */
router.put('/:userId', param('userId').isMongoId().withMessage('Not Mongo ID'), addReference);

module.exports = router;
