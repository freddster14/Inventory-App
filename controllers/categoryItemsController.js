const db = require('../models/queries');

exports.getItems = async (req, res) => {
  const { id } = req.query;
  const category = await db.getCategory(id);
  const items = await db.getCategoryItems(category.id);
  res.render('categoryItems', { category, items });
};
