const db = require('../models/queries');
const { body, validationResult } = require('express-validator');

const validationForm = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty.'),
  body('cat_id')
    .trim()
    .if(body('category').notEmpty())
    .notEmpty()
    .withMessage('Category does not exist, create new one.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .bail()
    .isAlpha()
    .withMessage('Name must contain only letter.')
    .toLowerCase(),
  body('info')
    .trim()
    .optional({ values: 'falsy' })
    .isAlpha()
    .withMessage('Info must contain only letter.')
    .toLowerCase(),
  body('quantity')
    .trim()
    .optional({ values: 'falsy' })
    .isNumeric()
    .withMessage('Quantity must only contain number.'),
];

exports.getItem = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  res.render('item', { item });
};

exports.getItemForm = async (req, res) => {
  const categories = await db.getCategories();
  res.render('itemForm', { categories, errors: [] });
};

exports.postItem = [
  validationForm,
  async (req, res) => {
    const errors = validationResult(req);
    const categories = await db.getCategories();
    if (!errors.isEmpty()) {
      return res.status(400).render('itemForm', { categories, errors: errors.array() });
    }
    const {
      catId,
      name,
      info,
      quantity,
    } = req.body;
    try {
      await db.postItem(catId, name, info, quantity);
      return res.redirect(`/category/${catId}`);
    } catch (error) {
      return res.render('itemForm', { categories, errors: [{ msg: 'An unexpected error occured.' }] });
    }
  },
];
