const pool = require('./pool');

exports.getCategories = async (limit, page) => {
  if (limit && page) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query('SELECT * FROM categories WHERE id > 1 LIMIT $1 OFFSET $2', [limit, offset]);
    return rows;
  }
  const { rows } = await pool.query('SELECT * FROM categories WHERE id > 1');
  return rows;
};

exports.getCategory = async (id) => {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0];
};

exports.getCategoryItems = async (categoryId, limit, page) => {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query('SELECT * FROM items WHERE cat_id = $1 LIMIT $2 OFFSET $3', [categoryId, limit, offset]);
  return rows;
};

exports.getAllCategoryItems = async (categoryId) => {
  const { rows } = await pool.query('SELECT * FROM items WHERE cat_id = $1', [categoryId]);
  return rows;
};

exports.getItems = async (limit, page) => {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query('SELECT * FROM items LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
};

exports.getTotalPages = async (limit, table, catId) => {
  if (catId) {
    const { rows } = await pool.query(`SELECT COUNT(*) from ${table} WHERE cat_id = $1`, [catId]);
    const items = parseInt(rows[0].count, 10);
    return Math.ceil(items / limit);
  }
  const { rows } = await pool.query(`SELECT COUNT(*) from ${table}`);
  const items = parseInt(rows[0].count, 10);
  return Math.ceil(items / limit);
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

exports.moveMultipleItems = async (catId, itemsId) => {
  const res = itemsId.split('*').map((id) => parseInt(id, 10));
  res.pop();// Remove NaN tail
  const SQL = `UPDATE items SET cat_id=${catId} WHERE id in (${res})`
  await pool.query(SQL);
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

exports.deleteCategoryItems = async (id) => {
  await pool.query('DELETE FROM items WHERE cat_id=$1', [id]);
};

exports.deleteItem = async (id) => {
  await pool.query('DELETE FROM items WHERE id=$1', [id]);
};

exports.getCategoriesAndCount = async (limit, page) => {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query('SELECT categories.id, categories.name, COUNT(items.id) AS items_count FROM categories LEFT JOIN items ON categories.id = cat_id WHERE categories.id > 1 GROUP BY categories.id LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
};
