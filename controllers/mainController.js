const db = require('../models/queries');

exports.getHome = async (req, res) => {
  const categories = await db.getCategories();
  res.render('homepage', { categories });
};
