var apiKey = "763af95ff91c9e580b55c19df288e7b3";
var cityName = "Toronto";
var units = "metric";

var forecastHourly = [];
var forecastWeather = [];
var weatherByDay = []; // This holds the weather by 24hr increments, also used to help sort
var accuWeather = [[], [], [], [], []]; // this separate each days weather by date so we can find the min/max temps
var minmaxTemp = []; // This holds the final min and max temp for the day

var storePastSearches = ["", "", "", "", "", ""];

var mainHtmlString = `      <!-- Card container -->
<div class="container">
  <!-- Weather charts-->
  <div class="col">
    <!-- Main card -->
    <div class="row">

      <div id="main-card" class="">

      </div>

      <div class="col-sm-4 mt-4">
        <h4>Past Searches</h4>
        <button id="btn1" class="btn btn-outline-primary m-1"></button>
        <button id="btn2" class="btn btn-outline-primary m-1"></button>
        <button id="btn3" class="btn btn-outline-primary m-1"></button>
        <button id="btn4" class="btn btn-outline-primary m-1"></button>
        <button id="btn5" class="btn btn-outline-primary m-1"></button>
        <button id="btn6" class="btn btn-outline-primary m-1"></button>
      </div>

    </div>

    <!-- Forecast Title -->
    <div class="row forecast-title">
      <h2>5-Day Forecast</h2>
    </div>

    <!-- 5 day forecast -->
    <div id="cards" class="row row-cols-auto">
      
    </div>
  </div>
</div>`;

function GetURL(name) {
  return `https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${apiKey}&units=${units}`; // 5day/3hour forecast
}

fetch(GetURL("Toronto"))
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    for (let i = 0; i < 40; i++) {
      forecastHourly[i] = CreateHourlyArray(data.list[i].dt, data.list[i]);
    }
    console.log(data.city.name);

    // Sort data
    SeparateDataByDay();
    //Creating visual cards
    CreateMainWeatherCard(data.city.name);
    CreateWeatherCards();

    // load past searches at start
    LoadLocalStorage();
  })
  .catch(function (error) {
    console.log(error);
    $("main").html(
      `<h3 class="error-code">Search result error. Please provide a valid city.</h3>`
    );
  });

// https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
function CreateHourlyArray(unixtime, listItem) {
  //console.log(listItem.weather[0].icon);
  var a = new Date(unixtime * 1000);
  var months = [
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
  var _year = a.getFullYear();
  var _month = months[a.getMonth()];
  var _date = a.getDate();
  //var _hour = a.getHours();
  //var _min = a.getMinutes();
  //var _sec = a.getSeconds();
  /*var time = date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;*/
  var forecast = [
    {
      year: _year,
      month: _month,
      date: _date,
      temp: listItem.main.temp,
      tempMax: listItem.main.temp_max,
      tempMin: listItem.main.temp_min,
      humidity: listItem.main.humidity,
      windSpeed: listItem.wind.speed,
      feelsLike: listItem.main.feels_like,
      weather_id: listItem.weather[0].icon,
      weather_desc: listItem.weather[0].description,
    },
  ];

  return forecast;
}

function SeparateDataByDay() {
  weatherByDay = [];

  // Figure out which days i have to look for
  for (let i = 0; i < 39; i += 8) {
    weatherByDay.push(forecastHourly[i]);
  }

  // Now that we know which date are being forecasted we can push every other date into an array
  for (let i = 0; i < 39; i++) {
    switch (forecastHourly[i][0].date) {
      case weatherByDay[0][0].date:
        accuWeather[0].push(forecastHourly[i]);
        break;
      case weatherByDay[1][0].date:
        accuWeather[1].push(forecastHourly[i]);
        break;
      case weatherByDay[2][0].date:
        accuWeather[2].push(forecastHourly[i]);
        break;
      case weatherByDay[3][0].date:
        accuWeather[3].push(forecastHourly[i]);
        break;
      case weatherByDay[4][0].date:
        accuWeather[4].push(forecastHourly[i]);
        break;
      default:
        break;
    }
  }

  // Now find each days min/max weather
  // Loop for each day
  for (let i = 0; i < 5; i++) {
    var min = 999;
    var max = -999;
    // Loop for each data point in the array. Each day stores up to 8 data points (aka the 3hr forecasting)
    for (let j = 0; j < accuWeather[i].length; j++) {
      if (accuWeather[i][j][0].tempMin < min) {
        min = accuWeather[i][j][0].tempMin;
      }
      if (accuWeather[i][j][0].tempMax > max) {
        max = accuWeather[i][j][0].tempMax;
      }
    }
    var temp = [{ day_maxTemp: max, day_minTemp: min }];

    minmaxTemp[i] = temp;
  }
}

function CreateMainWeatherCard(name) {
  var mainCardString = "";

  mainCardString += `
  <div class="card border-primary mb-3" style="max-width: 18rem;">
  <div class="card-header">Current Weather</div>
  <div class="card-body text-primary">
    <h5 class="card-title">${name}</h5>
    <p class="card-text">Temperature: ${weatherByDay[0][0].temp}&#176;</p>
    <p class="card-text">Feels Like: ${weatherByDay[0][0].feelsLike}&#176;</p>
    <p class="card-text">Humidity: ${weatherByDay[0][0].humidity}%</p>
    <p class="card-text">Wind Speed: ${weatherByDay[0][0].windSpeed}m/s</p>
  </div>
</div>
  `;

  $("#main-card").html(mainCardString);
}

// the data is sorted into arrays
// This functions takes the sorted data and creates the 5 day forecast
function CreateWeatherCards() {
  // Add cards to #cards selector
  var cardString = "";

  // Create the string
  for (let i = 0; i < 5; i++) {
    cardString += `<div class="col">
    <div class="card border-info" style="width: 10rem;">
      <div class="card-body">
        <h5 class="card-title">${weatherByDay[i][0].month}/${weatherByDay[i][0].date}/${weatherByDay[i][0].year}</h5>
        <h6 class="card-subtitle mb-2 text-muted"></h6>
        <img src="http://openweathermap.org/img/wn/${weatherByDay[i][0].weather_id}@2x.png" alt="symbol of the weather">
        <p class="card-text weather-desc">${weatherByDay[i][0].weather_desc}</p>
        <p class="card-text">${minmaxTemp[i][0].day_maxTemp}&#176;/ ${minmaxTemp[i][0].day_minTemp}&#176;</p>
        <p class="card-text">Humidity: ${weatherByDay[i][0].humidity}%</p>
      </div>
    </div>
  </div>`;
  }

  // Add weather cards
  $("#cards").html(cardString);
}

// Drop down unit changing functionality
$(document).ready(function () {
  //$("#navbarDropdown");       This is dropdown display title
  $(".dropdown-menu a").on("click", function () {
    var txt = $(this).text();
    $("#navbarDropdown").text(`Unit: ${txt}`);
    if (txt[1] == "F") {
      units = "imperial";
      FetchData(cityName);
    }
    if (txt[1] == "C") {
      units = "metric";
      FetchData(cityName);
    }
  });
});

function ResetWorkSpace() {
  forecastHourly = [];
  forecastWeather = [];
  minmaxTemp = [];
  weatherByDay = [];
  accuWeather = [[], [], [], [], []];
  minmaxTemp = [];

  $("main").html(mainHtmlString);
}

function FetchData(name) {
  ResetWorkSpace();

  console.log("TestName:" + name);
  console.log("URL:" + GetURL(name));

  // Fetch data as json
  fetch(GetURL(name))
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (let i = 0; i < 40; i++) {
        forecastHourly[i] = CreateHourlyArray(data.list[i].dt, data.list[i]);
      }
      console.log(data.city.name);

      // Sort data
      SeparateDataByDay();
      //Creating visual cards
      CreateMainWeatherCard(data.city.name);
      CreateWeatherCards();

      LoadLocalStorage();
    })
    .catch(function (error) {
      console.log(error);
      $("main").html(
        `<h3 class="error-code">Search result error. Please provide a valid city.</h3>`
      );
    });

  // Clear search-form
  $("#search-form").val("");
}

// Search bar functionality
$("#search").click(function (event) {
  event.preventDefault();

  // Get search form input from user
  var p_cityName = $("#search-form").val();
  cityName = p_cityName;

  // Save search
  SaveSearch(cityName);

  FetchData(p_cityName);
});

// Checks each 'past search' button if clicked
for (let i = 1; i <= 6; i++) {
  $(`#btn${i}`).click(function (event) {
    event.preventDefault();

    cityName = $(`#btn${i}`).text();

    FetchData($(`#btn${i}`).text());
  });
}

function SaveSearch(search) {
  for (let i = 5; i >= 1; i--) {
    // Shift older search results
    storePastSearches[i] = storePastSearches[i - 1];
  }

  // Saves new search to first item
  storePastSearches[0] = search;

  // saves searches in storage
  localStorage.setItem("pastSearches", storePastSearches);

  // for some reason it wasn't updating so this fo
  //setTimeout(LoadLocalStorage, 500);
}

function LoadLocalStorage() {
  if (localStorage.getItem("pastSearches") !== null) {
    storePastSearches = localStorage.getItem("pastSearches");

    storePastSearches = storePastSearches.split(",");
    console.log(storePastSearches);

    // Set buttons text from local storage
    for (let i = 0; i < 6; i++) {
      $(`#btn${i + 1}`).text(storePastSearches[i]);
    }
  }
}
