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

// 리뷰 조회
exports.selectReviews = async function (connection, nickname) {
  const selectAllReviewsQuery = `SELECT * FROM Reviews WHERE status = 'A';`;
  const selectReviewsByNicknameQuery = `SELECT * FROM Reviews, Users WHERE Reviews.userId = Users.userId AND nickname = ? AND status = 'A';`;

  const Params = [nickname];

  let Query = nickname ? selectReviewsByNicknameQuery : selectAllReviewsQuery;

  const rows = await connection.query(Query, Params);

  return rows;
};

// 리뷰 생성
exports.insertReviews = async function (connection, userId, placeId, createdAt, updatedAt, content) {
  const Query = `insert into Reviews(userId, placeId, createdAt, updatedAt, content) values (?,?,?,?,?);`;
  const Params = [userId, placeId, createdAt, updatedAt, content];

  const rows = await connection.query(Query, Params);

  return rows;
};