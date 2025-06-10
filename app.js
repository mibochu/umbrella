// OpenWeatherMap API 키
const API_KEY = '56a82f2fb9fa02524336dea5175d7baf';

// DOM 요소
const locationInput = document.getElementById('locationInput');
const saveLocationBtn = document.getElementById('saveLocationBtn');
const locationStatus = document.getElementById('locationStatus');
const savedLocationSpan = document.getElementById('savedLocation');
const weatherInfo = document.getElementById('weatherInfo');
const checkUmbrellaBtn = document.getElementById('checkUmbrellaBtn');
const umbrellaResult = document.getElementById('umbrella-result');

// 한국 도시 한글-영문 매핑 (API에서 실제로 지원하는 도시만 포함)
const cityMapping = {
    '서울': 'Seoul',
    '부산': 'Busan',
    '인천': 'Incheon',
    '대구': 'Daegu',
    '대전': 'Daejeon',
    '광주': 'Gwangju',
    '울산': 'Ulsan',
    '수원': 'Suwon',
    '성남': 'Seongnam',
    '고양': 'Goyang',
    '용인': 'Yongin',
    '안산': 'Ansan',
    '안양': 'Anyang',
    '평택': 'Pyeongtaek',
    '천안': 'Cheonan',
    '전주': 'Jeonju',
    '청주': 'Cheongju',
    '포항': 'Pohang',
    '창원': 'Changwon',
    '김해': 'Gimhae',
    '구미': 'Gumi',
    '원주': 'Wonju',
    '춘천': 'Chuncheon',
    '강릉': 'Gangneung',
    '속초': 'Sokcho',
    '동해': 'Donghae',
    '태백': 'Taebaek',
    '제주': 'Jeju',
    '서귀포': 'Seogwipo'
};

// 한국 주요 도시 목록 (한글)
const koreanCities = Object.keys(cityMapping);

// 자동완성 관련 변수
let autocompleteList = [];
let selectedIndex = -1;

// 자동완성 목록 생성
function createAutocompleteList(input) {
    const value = input.value.trim();
    if (!value) {
        clearAutocomplete();
        return;
    }

    autocompleteList = koreanCities.filter(city => 
        city.includes(value)
    );

    if (autocompleteList.length > 0) {
        showAutocomplete();
    } else {
        clearAutocomplete();
    }
}

// 자동완성 목록 표시
function showAutocomplete() {
    clearAutocomplete();
    const list = document.createElement('ul');
    list.className = 'autocomplete-list';
    
    autocompleteList.forEach((city, index) => {
        const item = document.createElement('li');
        item.textContent = city;
        item.addEventListener('click', () => selectCity(city));
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        }
        list.appendChild(item);
    });

    locationInput.parentNode.appendChild(list);
}

// 자동완성 목록 제거
function clearAutocomplete() {
    const list = document.querySelector('.autocomplete-list');
    if (list) {
        list.remove();
    }
    selectedIndex = -1;
}

// 도시 선택
function selectCity(city) {
    locationInput.value = city;
    clearAutocomplete();
    saveLocation(city);
}

// 지역 저장
async function saveLocation(location) {
    if (!location) {
        alert('도시 이름을 입력해주세요.');
        return;
    }

    try {
        const englishCity = cityMapping[location];
        if (!englishCity) {
            alert('지원하지 않는 도시입니다.');
            return;
        }

        const data = await fetchWeatherData(englishCity);
        if (data) {
            localStorage.setItem('savedLocation', location);
            savedLocationSpan.textContent = `${location}(${englishCity})`;
            displayWeather(data, location);
            umbrellaResult.textContent = ''; // 결과 초기화
        }
    } catch (error) {
        console.error('날씨 정보 가져오기 실패:', error);
        alert('날씨 정보를 가져오는데 실패했습니다.');
    }
}

// 날씨 정보 가져오기
async function fetchWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`);
        if (!response.ok) {
            throw new Error('날씨 정보를 가져오는데 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        console.error('날씨 정보 가져오기 실패:', error);
        throw error;
    }
}

// 날씨 예보 가져오기
async function fetchWeatherForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=kr`);
        if (!response.ok) {
            throw new Error('날씨 예보를 가져오는데 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        console.error('날씨 예보 가져오기 실패:', error);
        throw error;
    }
}

// 날씨 정보 표시
function displayWeather(data, koreanCity) {
    if (!data || !data.weather || !data.weather[0]) {
        weatherInfo.textContent = '날씨 정보를 가져올 수 없습니다.';
        return;
    }

    const weather = data.weather[0];
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const englishCity = cityMapping[koreanCity];

    weatherInfo.innerHTML = `
        <div class="weather-main">
            <span class="weather-emoji">${weatherEmojis[weather.main] || '🌤️'}</span>
            <span class="weather-temp">${temp}°C</span>
        </div>
        <div class="weather-details">
            <p>${koreanCity}(${englishCity})</p>
            <p>${weather.description}</p>
            <p>습도: ${humidity}%</p>
            <p>풍속: ${windSpeed}m/s</p>
        </div>
    `;
}

// 날씨 상태에 따른 이모지
const weatherEmojis = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
    'Mist': '🌫️'
};

// 시간대별 우산 메시지 생성
function getUmbrellaMessage(forecastData) {
    const now = new Date();
    const currentHour = now.getHours();
    const isBefore9AM = currentHour < 9;
    const isAfter6PM = currentHour >= 18;

    // 체크할 시간대 설정
    let checkStartTime, checkEndTime;
    if (isAfter6PM) {
        // 다음날 오전 9시 ~ 오후 6시
        checkStartTime = new Date(now);
        checkStartTime.setDate(checkStartTime.getDate() + 1);
        checkStartTime.setHours(9, 0, 0, 0);
        checkEndTime = new Date(checkStartTime);
        checkEndTime.setHours(18, 0, 0, 0);
    } else {
        // 당일 오전 9시 ~ 오후 6시
        checkStartTime = new Date(now);
        checkStartTime.setHours(9, 0, 0, 0);
        checkEndTime = new Date(now);
        checkEndTime.setHours(18, 0, 0, 0);
    }

    // 비 소식이 있는 시간대 찾기
    const rainTimes = forecastData.list.filter(item => {
        const itemTime = new Date(item.dt * 1000);
        return itemTime >= checkStartTime && 
               itemTime <= checkEndTime && 
               (item.weather[0].main === 'Rain' || 
                item.weather[0].main === 'Drizzle' || 
                item.weather[0].main === 'Thunderstorm');
    });

    if (rainTimes.length === 0) {
        if (isAfter6PM) {
            return "내일 오전 9시 ~ 오후 6시 사이에\n비 소식은 없어요!\n우산은 필요 없어요! 😊";
        } else {
            return "오늘 오전 9시 ~ 오후 6시 사이에\n비 소식은 없어요!\n우산은 필요 없어요! 😊";
        }
    }

    // 비 소식이 있는 시간대 메시지 생성
    const rainTime = rainTimes[0];
    const rainDate = new Date(rainTime.dt * 1000);
    const rainHour = rainDate.getHours();
    const rainMessage = `${rainHour}시`;

    if (isBefore9AM) {
        return `오늘 ${rainMessage}에 비 소식이 있어요!\n우산을 꼭 챙기세요! ☔`;
    } else if (isAfter6PM) {
        return `내일 ${rainMessage}에 비 소식이 있어요!\n자기 전에 우산을 미리 챙겨보세요! ☔`;
    } else {
        return `오늘 ${rainMessage}에 비 소식이 있어요!\n우산을 어떻게든 구해보세요! ☔`;
    }
}

// 우산 체크 버튼 클릭 이벤트
checkUmbrellaBtn.addEventListener('click', async () => {
    const savedLocation = localStorage.getItem('savedLocation');
    if (!savedLocation) {
        alert('먼저 지역을 저장해주세요.');
        return;
    }

    try {
        const englishCity = cityMapping[savedLocation];
        const forecastData = await fetchWeatherForecast(englishCity);
        const message = getUmbrellaMessage(forecastData);
        umbrellaResult.textContent = message;
    } catch (error) {
        console.error('우산 체크 실패:', error);
        alert('우산 체크에 실패했습니다.');
    }
});

// 이벤트 리스너
locationInput.addEventListener('input', () => createAutocompleteList(locationInput));
locationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (autocompleteList.length > 0) {
            selectCity(autocompleteList[selectedIndex >= 0 ? selectedIndex : 0]);
        } else {
            saveLocation(locationInput.value);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (autocompleteList.length > 0) {
            selectedIndex = Math.min(selectedIndex + 1, autocompleteList.length - 1);
            showAutocomplete();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (autocompleteList.length > 0) {
            selectedIndex = Math.max(selectedIndex - 1, -1);
            showAutocomplete();
        }
    } else if (e.key === 'Escape') {
        clearAutocomplete();
    }
});

saveLocationBtn.addEventListener('click', () => saveLocation(locationInput.value));

// 페이지 로드 시 저장된 지역 불러오기
window.addEventListener('load', async () => {
    const savedLocation = localStorage.getItem('savedLocation');
    if (savedLocation) {
        locationInput.value = savedLocation;
        savedLocationSpan.textContent = savedLocation;
        try {
            const data = await fetchWeatherData(cityMapping[savedLocation]);
            if (data) {
                displayWeather(data, savedLocation);
            }
        } catch (error) {
            console.error('저장된 지역 날씨 정보 가져오기 실패:', error);
        }
    }
}); 