const { Router } = require('express');
const itemController = require('../controllers/itemController');

const itemRouter = Router();

itemRouter.get('/new/:id', itemController.getItemForm);
itemRouter.get('/new', itemController.getItemForm);
itemRouter.post('/new/:id', itemController.postItem);
itemRouter.post('/new', itemController.postItem);
itemRouter.get('/edit/:id', itemController.getUpdateForm);
itemRouter.post('/edit/:id', itemController.updateItem);
itemRouter.post('/move/:id', itemController.moveItem);
itemRouter.get('/delete/:id', itemController.getDelete);
itemRouter.post('/delete/:id', itemController.deleteItem);
itemRouter.get('/:id', itemController.getItem);

module.exports = itemRouter;
