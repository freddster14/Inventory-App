const pool = require('./pool');

async function queryAll(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows || null;
}

async function queryOne(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

async function execute(sql, params = []) {
  await pool.query(sql, params);
}

async function getPagination(sql, params, limit = 12, page = 1) {
  const offset = (page - 1) * limit;
  const newParams = [...params];
  newParams.push(offset);
  const { rows } = await pool.query(sql, newParams);
  return rows;
}

async function getCount(table, whereClause, params = []) {
  const { rows } = whereClause
    ? await pool.query(`SELECT COUNT(*) FROM ${table} WHERE ${whereClause}`, params)
    : await pool.query(`SELECT COUNT(*) FROM ${table}`);
  return parseInt(rows[0].count, 10);
}

async function updateById(table, id, data) {
  const keys = Object.keys(data);
  const values = keys.map((key) => data[key]);
  const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(', ');
  values.push(id);
  const sql = `UPDATE ${table} SET ${setClause} WHERE id=$${values.length}`;
  await pool.query(sql, values);
}

async function insertOne(table, data) {
  const keys = Object.keys(data);
  const values = keys.map((key) => data[key]);
  const columns = keys.join(', ');
  const placeholders = keys.map((key, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  await pool.query(sql, values);
}

module.exports = {
  queryAll,
  queryOne,
  execute,
  getPagination,
  getCount,
  updateById,
  insertOne,
};
