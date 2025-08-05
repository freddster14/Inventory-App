const { body, validationResult } = require('express-validator');

const validateName = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .bail()
    .matches(/^[\w\s-]+$/)
    .withMessage('Name must contain only letters, numbers or dashes.')
    .toLowerCase(),
];

const validateInfo = [
  body('info')
    .trim()
    .optional({ values: 'falsy' })
    .matches(/^[\w\s-]+$/)
    .withMessage('Info must contain only letters or numbers.')
    .toLowerCase(),
  body('price')
    .trim()
    .notEmpty()
    .withMessage('Price cannot be empty.')
    .bail()
    .isNumeric()
    .withMessage('Price must only contain number.'),
  body('quantity')
    .trim()
    .optional({ values: 'falsy' })
    .isNumeric()
    .withMessage('Quantity must only contain number.'),
];

const validateCategory = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category must not be empty.')
    .bail(),
  body('catId')
    .if((value, { req }) => req.body.category)
    .notEmpty()
    .withMessage('Category does not exists.'),
];

module.exports = { validateName, validateInfo, validateCategory };
