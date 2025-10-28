const db = require('../models/queries');
const { validationResult } = require('express-validator');
const { validateCategory, validateInfo, validateName } = require('../models/validators');
const { buildUrl } = require('../models/helper-functions');
const { getCount, queryAll, getPagination, queryOne, execute, updateById, insertOne } = require('../models/query-helpers');

exports.getItems = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const totalPages = Math.ceil(await getCount('items') / limit);
  // Revert back to max page as a result of limit change or data
  if (totalPages < page) return res.redirect(`/item?page=${totalPages}&limit=${limit}`);
  const fn = (newQuery, query) => buildUrl(req, newQuery, 'item', query);
  const items = await getPagination('SELECT * FROM items LIMIT $1 OFFSET $2', [], limit, page);
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
  const item = await queryOne('SELECT * FROM items WHERE id=$1', [id]);
  const category = await queryOne('SELECT * FROM categories WHERE id=$1', [item.cat_id]);
  res.render('item/view', { item, category });
};

exports.getItemForm = async (req, res) => {
  const { id } = req.params;
  const categories = await queryAll('SELECT * FROM categories WHERE id>1');
  let selectedCategory = null;
  if (id) {
    selectedCategory = await queryOne('SELECT * FROM categories WHERE id=$1', [id]);
  }
  res.render('item/form', { categories, selectedCategory, errors: [] });
};

exports.getUpdateForm = async (req, res) => {
  const { id } = req.params;
  const item = await queryOne('SELECT * FROM items WHERE id=$1', [id]);
  const category = await queryOne('SELECT * FROM categories WHERE id=$1', [item.cat_id]);
  res.render('item/edit', {
    item,
    category,
    errors: [],
  });
};

exports.getDelete = async (req, res) => {
  const { id } = req.params;
  const item = await queryOne('SELECT * FROM items WHERE id=$1', [id]);
  const category = await queryOne('SELECT * FROM categories WHERE id=$1', [item.cat_id]);
  res.render('item/delete', { item, category });
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  const item = await queryOne('SELECT * FROM items WHERE id=$1', [id]);
  await execute('DELETE FROM items WHERE id=$1', [id]);
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
      const categories = await queryAll('SELECT * FROM categories WHERE id>1');
      let selectedCategory = null;
      if (id) {
        selectedCategory = await queryOne('SELECT * FROM categories WHERE id=$1', [id]);
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
      await insertOne('items', {
        cat_id: catId,
        name,
        info,
        price,
        quantity,
      });
      return res.redirect(`/category/${catId}`);
    } catch (error) {
      const { id } = req.params;
      const categories = await queryAll('SELECT * FROM categories WHERE id>1');
      let selectedCategory = null;
      if (id) {
        selectedCategory = await queryOne('SELECT * FROM categories WHERE id=$1', [id])
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
    const item = await queryOne('SELECT * FROM items WHERE id=$1', [id]);
    if (!errors.isEmpty()) {
      return res.status(400).render('item/edit', {
        item,
        category: sameCat,
        errors: errors.array(),
      });
    }
    try {
      await updateById('items', item.id, { info, price, quantity });
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
