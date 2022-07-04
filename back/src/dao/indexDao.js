const { pool } = require("../../config/database");

// 회원가입
exports.insertUsers = async function (connection, id, password, nickname) {
  const Query = `insert into Users(id, password, nickname) values (?,?,?);`;
  const Params = [id, password, nickname];

  const rows = await connection.query(Query, Params);

  return rows;
};

// 로그인 (회원검증)
exports.isValidUsers = async function (connection, id, password) {
  const Query = `SELECT userId, nickname FROM Users where id = ? and password = ? and status = 'A';`;
  const Params = [id, password];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.selectPlaces = async function (connection, category) {
  const selectAllPlacesQuery = `SELECT placeName, placeAddress, category, reviewUrl FROM Places WHERE status = 'A'; `;
  const selectCategorizedPlacesQuery = `SELECT placeName, placeAddress, category, reviewUrl FROM Places WHERE status = 'A' AND category = ?; `;
  
  const Params = [category];

  const Query = category ? selectCategorizedPlacesQuery : selectAllPlacesQuery;

  const rows = await connection.query(Query, Params);

  return rows;
};
