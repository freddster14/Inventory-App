const db = require('../models/queries');
const { validationResult } = require('express-validator');
const { validateCategory, validateInfo, validateName } = require('../models/validators');
const { buildUrl } = require('../models/helper-functions');

exports.getItems = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const totalPages = await db.getTotalPages(limit);
  // Revert back to max page as a result of limit change or data
  if (totalPages < page) return res.redirect(`/item?page=${totalPages}&limit=${limit}`);
  const fn = (newQuery, query) => buildUrl(req, newQuery, 'item', query);
  const items = await db.getItems(limit, page);
  return res.render('item/default', {
    items,
    page,
    limit,
    totalPages,
    buildUrl: fn,
  });
};

exports.getItem = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  const category = await db.getCategory(item.cat_id);
  res.render('item/view', { item, category });
};

exports.getItemForm = async (req, res) => {
  const { id } = req.params;
  const categories = await db.getCategories();
  let selectedCategory = null;
  if (id) {
    selectedCategory = await db.getCategory(id);
  }
  res.render('item/form', { categories, selectedCategory, errors: [] });
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

exports.getDelete = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  const category = await db.getCategory(item.cat_id);
  res.render('item/delete', { item, category });
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  await db.deleteItem(id);
  res.redirect(`/category/${item.cat_id}`);
};

exports.postItem = [
  validateCategory,
  validateName,
  validateInfo,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { id } = req.params;
      const categories = await db.getCategories();
      let selectedCategory = null;
      if (id) {
        selectedCategory = await db.getCategory(id);
      }
      return res.status(400).render('item/form', {
        categories,
        selectedCategory,
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
      const { id } = req.params;
      const categories = await db.getCategories();
      let selectedCategory = null;
      if (id) {
        selectedCategory = await db.getCategory(id);
      }
      return res.render('item/form', {
        categories,
        selectedCategory,
        errors: [{ msg: 'An unexpected error occured.' }],
      });
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
      return res.render('item/edit', {
        item,
        category: sameCat,
        errors: [{ msg: 'An unexpected error occured.' }],
      });
    }
  },
];
