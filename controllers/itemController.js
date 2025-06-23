const db = require('../models/queries');

exports.getItem = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  res.render('item', { item });
};

exports.getItemForm = (req, res) => {
  res.render('itemForm');
};

exports.postItem = async (req, res) => {
  const categoryId = await db.searchCategory(req.body.category);
  res.redirect(`/category/${categoryId}`);
};
