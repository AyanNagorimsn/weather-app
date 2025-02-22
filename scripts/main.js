"use strict";

// importing static constant objects
import { isoCountries, months, dayIds, days, aestheticImages } from "./data.js";

// Selecting elements
const formEl = document.querySelector("form");
const inputEl = document.querySelector("#search");
const opacityBg = document.querySelector(".opacity-bg");
const cityRowEl = document.querySelector(".city-row");
const currentNameEl = document.querySelector(".city-name");
const currentRegionEl = document.querySelector(".city-region");
const currentTempEl = document.querySelector(".temprature");
const currentCityImageEl = document.querySelector(".city-image");
const weatherRowEl = document.querySelector(".weather-row");
const switchUnitEl = document.querySelector(".switch-unit");
const switchCelEl = document.querySelector(".cel");
const switchFarEl = document.querySelector(".faren");
const guideEl = document.querySelector(".guide");

const FromCurLocationBtn = document.querySelector(".location");
const popUpEl = document.querySelector(".pop-up");
const audioEl = document.querySelector("audio");
const loaderEl = document.querySelector(".loader-wrapper");
const d = new Date();

const today = document.querySelector(".today");
const week = document.querySelector(".week");
const footer = document.querySelector("footer");

const api_key = "8602251c799c32118d3f358aed2c231c";

// Get current date and show in navbar
const getUserDate = () => {
  document.querySelector(".currentDate").textContent = `${days[d.getDay()]} ${d.getDate()}, ${
    months[d.getMonth()]
  } ${d.getFullYear()}`;
};
getUserDate();

// Convert ISO country to full country name eg: IN = INDIA
const ConvertIsoCountry = (countryCode) => {
  if (isoCountries.hasOwnProperty(countryCode)) {
    return isoCountries[countryCode];
  } else {
    return countryCode;
  }
};

// Convert TimeStamp to actual data eg: 1703659740 = 27/12/2023
const convertTimestamp = (milli) => {
  let convertedDate = new Date(milli * 5000).toLocaleDateString("en-us", {
    weekday: "long",
  });
  return convertedDate;
};

// Convert Celsius to Farenhiet and vice verca
const convertToFaren = (celsi) => `${Math.round(celsi * 1.8 + 32)}<sup>°</sup>`;
const convertToCelsi = (faren) => `${Math.round((faren - 32) / 1.8)}<sup>°</sup>`;

// Show pop up on error with audio
const showPopUp = function (title, msg, isError = false) {
  popUpEl.innerHTML = `
  <h1 class='pop-up-title'><i class="fa-solid fa-circle-exclamation"></i> ${title}</h1>
  <p>${msg}</p>
  `;
  if (isError) {
    popUpEl.classList.add("red");
  }

  popUpEl.classList.add("active");
  audioEl.play();
  setTimeout(() => {
    popUpEl.classList.remove("active");
    setTimeout(() => {
      popUpEl.innerHTML = "";
    }, 400);
  }, 5000);
};

// Show weather row using the weekly data
const populateWeatherRow = function (weeklyData) {
  const activeDay = weeklyData[0]; // Assuming the first entry is today's weather

  // Populate daily weather
  const dailyHtml = `
    <div class="weather-col activated">
      <div class="flex">
        <h1>${convertTimestamp(activeDay.dt)}<small>${activeDay.weather[0].description}</small></h1>
        <div class='icon'>
          <img src="https://openweathermap.org/img/wn/${activeDay.weather[0].icon}@2x.png">
        </div>
      </div>
      <div class="flex">
        <div class="l">
          <h2><i class="fa fa-wind"></i>${activeDay.wind_speed}km/h</h2>
          <h2><i class="fa fa-spa"></i>${activeDay.humidity}%</h2>
        </div>
        <h3 class='temp'>${Math.round(activeDay.temp.day)}<sup>°</sup></h3>
      </div>
    </div>
  `;
  document.querySelector(".daily-weather").innerHTML = dailyHtml;

  // Populate weekly weather
  weeklyData.pop();

  weeklyData.forEach((current) => {
    current.dt = convertTimestamp(current.dt);
  });

  weeklyData.sort((a, b) => {
    return dayIds[a.dt] - dayIds[b.dt];
  });

  weeklyData.forEach(({ dt, weather, wind_speed, humidity, temp }) => {
    let html = `
    <div class="weather-col ${dt === days[d.getDay()] ? "activated" : ""}">
      <div class="flex">
        <h1>${dt}<small>${weather[0].description}</small></h1>
        <div class='icon'>
          <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png">
        </div>
      </div>
      <div class="flex">
        <div class="l">
          <h2><i class="fa fa-wind"></i>${wind_speed}km/h</h2>
          <h2><i class="fa fa-spa"></i>${humidity}%</h2>
        </div>
        <h3 class='temp'>${Math.round(temp.day)}<sup>°</sup></h3>
      </div>
    </div>
    `;
    weatherRowEl.insertAdjacentHTML("beforeend", html);
  });
};

// Get and show Data on search
const getData = function (lat, lon, name, countryCode) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`
  )
    .then((r) => r.json())
    .then((data) => {
      // Show current data
      currentNameEl.textContent = name;
      currentRegionEl.textContent = ConvertIsoCountry(countryCode);
      currentTempEl.innerHTML = Math.round(data.main.temp) + "<sup>°</sup>";
      currentCityImageEl.src = `./Assets/countryImages/${ConvertIsoCountry(countryCode)
        .replaceAll(" ", "")
        .toLowerCase()}.min.png`;
      footer.classList.remove("hide");
    })
    .catch(() => {
      showPopUp(
        "Unable to find the data",
        `Cant search for countries check the spelling, Try searching for place or use current place feature, or report about this in report page`,
        true
      );
      toggleLoader(true);
    });
};

const searchPlace = function (place) {
  if (place) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${place}&limit=5&appid=${api_key}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        let { lat, lon, country, name } = data[0];
        getData(lat, lon, name, country);
        weatherRowEl.innerHTML = " ";
        inputEl.value = "";
      })
      .catch(() => {
        showPopUp(
          "Unable to find the data",
          `Cant search for countries check the spelling, Try searching for place or use current place feature, or report about this in report page`,
          true
        );
        toggleLoader(true);
      });
  }
};

const ToggleLoaderWeatherRow = (opposite) => {
  // Hide Loader show weather row
  if (opposite) {
    loaderEl.classList.remove("hide");
    opacityBg.classList.remove("hide");
    weatherRowEl.classList.add("hide");
    cityRowEl.classList.add("hide");
    return;
  }

  // Show loader Loader Hide weather row

  loaderEl.classList.add("hide");
  opacityBg.classList.add("hide");
  weatherRowEl.classList.remove("hide");
  cityRowEl.classList.remove("hide");
};

const toggleLoader = function (status = false) {
  if (status) {
    // If status is false then stop/hide the loader
    ToggleLoaderWeatherRow(true);

    cityRowEl.classList.remove("hide");
    weatherRowEl.innerHTML = " ";
    inputEl.value = " ";
    currentNameEl.textContent = " ";
    currentTempEl.textContent = " ";
    currentRegionEl.textContent = " ";
    currentCityImageEl.src = "./Assets/placeholder.png";
  } else {
    // If status is true then start/show the loader
    loaderEl.classList.remove("hide");
    opacityBg.classList.remove("hide");
    cityRowEl.classList.add("hide");
    weatherRowEl.classList.add("hide");
  }
};

currentCityImageEl.addEventListener("onMouseDown", (e) => {
  e.preventDefault();
  return false;
});

//
// _________ EventListeners _________
//

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  toggleLoader(false);
  guideEl.classList.add("hide");
  searchPlace(inputEl.value);
});

// Turn on loader if the image has an error and show audio popUp
currentCityImageEl.addEventListener("error", function () {
  ToggleLoaderWeatherRow();
  showPopUp(
    "Image not found",
    "Kindly go on report page and report about the place you searched",
    true
  );
  this.src = "./Assets/placeholder.png";
});

// Turn on loader while the image is loading
currentCityImageEl.addEventListener("load", () => {
  ToggleLoaderWeatherRow();
});

FromCurLocationBtn.addEventListener("click", (e) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  }

  //show the weather daily or weekly on click

  footer.style.display = "none";
  today.addEventListener("click", function () {
    today.classList.add("activated");
    week.classList.remove("activated");

    document.querySelector(".daily-weather").classList.remove("hide");
    document.querySelector(".weather-row").classList.add("hide");
    footer.style.display = "block";
  });

  week.addEventListener("click", function () {
    today.classList.remove("activated");
    week.classList.add("activated");

    document.querySelector(".daily-weather").classList.add("hide");
    document.querySelector(".weather-row").classList.remove("hide");
    footer.style.display = "none";
  });

  function showPosition(position) {
    fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=5&appid=${api_key}`
    )
      .then((r) => r.json())
      .then((data) => {
        console.log(data);
        toggleLoader(false);
        guideEl.classList.add("hide");
        let { lat, lon, country, name } = data[0];
        getData(lat, lon, name, country);
      });
  }
  function showError(err) {
    showPopUp("ERROR", `${err.message} or Geolocation is not supported by the browser`, true);
  }
});

/**const showPosition = async function(position){
  try{
  const r = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=5&appid=${api_key}`
    )
   const data = await r.json()

   data.toggleLoader()
   guideEl.classList.add("hide");
   let { lat, lon, country, name } = data[0];
   getData(lat, lon, name, country);
  }catch(error){
    showPopUp(
      "ERROR",
      `${error.message} or Geolocation is not supported by the browser`,
      true
    );
  }
} */

switchUnitEl.addEventListener("click", function (e) {
  if (currentTempEl.textContent) {
    if (e.target === switchFarEl && e.target.classList.contains("activated") === false) {
      e.target.classList.add("activated");
      switchCelEl.classList.remove("activated");
      currentTempEl.innerHTML = convertToFaren(currentTempEl.textContent.replace("°", " "));
      document.querySelectorAll(".temp").forEach((el) => {
        el.innerHTML = convertToFaren(el.textContent.replace("°", " "));
      });
    }
    if (e.target === switchCelEl && e.target.classList.contains("activated") === false) {
      e.target.classList.add("activated");
      switchFarEl.classList.remove("activated");
      currentTempEl.innerHTML = convertToCelsi(currentTempEl.textContent.replace("°", " "));
      document.querySelectorAll(".temp").forEach((el) => {
        el.innerHTML = convertToCelsi(el.textContent.replace("°", " "));
      });
    }
  }
});

// Add and remove border on if focused | add enter text beside the input
inputEl.addEventListener("focusin", () => {
  formEl.style.border = "2px solid var(--primary)";
  if (inputEl.value) document.querySelector("form .enter").classList.add("change");
});
inputEl.addEventListener("focusout", () => {
  formEl.style.border = "2px solid transparent";
  document.querySelector("form .enter").classList.remove("change");
});

// Focus Input when we click on `SEARCH FOR THE PLACE` btn
const btnFocusInputEl = document.querySelector(".focus-input");
btnFocusInputEl.addEventListener("click", () => inputEl.focus());

inputEl.addEventListener("keyup", () => {
  if (inputEl.value) {
    document.querySelector("form .enter").classList.add("change");
  } else {
    document.querySelector("form .enter").classList.remove("change");
  }
});

const div = document.querySelector(".add_city");
const container = document.querySelector(".image-container");
const img = document.querySelector(".aestheticImage");

const delay = 5000; //

function changeImage() {
  const randomIndex = Math.floor(Math.random() * aestheticImages.length);
  const newImg = document.createElement("img");

  newImg.src = aestheticImages[randomIndex];
  newImg.classList.add("new-image");

  container.appendChild(newImg);

  setTimeout(() => {
    newImg.classList.add("show");
  }, 10);

  setTimeout(() => {
    img.src = newImg.src;
    container.removeChild(newImg);
  }, 800);
}

setInterval(changeImage, delay);

div.addEventListener("click", changeImage);
