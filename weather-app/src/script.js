function getTime(timestamp) {
  let allMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let allDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let now = new Date(timestamp * 1000);
  let month = allMonths[now.getMonth()];
  let weekday = allDays[now.getDay()];
  let theDate = now.getDate();
  let hour = now.getHours();

  let year = now.getFullYear();
  let minutes = now.getMinutes();

  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  if (hour < 12) {
    minutes = `${minutes} AM`;
    if (hour == 0) {
      hour = 12;
    }
  } else {
    minutes = `${minutes} PM`;
    if (hour != 12) {
      hour = hour - 12;
    }
  }

  let currentDayTime = document.querySelector("#current-day-time");
  let updateTime = document.querySelector("#timestamp");
  currentDayTime.innerHTML = `Conditions as of ${hour}:${minutes} ${weekday}:`;
  updateTime.innerHTML = `Last upate: ${hour}:${minutes} ${month} ${theDate}, ${year}`;
  // console.log(`${weekday} ${hour}:${minutes}`);
}

function search(city) {
  if (unitF.classList.contains("active-units")) {
    units = "imperial";
  } else {
    units = "metric";
  }
  //Now get Wx Data by City Name
  let ApiEndpoint = `https://api.openweathermap.org/data/2.5/weather?`;
  let wxKey = `28ae6024d5ca8fdbf0e5b7d7fe38ed95`;
  let ApiUrlCity = `${ApiEndpoint}q=${city}&appid=${wxKey}&units=${units}`;
  //console.log(ApiUrlCity);
  axios.get(ApiUrlCity).then(retrieveWx);
}

function cityName(event) {
  event.preventDefault();
  let city = document.querySelector("#city-input").value;
  search(city);
}

//User entered City Name
let searchForm = document.querySelector(".city-search-form");
searchForm.addEventListener("submit", cityName);
//console.log(searchForm);

function showPosition(position) {
  if (unitF.classList.contains("active-units")) {
    units = "imperial";
  } else {
    units = "metric";
  }

  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  // console.log(position.coords.latitude);
  let ApiEndpoint = `https://api.openweathermap.org/data/2.5/weather?`;
  let wxKey = `28ae6024d5ca8fdbf0e5b7d7fe38ed95`;
  let ApiUrlGeo = `${ApiEndpoint}&lat=${latitude}&lon=${longitude}&appid=${wxKey}&units=${units}`;
  axios.get(ApiUrlGeo).then(retrieveWx);
}

let temp = null;
let tempConvert = null;
let feelsLikeTemp = null;
let feelsLikeTempConvert = null;
let units = null;
let windUnits = null;
let windSpeed = null;
let windUnitsConvert = null;

function retrieveWx(wxData) {
  //console.log(wxData);
  temp = Math.round(wxData.data.main.temp);
  feelsLikeTemp = Math.round(wxData.data.main.feels_like);
  windSpeed = Math.round(wxData.data.wind.speed);

  if (units == "imperial") {
    //then convert to metric
    tempConvert = Math.round(((wxData.data.main.temp - 32) * 5) / 9);
    feelsLikeTempConvert = Math.round(
      ((wxData.data.main.feels_like - 32) * 5) / 9
    );
    windConvert = Math.round(windSpeed * 0.44704);
    windUnits = "mph";
    windUnitsConvert = "m/s";
    //console.log(`the units are ${units}`);
  } else {
    tempConvert = Math.round(wxData.data.main.temp * (9 / 5) + 32);
    feelsLikeTempConvert = Math.round(
      wxData.data.main.feels_like * (9 / 5) + 32
    );
    windUnits = "m/s";
    windConvert = Math.round(windSpeed * 2.23694);
    windUnitsConvert = "mph";
    // console.log(`the units are ${units}`);
  }
  let RH = wxData.data.main.humidity;
  let wxDescription = wxData.data.weather[0].description;
  let wxIcon = wxData.data.weather[0].icon;

  document.querySelector(".city-description").innerHTML = `${wxDescription} in`;
  document.querySelector("#city-name").innerHTML = wxData.data.name;
  document.querySelector("#current-temp").innerHTML = temp;
  document.querySelector("#feels-like").innerHTML = feelsLikeTemp;
  document.querySelector("#humidity").innerHTML = `${RH}%`;
  document.querySelector("#windspeed").innerHTML = `${windSpeed} ${windUnits}`;
  document
    .querySelector("#wx-icon")
    .setAttribute("src", `https://openweathermap.org/img/wn/${wxIcon}.png`);
  document.querySelector("#wx-icon").setAttribute("alt", `${wxDescription}`);

  getTime(wxData.data.dt);

  getForecast(wxData.data.coord);
}

function getForecast(coordinates) {
  //console.log(coordinates);

  let ApiEndpoint = `https://api.openweathermap.org/data/2.5/onecall?`;
  let wxKey = `28ae6024d5ca8fdbf0e5b7d7fe38ed95`;
  let latitude = coordinates.lat;
  let longitude = coordinates.lon;
  let exclude = `hourly,minutely,alerts`;
  if (unitF.classList.contains("active-units")) {
    units = "imperial";
  } else {
    units = "metric";
  }
  let ApiUrlForecast = `${ApiEndpoint}&lat=${latitude}&lon=${longitude}&exclude=${exclude}&appid=${wxKey}&units=${units}`;
  //console.log(ApiUrlForecast);
  axios.get(ApiUrlForecast).then(displayForecast);
}

function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  let day = date.getDay();
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return days[day];
}

function displayForecast(response) {
  //console.log(response.data.daily);
  forecastData = response.data.daily;

  let forecastHTML = "";
  forecastHTML = forecastHTML + `<div class="row">`;

  forecastData.forEach(function (forecastDay, index) {
    if (index < 6) {
      let theDay = formatDay(forecastDay.dt);
      if (index < 1) {
        theDay = "Today";
      }
      forecastHTML =
        forecastHTML +
        `<div class="daily-forecast col-2">
              <ul>
                <li>
                ${theDay}
                </li>
                <li class="daily-icon"><img src="https://openweathermap.org/img/wn/${
                  forecastDay.weather[0].icon
                }@2x.png" alt="" width="40" /></li>
                <li>
                  <span class="hi-temp">${Math.round(
                    forecastDay.temp.max
                  )}°</span>
                  <span class="low-temp"> / ${Math.round(
                    forecastDay.temp.min
                  )}°</span>
                </li>
              </ul>
            </div>`;
    }
  });

  forecastHTML = forecastHTML + ` </div>`;
  document.querySelector("#forecast").innerHTML = forecastHTML;
}

function convertTemp(event) {
  event.preventDefault();

  if (unitF.classList.contains("active-units")) {
    unitF.classList.remove("active-units");
    unitF.classList.add("inactive-units");
    unitC.classList.add("active-units");
    unitC.classList.remove("inactive-units");
  } else {
    unitC.classList.remove("active-units");
    unitC.classList.add("inactive-units");
    unitF.classList.add("active-units");
    unitF.classList.remove("inactive-units");
  }

  let displayTemp = document.querySelector("#current-temp");
  let displayFeelsLikeTemp = document.querySelector("#feels-like");
  let forecastHiTemps = document.querySelectorAll("span.hi-temp");
  let forecastLowTemps = document.querySelectorAll("span.low-temp");
  let displayWind = document.querySelector("#windspeed");
  // console.log(`Testing if i still have access to day 1 MaxT: ${forecastData[0].temp.max}`);

  //If searched units were imperial, convert to metric
  if (units == "imperial" && unitC.classList.contains("active-units")) {
    displayTemp.innerHTML = `${tempConvert}`;
    displayFeelsLikeTemp.innerHTML = `${feelsLikeTempConvert}`;
    displayWind.innerHTML = `${windConvert} ${windUnitsConvert}`;

    //console.log(`Testing again to day 1 MaxT: ${forecastData[0].temp.max}`);
    forecastData.forEach(function (forecastTemp, index) {
      if (index < 6) {
        forecastHiTemps[index].innerHTML = `${Math.round(
          ((forecastTemp.temp.max - 32) * 5) / 9
        )}°`;
        forecastLowTemps[index].innerHTML = ` | ${Math.round(
          ((forecastTemp.temp.min - 32) * 5) / 9
        )}°`;
      }
    });

    //If searched units were metric, convert to imperial
  } else if (units == "metric" && unitF.classList.contains("active-units")) {
    displayTemp.innerHTML = `${tempConvert}`;
    displayFeelsLikeTemp.innerHTML = `${feelsLikeTempConvert}`;
    displayWind.innerHTML = `${windConvert} ${windUnitsConvert}`;

    //console.log(`Testing again to day 1 MaxT: ${forecastData[0].temp.max}`);
    forecastData.forEach(function (forecastTemp, index) {
      if (index < 6) {
        forecastHiTemps[index].innerHTML = `${Math.round(
          forecastTemp.temp.max * (9 / 5) + 32
        )}°`;
        forecastLowTemps[index].innerHTML = ` | ${Math.round(
          forecastTemp.temp.min * (9 / 5) + 32
        )}°`;
      }
    });
    //If returning to searched units
  } else if (
    (units == "metric" && unitC.classList.contains("active-units")) ||
    (units == "imperial" && unitF.classList.contains("active-units"))
  ) {
    displayTemp.innerHTML = `${temp}`;
    displayFeelsLikeTemp.innerHTML = `${feelsLikeTemp}`;
    displayWind.innerHTML = `${windSpeed} ${windUnits}`;

    forecastData.forEach(function (forecastTemp, index) {
      if (index < 6) {
        forecastHiTemps[index].innerHTML = `${Math.round(
          forecastTemp.temp.max
        )}°`;
        forecastLowTemps[index].innerHTML = ` | ${Math.round(
          forecastTemp.temp.min
        )}°`;
      }
    });
  }
}

let degreesFtoC = document.querySelector(".degreesC");
degreesFtoC.addEventListener("click", convertTemp);

let degreesCtoF = document.querySelector(".degreesF");
degreesCtoF.addEventListener("click", convertTemp);

let unitC = document.querySelector(".degreesC");
let unitF = document.querySelector(".degreesF");

let forecastData = [];

function getPosition(event) {
  event.preventDefault();
  document.getElementById("city-input").value = "";
  navigator.geolocation.getCurrentPosition(showPosition);
}
let buttonLocation = document.querySelector("#button-location");
buttonLocation.addEventListener("click", getPosition);

//on load, search for a defualt city
search("New York");
