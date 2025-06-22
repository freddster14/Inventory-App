const pool = require('./pool');

exports.getCategories = async () => {
  const { rows } = await pool.query('SELECT * FROM categories;');
  return rows;
};

exports.getCategory = async (id) => {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1;', [id]);
  return rows[0];
};

exports.getCategoryItems = async (categoryId) => {
  const { rows } = await pool.query('SELECT * FROM items WHERE cat_id = $1;', [categoryId]);
  return rows;
};

exports.getItem = async (id) => {
  const { rows } = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
  return rows[0];
};
