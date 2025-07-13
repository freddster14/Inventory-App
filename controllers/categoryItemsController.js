const db = require('../models/queries');
const { validationResult } = require('express-validator');
const { validateName } = require('../models/validators');

exports.getCategories = async (req, res) => {
  const categories = await db.getCategories();
  res.render('category/default', { categories });
};

exports.getItems = async (req, res) => {
  const { id } = req.params;
  const category = await db.getCategory(id);
  const items = await db.getCategoryItems(category.id);
  res.render('category/view', { category, items, id });
};

exports.getNoCategoryItems = async (req, res) => {
  const items = await db.getCategoryItems(0);
  const categories = await db.getCategories();
  res.render('category/noCategory', { categories, items, errors: [] });
};

exports.getForm = (req, res) => {
  res.render('category/form', { errors: [] });
};

exports.getUpdateForm = async (req, res) => {
  const { id } = req.params;
  const category = await db.getCategory(id);
  res.render('category/edit', { category, errors: [] });
};

exports.getDelete = async (req, res) => {
  const { id } = req.params;
  const category = await db.getCategory(id);
  const items = await db.getCategoryItems(category.id);
  res.render('category/delete', { category, length: items.length });
};

exports.updateCategory = [
  validateName,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('category/form', {
        errors: errors.array(),
      });
    }
    const { id } = req.params;
    const newCategory = req.body.category;
    try {
      await db.updateCategory(id, newCategory);
      return res.redirect(`/category/${id}`);
    } catch (error) {
      // Express dupe error code
      if (error.code === '23505') {
        const category = await db.getCategory(id);
        return res.render('category/edit', { category, errors: [{ msg: `Category (${newCategory}) already exist.` }] });
      }
      // Handle other errors
      return res.status(500).render('category/edit', { category: { id, name: newCategory }, errors: [{ msg: 'An unexpected error occurred.' }] });
    }
  },
];

exports.postCategory = [
  validateName,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('category/form', {
        errors: errors.array(),
      });
    }
    const { category } = req.body;
    try {
      await db.postCategory(category);
      return res.redirect('/');
    } catch (error) {
      if (error.code === '23505') {
        return res.render('category/form', { errors: [{ msg: 'Category already exists.' }] });
      }
    }
    return res.status(500).render('category/form', { category, errors: [{ msg: 'An unexpected error occurred.' }] });
  },
];

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await db.deleteCategory(id);
  res.redirect('/');
};
