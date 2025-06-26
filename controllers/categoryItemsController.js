const { body, validationResult } = require('express-validator');
const db = require('../models/queries');

const validationForm = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .isAlpha()
    .withMessage('Name must contain only letter.')
    .toLowerCase(),
];
exports.getItems = async (req, res) => {
  const { id } = req.params;
  const category = await db.getCategory(id);
  const items = await db.getCategoryItems(category.id);
  res.render('category/categoryItems', { category, items, id });
};

exports.getForm = (req, res) => {
  res.render('category/categoryForm', { errors: [] });
};

exports.getUpdateForm = async (req, res) => {
  const { id } = req.params;
  const category = await db.getCategory(id);
  res.render('category/categoryEdit', { category, errors: [] });
};

exports.updateCategory = [
  validationForm,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('category/categoryForm', {
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
        return res.render('category/categoryEdit', { category, errors: [{ msg: `Category (${newCategory}) already exist.` }] });
      }
      // Handle other errors
      return res.status(500).render('category/categoryEdit', { category: { id, name: newCategory }, errors: [{ msg: 'An unexpected error occurred.' }] });
    }
  },
];

exports.postCategory = [
  validationForm,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('category/categoryForm', {
        errors: errors.array(),
      });
    }
    const { category } = req.body;
    try {
      await db.postCategory(category);
      return res.redirect('/');
    } catch (error) {
      if (error.code === '23505') {
        return res.render('category/categoryForm', { errors: [{ msg: 'Category already exists.' }] });
      }
    }
    return res.status(500).render('category/categoryEdit', { category, errors: [{ msg: 'An unexpected error occurred.' }] });
  },
];
