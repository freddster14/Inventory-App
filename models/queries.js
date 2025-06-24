const pool = require('./pool');

exports.getCategories = async () => {
  const { rows } = await pool.query('SELECT * FROM categories');
  return rows;
};

exports.getCategory = async (id) => {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0];
};

exports.getCategoryItems = async (categoryId) => {
  const { rows } = await pool.query('SELECT * FROM items WHERE cat_id = $1', [categoryId]);
  return rows;
};

exports.getItem = async (id) => {
  const { rows } = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
  return rows[0];
};

exports.postItem = async (catId, name, info, quantinty) => {
  await pool.query('INSERT INTO items (cat_id, name, info, quantity) VALUES ($1, $2, $3, $4)', [catId, name, info, quantinty]);
};

exports.postCategory = async (category) => {
  await pool.query('INSERT INTO categories (name) VALUES ($1)', [category]);
};

exports.updateCategory = async (id, category) => {
  await pool.query('UPDATE categories SET name=$1 WHERE id=$2', [category, id]);
};
