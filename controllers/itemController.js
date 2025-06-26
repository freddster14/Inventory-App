const { body, validationResult } = require('express-validator');
const db = require('../models/queries');

const validationForm = [
  body('category')
    .toLowerCase()
    .trim()
    .notEmpty()
    .withMessage('Category does not exist, create new one.'),
  body('catId')
    .if((value, { req }) => value === 'missing click')
    .isEmpty()
    .withMessage('Select a category from list.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .bail()
    .matches(/^[\w\s-]+$/)
    .withMessage('Name must contain only letters, numbers or dashes.')
    .toLowerCase(),
  body('info')
    .trim()
    .optional({ values: 'falsy' })
    .matches(/^[\w\s-]+$/)
    .withMessage('Info must contain only letters or numbers.')
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
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).render('itemForm', {
        categories,
        errors: errors.array(),
      });
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
