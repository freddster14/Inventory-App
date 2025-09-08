const db = require('../models/queries');
const { validationResult } = require('express-validator');
const { validateName, validateCategory } = require('../models/validators');
const { buildUrl } = require('../models/helper-functions');

exports.getCategories = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const totalPages = await db.getTotalPages(limit, 'categories');
  // Revert back to max page as a result of limit change or data
  if (totalPages < page) return res.redirect(`/category?page=${totalPages}&limit=${limit}`);
  const fn = (newQuery, query) => buildUrl(req, newQuery, 'category', query);
  const categories = await db.getCategoriesAndCount(limit, page);
  console.log(categories);
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
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const items = await db.getCategoryItems(category.id, limit, page);
  const totalPages = await db.getTotalPages(limit, 'items', id);
  const fn = (newQuery, query) => buildUrl(req, newQuery, `category/${id}`, query);
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
  const categories = await db.getCategories();
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const items = await db.getCategoryItems(1, limit, page);
  const totalPages = await db.getTotalPages(limit, 'items', 1);
  const fn = (newQuery, query) => buildUrl(req, newQuery, 'category/1', query);
  res.render('category/noCategory', {
    categories,
    items,
    page,
    limit,
    totalPages,
    buildUrl: fn,
    errors: [],
  });
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
  const items = await db.getAllCategoryItems(category.id);
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

exports.deleteAll = async (req, res) => {
  const { id } = req.params;
  await db.deleteCategoryItems(id);
  await db.deleteCategory(id);
  res.redirect('/category');
};

exports.moveNoCatItems = [
  validateCategory,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const items = await db.getCategoryItems(1, limit, page);
      const totalPages = await db.getTotalPages(limit, 'items', 1);
      const fn = (newQuery, query) => buildUrl(req, newQuery, 'category/1', query);
      const categories = await db.getCategories();
      return res.status(400).render('category/noCategory', {
        categories,
        items,
        page,
        limit,
        totalPages,
        buildUrl: fn,
        errors: errors.array(),
      });
    }
    const { items } = req.body;
    const { catId } = req.body;
    await db.moveMultipleItems(catId, items);
    return res.redirect(`/category/${catId}`);
  },
];
