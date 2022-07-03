const { pool } = require("../../config/database");

exports.selectPlaces = async function (connection, category) {
  const selectAllPlacesQuery = `SELECT placeName, placeAddress, category, reviewUrl FROM Places WHERE status = 'A'; `;
  const selectCategorizedPlacesQuery = `SELECT placeName, placeAddress, category, reviewUrl FROM Places WHERE status = 'A' AND category = ?; `;
  
  const Params = [category];

  const Query = category ? selectCategorizedPlacesQuery : selectAllPlacesQuery;

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.exampleDao = async function (connection, params) {
  const Query = ``;
  const Params = [];

  const rows = await connection.query(Query, Params);

  return rows;
};