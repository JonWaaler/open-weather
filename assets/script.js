var apiKey = "763af95ff91c9e580b55c19df288e7b3";
var cityName = "toronto";
var units = "metric";

function GetURL() {
  return `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&unitys=${units}`;
}

fetch(GetURL())
  .then(function (response) {
    //promise === callback
    return response.json(); //This also returns a promise
  })
  .then(function (data) {
    console.log(data);
    console.log(data.list[0].main.temp);
  })
  .catch(function (error) {
    console.log(error);
  });
