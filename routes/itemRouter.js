const { Router } = require('express');
const itemController = require('../controllers/itemController');

const itemRouter = Router();

itemRouter.get('/:id', itemController.getItem);
itemRouter.get('/new', itemController.getItemForm);
itemRouter.post('/new', itemController.postItem);

module.exports = itemRouter;
