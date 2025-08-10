const db = require('../models/queries');
const { validationResult } = require('express-validator');
const { validateName, validateCategory } = require('../models/validators');
const { buildUrl } = require('../models/helper-functions');

exports.getCategories = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const totalPages = await db.getTotalPages(limit, 'categories');
  // Revert back to max page as a result of limit change or data
  if (totalPages < page) return res.redirect(`/item?page=${totalPages}&limit=${limit}`);
  const fn = (newQuery, query) => buildUrl(req, newQuery, 'category', query);
  const categories = await db.getCategories();
  return res.render('category/default', {
    categories,
    page,
    limit,
    totalPages,
    buildUrl: fn,
  });
};

exports.getItems = async (req, res) => {
  const { id } = req.params;
  const category = await db.getCategory(id);
  const items = await db.getCategoryItems(category.id);
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const totalPages = items.length / limit;
  const fn = (newQuery, query) => buildUrl(req, newQuery, 'category', query);

  res.render('category/view', {
    category,
    items,
    id,
    page,
    totalPages,
    limit,
    buildUrl: fn,
  });
};

exports.getNoCategoryItems = async (req, res) => {
  const items = await db.getCategoryItems(1);
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
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const category = await db.getCategory(id);
      return res.status(400).render('category/edit', {
        category,
        errors: errors.array(),
      });
    }

    const newCategory = req.body.name;
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
    const { name } = req.body;
    try {
      await db.postCategory(name);
      return res.redirect('/category');
    } catch (error) {
      if (error.code === '23505') {
        return res.render('category/form', { errors: [{ msg: 'Category already exists.' }] });
      }
    }
    return res.status(500).render('category/form', { name, errors: [{ msg: 'An unexpected error occurred.' }] });
  },
];

exports.moveItem = [
  validateCategory,
  async (req, res) => {
    const errors = validationResult(req);
    const items = await db.getCategoryItems(1);
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
    return res.redirect(`/category/${catId}`);
  },
];

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await db.deleteCategory(id);
  res.redirect('/category');
};
