let url = "http://127.0.0.1:3000";

const btnEnroll = document.querySelector("#event");

// #event 클릭
btnEnroll.addEventListener("click", enroll);

async function enroll(event) {
  const content = document.querySelector("#content").value;
  const nickname = document.querySelector("#nickname").value;

  if (!content) {
    return alert("내용을 입력하세요.");
  }

  // EVENTS API 요청
  const enrollReturn = await axios({
    method: "post", // http method
    url: url + "/events",
    headers: {}, // packet header
    data: { content: content, nickname: nickname }, // packet body
  });

  // 요청이 성공적이지 않다면, alert message
  const isValidEnroll = enrollReturn.data.code == 200;

  if (!isValidEnroll) {
    return alert("요청에 문제가 생겼습니다.");
  }

  // reviews page 이동

  return location.replace("./reviews.html");
}