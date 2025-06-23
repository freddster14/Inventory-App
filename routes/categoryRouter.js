const { Router } = require('express');
const categoryController = require('../controllers/categoryItemsController');

const categoryRouter = Router();

categoryRouter.get('/', categoryController.getItems);
categoryRouter.get('/new', categoryController.getForm);
categoryRouter.post('/new', categoryController.postCategory);

module.exports = categoryRouter;
