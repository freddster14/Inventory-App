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
  const { id } = req.query;
  const category = await db.getCategory(id);
  const items = await db.getCategoryItems(category.id);
  res.render('categoryItems', { category, items });
};

exports.getForm = (req, res) => {
  res.render('categoryForm', { errors: [] });
};

exports.postCategory = [
  validationForm,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('categoryForm', {
        errors: errors.array(),
      });
    }
    const { category } = req.body;
    const capitalizeCat = category.charAt(0).toUpperCase() + category.slice(1);
    const isCategoryNew = await db.searchCategories(capitalizeCat);
    if (!isCategoryNew) {
      return res.status(400).render('categoryForm', { errors: [{ msg: 'Category already exists.' }] });
    }
    await db.postCategory(capitalizeCat);
    return res.redirect('/');
  },
];
