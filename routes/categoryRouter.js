const { Router } = require('express');
const categoryController = require('../controllers/categoryItemsController');

const categoryRouter = Router();

categoryRouter.get('/', categoryController.getItems);

module.exports = categoryRouter;
