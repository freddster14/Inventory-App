const db = require('../models/queries');

exports.getItem = async (req, res) => {
  const { id } = req.query;
  const item = await db.getItem(id);
}