let url = "http://127.0.0.1:3000";

// 로컬스토리지에서 x-access-token 확인
const jwt = localStorage.getItem("x-access-token");
setHeader(jwt);

//리뷰 하나 보기 이벤트 연결
const btnSignOut = document.querySelector("#sign-out");
btnSignOut.addEventListener("click", signOut);

async function setHeader(jwt) {
  if (!jwt) {
    return false;
  }

  // 토큰 검증 API 요청
  const jwtReturn = await axios({
    method: "get", // http method
    url: url + "/jwt",
    headers: { "x-access-token": jwt }, // packet header
    data: {}, // packet body
  });

  // 유효한 토큰이 아니라면, 로그인 페이지 이동
  const isValidJwt = jwtReturn.data.code == 200;

  if (!isValidJwt) {
    return location.replace("./signin.html");
  }

  // 유효한 토큰이라면 로그인 상태 확인. 헤더 로그인/회원가입 -> 안녕하세요 (닉네임)님으로 수정
  const userId = jwtReturn.data.result.userId;
  const nickname = jwtReturn.data.result.nickname;

  // .unsigned에 .hidden 추가, .signed에 .hidden 삭제
  // .nickname의 innerText로 nickname 설정
  const reviewTitle = document.querySelector(".review-title");
  const reviewNickname = document.querySelectorAll("review-nickname");
  
  divUnsigned.classList.add("hidden");
  divSigned.classList.remove("hidden");
  for(let i=0; i<reviewNickname.length; i++) {
    reviewNickname[i].innerText = nickname;
  }  

  return true;
}

function signOut(event) {
  localStorage.removeItem("x-access-token"); // 토큰 삭제하고
  location.reload(); // 새로고침
}