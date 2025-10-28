const { validationResult } = require('express-validator');
const { validateName, validateCategory } = require('../models/validators');
const { buildUrl } = require('../models/helper-functions');
const {
  getCount,
  getPagination,
  queryOne, queryAll,
  updateById,
  insertOne,
  execute,
} = require('../models/query-helpers');

exports.getCategories = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const totalPages = Math.ceil(await getCount('categories') / limit);
  // Revert back to max page as a result of limit change or data
  if (totalPages < page) return res.redirect(`/category?page=${totalPages}&limit=${limit}`);
  const fn = (newQuery, query) => buildUrl(req, newQuery, 'category', query);
  const categories = await getPagination('SELECT categories.id, categories.name, COUNT(items.id) AS items_count FROM categories LEFT JOIN items ON categories.id = cat_id WHERE categories.id > 1 GROUP BY categories.id LIMIT $1 OFFSET $2', [], limit, page);
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
  const category = await queryOne('SELECT * FROM categories WHERE id = $1', [id]);
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const items = await getPagination('SELECT * FROM items WHERE cat_id = $1 LIMIT $2 OFFSET $3', [category.id], limit, page);
  const totalPages = Math.ceil(await getCount('items', 'cat_id=$1', [id]) / limit);
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
  const categories = await queryAll('SELECT * FROM categories WHERE id > 1');
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const items = await getPagination('SELECT * FROM items WHERE cat_id=$1 LIMIT $2 OFFSET $3', [1], limit, page);
  const totalPages = Math.ceil(await getCount('items', 'cat_id=$1', [1]) / limit);
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
  const category = await queryOne('SELECT * FROM categories WHERE id = $1', [id]);
  res.render('category/edit', { category, errors: [] });
};

exports.getDelete = async (req, res) => {
  const { id } = req.params;
  const category = await queryOne('SELECT * FROM categories WHERE id = $1', [id]);
  const items = await queryAll('SELECT * FROM items WHERE cat_id = $1', [category.id]);
  res.render('category/delete', { category, length: items.length });
};

exports.updateCategory = [
  validateName,
  async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const category = await queryOne('SELECT * FROM categories WHERE id = $1', [id]);
      return res.status(400).render('category/edit', {
        category,
        errors: errors.array(),
      });
    }

    let newCategory = req.body.name;
    newCategory = newCategory.charAt(0).toUpperCase() + newCategory.slice(1);
    try {
      await updateById('categories', id, { name: newCategory });
      return res.redirect(`/category/${id}`);
    } catch (error) {
      // Express dupe error code
      if (error.code === '23505') {
        const category = await queryOne('SELECT * FROM categories WHERE id = $1', [id]);
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
      await insertOne('categories', { name });
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
    if (!errors.isEmpty()) {
      const categories = await queryAll('SELECT * FROM categories WHERE id>1');
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const items = await getPagination('SELECT * FROM items WHERE id>$1', [1], limit, page);
      const totalPages = Math.ceil(await getCount('items', 'cat_id=$1', [1]) / limit);
      const fn = (newQuery, query) => buildUrl(req, newQuery, 'category/1', query);
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
    const { id } = req.params;
    const { catId } = req.body;
    await updateById('items', id, { cat_id: catId });
    return res.redirect(`/category/${catId}`);
  },
];

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await execute('DELETE FROM categories WHERE id=$1', [id]);
  res.redirect('/category');
};

exports.deleteAll = async (req, res) => {
  const { id } = req.params;
  await execute('DELETE FROM items WHERE cat_id=$1', [id]);
  await execute('DELETE FROM categories WHERE id=$1', [id]);
  res.redirect('/category');
};

exports.moveNoCatItems = [
  validateCategory,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const items = await getPagination('SELECT * FROM items WHERE cat_id=$1 LIMIT $2 OFFSET $3', [1], limit, page)
      const totalPages = Math.ceil(await getCount('items', 'cat_id=$1', [1]) / limit);
      const fn = (newQuery, query) => buildUrl(req, newQuery, 'category/1', query);
      const categories = await queryAll('SELECT * FROM categories WHERE id>1');
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
    const desirealizedId = items.split('*').map((id) => parseInt(id, 10));
    desirealizedId.pop();
    await execute(`UPDATE items SET cat_id=${catId} WHERE ID IN (${desirealizedId.join(', ')})`);
    return res.redirect(`/category/${catId}`);
  },
];
