module.exports = function (app) {
    const index = require("../controllers/indexController");
    const jwtMiddleware = require("../../config/jwtMiddleware");
  
    // 라우터 정의
    // app.HTTP메서드(uri, 컨트롤러 콜백함수)

    // 장소 목록 조회
    app.get("/places", index.readPlaces);

    // 회원가입
    app.post("/sign-up", index.createUsers);

    // 로그인
    app.post("/sign-in", index.createJwt);

    // 로그인 유지, 토큰 검증
    app.get("/jwt", jwtMiddleware, index.readJwt);

    // 리뷰 목록 조회 (광화문)
    app.get("/reviews/:nickname", index.readReviews);
    // 리뷰 목록 조회 (오죽헌)
    app.get("/reviews/:nickname", index.readReviews);

    // 리뷰 생성
    app.post("/events", index.createReviews);
};