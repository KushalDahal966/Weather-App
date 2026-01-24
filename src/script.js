const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const searchBar = document.querySelector("#search-box");
const currentCity = document.querySelector(".current-city");
const currentDate = document.querySelector(".current-date");
const currentWeather = document.querySelector(".current-weather");
const weatherIcon = document.querySelector(".weather-icon");
const currentTempreture = document.querySelector(".current-tempreture");
const MinTemp = document.querySelector(".min-temp");
const MaxTemp = document.querySelector(".max-temp");
const realFealTemp = document.querySelector(".real-feal-temp");
const humidity = document.querySelector(".humidity-percentage");
const windSpeed = document.querySelector(".wind-speed");
const currentPressure = document.querySelector(".current-pressure");

// To get current date and time
const getCurrentDate = (dt) => {
    const currentDateTime = new Date(dt * 1000);
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    };
    return new Intl.DateTimeFormat("en-us", options).format(currentDateTime);
}

// To get country name from country code
const getCountryName = (countryCode) => {
    return new Intl.DisplayNames([countryCode], { type: "region" }).of(countryCode);
}

// to show loading state 
const showLoading = () => {
    currentCity.innerText = "Loading...";
    currentDate.innerText = "";
    currentWeather.innerText = "Fetching data";
    weatherIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    currentTempreture.innerHTML = `--&#176C`;
}

// to show error if failed to get data form api 
const showError = (message) => {
    currentCity.innerText = "Error!";
    currentDate.innerText = "";
    currentWeather.innerText = message || "Unable to fetch weather data";
    weatherIcon.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i>';
    currentTempreture.innerHTML = "--&#176C";
    MinTemp.innerHTML = `Min. --&#176C`;
    MaxTemp.innerHTML = `Max. --&#176C`;
    realFealTemp.innerHTML = `--&#176C`;
    humidity.innerText = "--%";
    windSpeed.innerText = "-- m/s";
    currentPressure.innerText = "-- hPa";
}

// Fetching data from the API
const getWeatherData = async (cityName) => {
    showLoading();

    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`);

        // to check if response is successful
        if (!response.ok) {
            if (response.status === 404) {
                showError("City not found. Please try again.");
                return;
            } else if (response.status === 401) {
                showError("API key invalid.");
                return;
            } else {
                showError("Failed to fetch weather data.");
                return;
            }
        }

        let data = await response.json();

        // to validate data
        if (!data.main || !data.weather || !data.weather[0]) {
            showError("Invalid data received.");
            return;
        }

        const { main, name, sys, weather, wind, dt } = data;

        currentCity.innerText = `${name}, ${getCountryName(sys.country)}`;
        currentDate.innerText = getCurrentDate(dt);
        currentWeather.innerText = weather[0].main;
        weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">`;
        currentTempreture.innerHTML = `${Math.round(main.temp - 273.15)}&#176C`;
        MinTemp.innerHTML = `Min. ${Math.round(main.temp_min - 273.15)}&#176C`;
        MaxTemp.innerHTML = `Max. ${Math.round(main.temp_max - 273.15)}&#176C`;
        realFealTemp.innerHTML = `${Math.round(main.feels_like - 273.15)}&#176C`;
        humidity.innerText = `${main.humidity}%`;
        windSpeed.innerText = `${wind.speed} m/s`;
        currentPressure.innerText = `${main.pressure} hPa`;

    } catch (error) {
        showError("Network error. Check your connection.");
    }
}

// Fetch weather by coordinates
const getWeatherDataByCoords = async (lat, lon) => {
    showLoading();

    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);

        if (!response.ok) {
            showError("Failed to fetch weather data.");
            return;
        }

        let data = await response.json();

        if (!data.main || !data.weather || !data.weather[0]) {
            showError("Invalid data received.");
            return;
        }

        const { main, name, sys, weather, wind, dt } = data;

        currentCity.innerText = `${name}, ${getCountryName(sys.country)}`;
        currentDate.innerText = getCurrentDate(dt);
        currentWeather.innerText = weather[0].main;
        weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">`;
        currentTempreture.innerHTML = `${Math.round(main.temp - 273.15)}&#176C`;
        MinTemp.innerHTML = `Min. ${Math.round(main.temp_min - 273.15)}&#176C`;
        MaxTemp.innerHTML = `Max. ${Math.round(main.temp_max - 273.15)}&#176C`;
        realFealTemp.innerHTML = `${Math.round(main.feels_like - 273.15)}&#176C`;
        humidity.innerText = `${main.humidity}%`;
        windSpeed.innerText = `${wind.speed} m/s`;
        currentPressure.innerText = `${main.pressure} hPa`;

    } catch (error) {
        showError("Network error. Check your connection.");
    }
}

// Get user's location and fetch weather
const getUserLocationWeather = () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                // Fallback to default city
                getWeatherData("Kathmandu");
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        getWeatherData("Kathmandu");
    }
}

// Adding Search Functionality
searchBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        let cityName = searchBar.value.trim();
        if (cityName !== "") {
            getWeatherData(cityName);
            searchBar.value = "";
        }
    }
});

// To show data after loading
document.addEventListener("DOMContentLoaded", () => {
    getUserLocationWeather();
});