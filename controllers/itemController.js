const db = require('../models/queries');
const { validationResult } = require('express-validator');
const { validateCategory, validateInfo, validateName } = require('../models/validators');

exports.getItem = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  res.render('item/view', { item });
};

exports.getItemForm = async (req, res) => {
  const categories = await db.getCategories();
  res.render('item/form', { categories, errors: [] });
};

exports.getUpdateForm = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  const category = await db.getCategory(item.cat_id);
  res.render('item/edit', {
    item,
    category,
    errors: [],
  });
};

exports.moveItem = [
  validateCategory,
  async (req, res) => {
    const errors = validationResult(req);
    const items = await db.getCategoryItems(0);
    if (!errors.isEmpty()) {
      const categories = await db.getCategories();
      return res.status(400).render('category/noCategory', {
        categories,
        items,
        errors: errors.array(),
      });
    }
    const { id } = req.params;
    const { catId } = req.body;
    await db.moveItem(catId, id);
    return res.redirect('/');
  },
];

exports.postItem = [
  validateCategory,
  validateName,
  validateInfo,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const categories = await db.getCategories();
      return res.status(400).render('item/form', {
        categories,
        errors: errors.array(),
      });
    }
    const {
      catId,
      name,
      info,
      price,
      quantity,
    } = req.body;
    try {
      await db.postItem(catId, name, info, price, quantity);
      return res.redirect(`/category/${catId}`);
    } catch (error) {
      const categories = await db.getCategories();
      return res.render('item/form', { categories, errors: [{ msg: 'An unexpected error occured.' }] });
    }
  },
];

exports.updateItem = [
  validateInfo,
  async (req, res) => {
    const errors = validationResult(req);
    const { id } = req.params;
    const {
      catId,
      category,
      info,
      price,
      quantity,
    } = req.body;
    const sameCat = { id: catId, name: category };
    const item = await db.getItem(id);
    if (!errors.isEmpty()) {
      return res.status(400).render('item/edit', {
        item,
        category: sameCat,
        errors: errors.array(),
      });
    }
    try {
      await db.updateItem(item, info, price, quantity);
      return res.redirect(`/item/${item.id}`);
    } catch (error) {
      console.error(error)
      return res.render('item/edit', {
        item,
        category: sameCat,
        errors: [{ msg: 'An unexpected error occured.' }],
      });
    }
  },
];
