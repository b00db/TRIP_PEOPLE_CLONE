const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const jwt = require("jsonwebtoken");
const secret = require("../../config/secret");
const indexDao = require("../dao/indexDao");

// 장소 조회
exports.readPlaces = async function(req, res) {
  const { category } = req.query;

  if(category) {
    const validCategory = [
      "강원",
      "서울",
      "경북·대구",
      "경기",
      "부산",
      "전남·광주",
      "제주",
      "충남·대전",
      "경남",
      "충북",
      "전북",
      "인천",
    ];

    if(!validCategory.includes(category)) {
      return res.send({
        isSuccess: false,
        code: 400, // 요청 성공시 200번대 코드
        message: "유효한 카테고리가 아닙니다.",
      });
    }
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [rows] = await indexDao.selectPlaces(connection, category); // 비구조 할당

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "장소 목록 요청 성공",
      });
    } catch (err) {
      logger.error(`readPlaces Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`readPlaces DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 예시 코드
exports.example = async function (req, res) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [rows] = await indexDao.exampleDao(connection); // 비구조 할당

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "요청 성공",
      });
    } catch (err) {
      logger.error(`example Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`example DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};