exports.buildUrl = (req, newQuery, url, query) => {
  const params = new URLSearchParams(req.query);
  params.set(query, newQuery);
  return `/${url}?${params.toString()}`;
};
