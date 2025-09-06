const { Router } = require('express');
const categoryController = require('../controllers/categoryItemsController');

const categoryRouter = Router();

categoryRouter.get('/new', categoryController.getForm);
categoryRouter.post('/new', categoryController.postCategory);
categoryRouter.get('/edit/:id', categoryController.getUpdateForm);
categoryRouter.post('/edit/:id', categoryController.updateCategory);
categoryRouter.get('/delete/:id', categoryController.getDelete);
categoryRouter.post('/delete/:id', categoryController.deleteCategory);
categoryRouter.post('/delete-all/:id', categoryController.deleteAll);
categoryRouter.post('/move/multiple', categoryController.moveNoCatItems);
categoryRouter.post('/move/:id', categoryController.moveItem);
categoryRouter.get('/1', categoryController.getNoCategoryItems);
categoryRouter.get('/:id', categoryController.getItems);
categoryRouter.get('/', categoryController.getCategories);

module.exports = categoryRouter;
