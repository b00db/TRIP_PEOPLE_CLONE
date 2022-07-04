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

// 회원가입
exports.createUsers = async function (req, res) {
  const { id, password, nickname } = req.body;

  // 1. 유저 데이터 검증
  const idRegExp = /^[a-z]+[a-z0-9]{5,19}$/; // 아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20
  const passwordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/; // 비밀번호 정규식 8-16 문자, 숫자 조합
  const nicknameRegExp = /^[가-힣|a-z|A-Z|0-9|]{2,10}$/; // 닉네임 정규식 2-10 한글, 숫자 또는 영문

  if (!idRegExp.test(id)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20",
    });
  }

  if (!passwordRegExp.test(password)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "비밀번호 정규식 8-16 문자, 숫자 조합",
    });
  }

  if (!nicknameRegExp.test(nickname)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "닉네임 정규식 2-10 한글, 숫자 또는 영문",
    });
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // DB 입력
      const [rows] = await indexDao.insertUsers(
        connection,
        id,
        password,
        nickname
      );

      // 입력된 유저 인덱스
      const userId = rows.insertId;

      // JWT 발급
      const token = jwt.sign(
        { userId: userId, nickname: nickname }, // payload 정의
        secret.jwtsecret // 서버 비밀키
      );

      return res.send({
        result: { jwt: token },
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "회원가입 성공",
      });
    } catch (err) {
      logger.error(`createUsers Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`createUsers DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 로그인
exports.createJwt = async function (req, res) {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "회원정보를 입력해주세요.",
    });
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // DB 회원 검증
      const [rows] = await indexDao.isValidUsers(connection, id, password);

      if (rows.length < 1) {
        return res.send({
          isSuccess: false,
          code: 410, // 요청 실패시 400번대 코드
          message: "회원정보가 존재하지 않습니다.",
        });
      }

      const { userId, nickname } = rows[0];

      // JWT 발급
      const token = jwt.sign(
        { userId: userId, nickname: nickname }, // payload 정의
        secret.jwtsecret // 서버 비밀키
      );

      return res.send({
        result: { jwt: token },
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "로그인 성공",
      });
    } catch (err) {
      logger.error(`createJwt Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`createJwt DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 로그인 유지, 토큰 검증
exports.readJwt = async function (req, res) {
  const { userId, nickname } = req.verifiedToken;

  return res.send({
    result: { userId: userId, nickname: nickname },
    code: 200, // 요청 실패시 400번대 코드
    message: "유효한 토큰입니다.",
  });
};

// 리뷰 목록 조회
exports.readReviews = async function(req, res) {
  const { nickname } = req.params;

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [rows] = await indexDao.selectReviews(connection, nickname); // 비구조 할당

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "리뷰 목록 요청 성공",
      });
    } catch (err) {
      logger.error(`readReviews Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`readReviews DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 리뷰 생성
exports.createReviews = async function (req, res) {
  const { userId, placeId, createdAt, updatedAt, content } = req.body;

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [rows] = await indexDao.insertReviews(
        connection,
        userId, 
        placeId,
        createdAt,
        updatedAt,
        content
      ); // 비구조 할당

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "리뷰 생성 성공",
      });
    } catch (err) {
      logger.error(`createReviews Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`createReviews DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};