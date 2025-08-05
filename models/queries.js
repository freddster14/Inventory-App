const pool = require('./pool');

exports.getCategories = async (limit = 1) => {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id>$1', [limit]);
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

exports.getItems = async (limit = 10) => {
  const { rows } = await pool.query('SELECT * FROM items LIMIT $1', [limit]);
  return rows;
};

exports.getItem = async (id) => {
  const { rows } = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
  return rows[0];
};

exports.postItem = async (catId, name, info, price, quantity) => {
  await pool.query('INSERT INTO items (cat_id, name, info, price, quantity) VALUES ($1, $2, $3, $4, $5)', [catId, name, info, price, quantity]);
};

exports.updateItem = async (item, info, price, quantity) => {
  await pool.query('UPDATE items SET info=$2, price=$3, quantity=$3 WHERE id=$1', [item.id, info, price, quantity]);
};

exports.moveItem = async (catId, id) => {
  await pool.query('UPDATE items SET cat_id=$1 WHERE id=$2', [catId, id]);
};

exports.postCategory = async (category) => {
  const capitalizeCat = category.charAt(0).toUpperCase() + category.slice(1);
  await pool.query('INSERT INTO categories (name) VALUES ($1)', [capitalizeCat]);
};

exports.updateCategory = async (id, category) => {
  const capitalizeCat = category.charAt(0).toUpperCase() + category.slice(1);
  await pool.query('UPDATE categories SET name=$1 WHERE id=$2', [capitalizeCat, id]);
};

exports.deleteCategory = async (id) => {
  await pool.query('DELETE FROM categories WHERE id=$1', [id]);
};

exports.deleteItem = async (id) => {
  await pool.query('DELETE FROM items WHERE id=$1', [id]);
};
