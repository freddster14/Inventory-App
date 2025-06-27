const { Router } = require('express');
const categoryController = require('../controllers/categoryItemsController');

const categoryRouter = Router();

categoryRouter.get('/new', categoryController.getForm);
categoryRouter.post('/new', categoryController.postCategory);
categoryRouter.get('/edit/:id', categoryController.getUpdateForm);
categoryRouter.post('/edit/:id', categoryController.updateCategory);
categoryRouter.get('/delete/:id', categoryController.getDelete);
categoryRouter.post('/delete/:id', categoryController.deleteCategory);
categoryRouter.get('/0', categoryController.getNoCategoryItems);
categoryRouter.get('/:id', categoryController.getItems);

module.exports = categoryRouter;
