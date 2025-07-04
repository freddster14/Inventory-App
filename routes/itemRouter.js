const { Router } = require('express');
const itemController = require('../controllers/itemController');

const itemRouter = Router();

itemRouter.get('/new', itemController.getItemForm);
itemRouter.post('/new', itemController.postItem);
itemRouter.get('/edit/:id', itemController.getUpdateForm);
itemRouter.post('/edit/:id', itemController.updateItem);
itemRouter.post('/move/:id', itemController.moveItem);
itemRouter.get('/:id', itemController.getItem);

module.exports = itemRouter;
