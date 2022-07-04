var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(38, 127), //지도의 중심좌표.
	level: 15 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// 데이터셋 가져오기
async function getDataSet(category) {
  let qs = category;
  if(!qs) {
    qs = "";
  }

  const dataSet = await axios({
    method: "get", // http method
    url: `http://localhost:3000/places?category=${qs}`,
    headers: {}, // packet header
    data: {}, // packet body
  });

  return dataSet.data.result;
}

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 주소-좌표 변환 함수
function getCoordsByAddress(address) {
    return new Promise((resolve, reject) => {
        // 주소로 좌표를 검색합니다
        geocoder.addressSearch(
            address,
            function(result, status) {
                // 정상적으로 검색이 완료됐으면 
                if (status === kakao.maps.services.Status.OK) {
                    var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                    resolve(coords);
                    return;
                }
                reject(new Error("getCoordsByAddress Error: Not Vaild Address"));
            }
        );
    });
}

function getContent(data) {
    // 인포윈도우 가공하기
    return `
        <div class="infowindow">
            <div class="infowindow-img-container">
                <img src="triple.jpg" class="infowindow-img" />
            </div>
            <div class="infowindow-body">
                <h5 class="infowindow-title">${data.placeName}</h5>
                <p class="infowindow-address">${data.placeAddress}</p>
                <a href="${data.reviewUrl}" class="infowindow-btn" target="_blank">페이지 이동</a>
            </div>
        </div>
    `;
}

// 비동기 처리
async function setMap(dataSet) {
    for (var i = 0; i < dataSet.length; i ++) {
        // 마커를 생성합니다
        let coords = await getCoordsByAddress(dataSet[i].placeAddress);
        var marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: coords, // 마커를 표시할 위치
        });

        markerArray.push(marker);

        // 마커에 표시할 인포윈도우를 생성합니다 
        var infowindow = new kakao.maps.InfoWindow({
            content: getContent(dataSet[i]) // 인포윈도우에 표시할 내용
        });

        infowindowArray.push(infowindow);

        // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
        // 이벤트 리스너로는 클로저를 만들어 등록합니다 
        // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
        kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow, coords));
        kakao.maps.event.addListener(map, 'click', makeOutListener(infowindow));
    }    
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(map, marker, infowindow, coords) {
    return function() {
        // 클릭 시 다른 인포윈도우 닫기
        closeInfoWondow();

        infowindow.open(map, marker);

        // 클릭한 곳으로 지도 중심 옮기기
        map.panTo(coords);
    };
}

let infowindowArray = [];
function closeInfoWondow() {
    for(let infowindow of infowindowArray) {
        infowindow.close();
    }
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
    return function() {
        infowindow.close();
    };
}

// 카테고리

const categoryMap = {
    gangwon: "강원",
    seoul: "서울",
    gyeongbuk: "경북·대구",
    gyeonggi: "경기",
    busan: "부산",
    jeonam: "전남·광주",
    jeju: "제주",
    chungnam: "충남·대전",
    gyeongnam: "경남",
    chungnuk: "충북",
    jeonbuk: "전북",
    incheon: "인천",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event) {
    const categoryId = event.target.id;
    const category = categoryMap[categoryId];

    try {
      // 데이터 분류
      let categorizedDataSet = await getDataSet(category);

      // 기존 마커 삭제
      closeMarker();

      // 기존 인포윈도우 닫기
      closeInfoWondow();

      setMap(categorizedDataSet);
    } catch (error) {
      console.error(error);  
    }
}

let markerArray = [];
function closeMarker() {
    for(let marker of markerArray) {
        marker.setMap(null);
    }
}

async function setting() {
  try {
    const dataSet = await getDataSet(); // 데이터셋 가져오기 API 호출
    setMap(dataSet);
  } catch (error) {
    console.error(error);
  }
}

setting();