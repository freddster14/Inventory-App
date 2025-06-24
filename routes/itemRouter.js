const { Router } = require('express');
const itemController = require('../controllers/itemController');

const itemRouter = Router();

itemRouter.get('/new', itemController.getItemForm);
itemRouter.post('/new', itemController.postItem);
itemRouter.get('/:id', itemController.getItem);

module.exports = itemRouter;
