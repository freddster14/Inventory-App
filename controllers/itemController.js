const db = require('../models/queries');

exports.getItem = async (req, res) => {
  const { id } = req.params;
  const item = await db.getItem(id);
  res.render('item', { item });
};

exports.getItemForm = async (req, res) => {
  const categories = await db.getCategories();
  res.render('itemForm', { categories });
};

exports.postItem = async (req, res) => {
  const {
    catId,
    name,
    info,
    quantity,
  } = req.body;
  await db.postItem(catId, name, info, quantity);
  res.redirect(`/category/${catId}`);
};
