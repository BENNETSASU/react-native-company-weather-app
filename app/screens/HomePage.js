import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Linking,
} from "react-native";
////////////////////////////////// THIS IS WHERE THE IMPORT STATMENT ENDS /////////////////////////////////////////////////

////////////////////////////////// THIS IS  THE CONSTANT FOR THE WIND DIRECTIONS FOR THE WEATHER FORECAST  /////////////////////////////////////////////////

const getWindDirectionArrow = (deg) => {
  if ((deg >= 0 && deg <= 22) || (deg >= 338 && deg <= 360)) return "↑ North";
  if (deg >= 23 && deg <= 67) return "↗";
  if (deg >= 68 && deg <= 112) return "→";
  if (deg >= 113 && deg <= 157) return "↘";
  if (deg >= 158 && deg <= 202) return "↓";
  if (deg >= 203 && deg <= 247) return "↙";
  if (deg >= 248 && deg <= 292) return "←";
  if (deg >= 293 && deg <= 337) return "↖";
  return "❓ Unknown";
};
////////////////////////////////// THIS IS WHERE THE CONSTANTS  FOR THE WIND DIRECTION ENDS/////////////////////////////////////////////////

////////////////////////////////// THIS IS  THE CONSTANT FOR THE WEATHER ICON IMAGES/////////////////////////////////////////////////

const getLocalWeatherImage = (condition) => {
  switch (condition.toLowerCase()) {
    case "scattered clouds":
      return require("../assets/clearsky_day.png"); // Replace with your local image path
    case "broken clouds":
      return require("../assets/fair_day.png"); // Replace with your local image path
    case "overcast clouds":
      return require("../assets/cloudy.png"); // Replace with your local image path
    case "light rain":
      return require("../assets/lightrains.png"); // Replace with your local image path
    case "few clouds":
      return require("../assets/fair_day.png"); // Replace with your local image path
    case "haze":
      return require("../assets/fog.png"); // Replace with your local image path
    case "clear sky":
      return require("../assets/clearsky_day.png"); // Replace with your local image path
    default:
      return null;
  }
};
////////////////////////////////// THIS IS WHERE THE CONSTANT FOR THE WEATHER ICON IMAGES ENDS /////////////////////////////////////////////////

////////////////////////////////// THIS IS THE CONSTANT FOR THE DAILY FORECAST STARTS /////////////////////////////////////////////////

const processDailyForecast = (forecastData) => {
  const dailyData = {};

  forecastData.list.forEach((entry) => {
    const date = new Date(entry.dt * 1000).toDateString();
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date: date,
        minTemp: entry.main.temp_min,
        maxTemp: entry.main.temp_max,
        description: entry.weather[0]?.description || "Unknown",
        condition: entry.weather[0]?.description,
        localImage: getLocalWeatherImage(entry.weather[0]?.description), // Use local image
      };
    } else {
      dailyData[date].minTemp = Math.min(dailyData[date].minTemp, entry.main.temp_min);
      dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, entry.main.temp_max);
    }
  });

  return Object.values(dailyData).slice(0, 5);
};


////////////////////////////////// THIS IS THE CONSTANT FOR THE DAILY FORECAST ENDS /////////////////////////////////////////////////

{
  /*THIS PLACE IS OUT OF COMMMITION FOR NOW */
}
const ghanaCities = [
  { name: "Accra", region: "Greater Accra", lat: 5.6037, lon: -0.187 },
  { name: "Kumasi", region: "Ashanti", lat: 6.6666, lon: -1.6163 },
  { name: "Tamale", region: "Northern", lat: 9.4075, lon: -0.853 },
  { name: "Takoradi", region: "Western", lat: 4.8926, lon: -1.7519 },
  { name: "Cape Coast", region: "Central", lat: 5.1054, lon: -1.2466 },
  { name: "Sunyani", region: "Bono", lat: 7.333, lon: -2.333 },
  { name: "Ho", region: "Volta", lat: 6.6008, lon: 0.4713 },
  { name: "Bolgatanga", region: "Upper East", lat: 10.7856, lon: -0.8514 },
  { name: "Wa", region: "Upper West", lat: 10.06, lon: -2.5 },
  { name: "Koforidua", region: "Eastern", lat: 6.0904, lon: -0.2608 },
  { name: "Techiman", region: "Bono East", lat: 7.5833, lon: -1.9333 },
];
{
  /*THIS PLACE IS OUT OF COMMMITION FOR NOW */
}

////////////////////////////////// THIS IS THE CONSTANT FOR THE CORRECT CITY NAMES FOR THE SEARCH AND DISPLAY /////////////////////////////////////////////////
const correctCityName = (city) => {
  const corrections = {
    "Medina Estates": "Madina Estates",
    Acccra: "Accra",
    Kumazi: "Kumasi",
    Tamalle: "Tamale",
    // Add more corrections if needed
  };

  return corrections[city] || city;
};
////////////////////////////////// THIS IS THE CONSTANT FOR THE CORRECT CITY NAMES FOR THE SEARCH AND DISPLAY ENDS /////////////////////////////////////////////////

////////////////////////////////// THIS IS THE CONSTANT FOR THE SERCH FUNCTIONALITIES  /////////////////////////////////////////////////
const HomePage = ({ setSearchCity, searchCity, handleSearch }) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        value={searchCity}
        onChangeText={setSearchCity}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Icon name="search" size={25} color="black" />
      </TouchableOpacity>
    </View>
  );
};
////////////////////////////////// THIS IS THE CONSTANT FOR THE SERCH FUNCTIONALITIES ENDS /////////////////////////////////////////////////

////////////////////////////////// THIS IS THE CONSTANT FOR ADDING NEW FUNCTIONALITIES OR DISPLAYS TO THE APP LIKE STARTS  /////////////////////////////////////////////////
const Content = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]); // ✅ NEW: Daily Forecast State
  const [searchCity, setSearchCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const navigation = useNavigation();
  const apiKey = "aa39f484a324f3970d43e82d0856b259";
  ////////////////////////////////// THIS IS THE CONSTANT FOR ADDING NEW FUNCTIONALITIES OR DISPLAYS TO THE APP ENDS /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING THE WEATHER LOCATION STARTS /////////////////////////////////////////////////
  useEffect(() => {
    setTimeout(() => {
      setShowPreloader(false);
    }, 3000);
    getCurrentLocationWeather();
  }, []);
  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING THE WEATHER LOCATION ENDS  /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING THE WEATHER DATA FROM THE LOCATION STARTS /////////////////////////////////////////////////
  const fetchWeatherData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP Error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null; // Prevents app from crashing
    }
  };

  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING THE WEATHER DATA FROM THE LOCATION STARTS ENDS /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING NEAREST LOCATION FOR THE GOELOACTION STARTS  /////////////////////////////////////////////////

  const findNearestCity = (lat, lon, cities) => {
    let nearestCity = null;
    let minDistance = Infinity;

    cities.forEach((city) => {
      const distance = getDistance(lat, lon, city.lat, city.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });

    return nearestCity;
  };

  // Function to calculate distance between two coordinates
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  };
  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING NEAREST LOCATION FOR THE GOELOACTION  ENDS /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING THE GOELOCATIONS AND GETTING THE WEATHER DATA TO DIOSPLAY THEM  /////////////////////////////////////////////////
  const getCurrentLocationWeather = async () => {
    const apiKey = "aa39f484a324f3970d43e82d0856b259";
    const defaultCity = { name: "Accra", lat: 5.6037, lon: -0.187 };

    // List of major cities in Ghana with their coordinates
    const majorCities = [
      { name: "Accra", lat: 5.6037, lon: -0.187 },
      { name: "Kumasi", lat: 6.692, lon: -1.615 },
      { name: "Tamale", lat: 9.4008, lon: -0.8393 },
      { name: "Takoradi", lat: 4.8932, lon: -1.7554 },
      { name: "Cape Coast", lat: 5.1054, lon: -1.2466 },
      { name: "Sunyani", lat: 7.3399, lon: -2.3268 },
      { name: "Ho", lat: 6.6, lon: 0.47 },
      { name: "Bolgatanga", lat: 10.7856, lon: -0.8514 },
      { name: "Wa", lat: 10.06, lon: -2.5 },
      { name: "Koforidua", lat: 6.091, lon: -0.2591 },
    ];

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let latitude, longitude;

      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      } else {
        console.warn("Location permission denied. Using default city: Accra.");
        latitude = defaultCity.lat;
        longitude = defaultCity.lon;
      }

      // Find the nearest major city
      const nearestCity =
        findNearestCity(latitude, longitude, majorCities) || defaultCity;
      console.log(`Displaying weather for: ${nearestCity.name}`);

      // Fetch weather data for the nearest major city
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${nearestCity.lat}&lon=${nearestCity.lon}&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${nearestCity.lat}&lon=${nearestCity.lon}&appid=${apiKey}`;

      const currentData = await fetchWeatherData(weatherUrl);
      const forecastData = await fetchWeatherData(forecastUrl);

      if (currentData && forecastData) {
        setCurrentWeather({
          city: nearestCity.name,
          temperature: currentData.main.temp,
          description: currentData.weather[0]?.description || "Unknown",
          icon: `https://openweathermap.org/img/wn/${currentData.weather[0]?.icon}.png`,
          localImage: getLocalWeatherImage(currentData.weather[0]?.description),
        });

        setHourlyForecast(forecastData.list.slice(0, 4));
        setDailyForecast(processDailyForecast(forecastData));
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching current location weather:", error);
    }
  };

  ////////////////////////////////// THIS IS THE FUNCTION FOR GETTING THE GOELOCATIONS AND GETTING THE WEATHER DATA TO DIOSPLAY THEM ENDS /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE CONSTANT FOR THE VIEW OF THE DAILY FORECAST STARTS /////////////////////////////////////////////////

  const renderDailyForecast = ({ item }) => (
    <View style={styles.dailyForecastCard}>
      <Text style={styles.day}>{item.date.split(" ")[0]}</Text>
      <Image source={item.localImage} style={styles.dailyforecastIcon} /> 
      <Text style={styles.temp}>
        {Math.floor(item.minTemp)}° / {Math.floor(item.maxTemp)}°
      </Text>
    </View>
  );
  

  

  

  if (showPreloader) {
    return (
      <View style={styles.preloaderContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }
  ////////////////////////////////// THIS IS THE CONSTANT FOR THE VIEW OF THE DAILY FORECAST ENDS /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE FUNCTION IF SOMEONE CLICKS ON THE SEARCH ICON WITHOUT ENTERING THE CITY NAME STARTS /////////////////////////////////////////////////
  const fetchCityWeather = async () => {
    if (!searchCity.trim()) {
      console.error("No city selected.");
      return;
    }

    if (!searchCity.trim()) {
      console.error("No city entered.");
      return;
    }
    ////////////////////////////////// THIS IS THE FUNCTION IF SOMEONE CLICKSON THE SEARCH ICON WITHOUT ENTERING THE CITY NAME ENDS /////////////////////////////////////////////////

    ////////////////////////////////// THIS IS THE FUNCTION FOR IF SOMEONE ENTERS THE CITY NAME FOR THE API TO SEARCH FOR THE CURRENT WEATHER AND ITS CURRENT WEATHER FORCAST STARTS TO DISPLAY ITS  INFORMATION (EG.WEATHER ICON, WEATHER FORECAST DATA... ) /////////////////////////////////////////////////
    setIsLoading(true);
    const correctedCity = searchCity.trim(); // Just use what the user entered

    const apiKey = "aa39f484a324f3970d43e82d0856b259";
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${encodeURIComponent(
      correctedCity
    )}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${encodeURIComponent(
      correctedCity
    )}&appid=${apiKey}`;

    try {
      const currentData = await fetchWeatherData(currentWeatherUrl);
      const forecastData = await fetchWeatherData(forecastUrl);

      if (currentData && forecastData) {
        const weatherCondition =
          currentData?.weather?.[0]?.description || "Unknown";

        setCurrentWeather({
          city: currentData.name,
          temperature: currentData.main.temp,
          //description: currentData.weather[0].description,
          description: weatherCondition,
          icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png`,
          localImage: getLocalWeatherImage(weatherCondition),
          windSpeed: currentData.wind.speed,
          windDirection: currentData.wind.deg,
        });

        //setHourlyForecast(filterHourlyForecast(forecastData.list));
        setDailyForecast(processDailyForecast(forecastData)); // ✅ Now fetches daily forecast
      }

      if (currentData && currentData.weather) {
        const weatherCondition =
          currentData.weather[0]?.description || "default"; // Ensure it's always defined
        setCurrentWeather({
          city: currentData.name,
          temperature: currentData.main.temp,
          description: weatherCondition,
          //    icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png`,
          localImage: getLocalWeatherImage(weatherCondition), // Now this should work fine!
        });
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      Alert.alert("Error", "Could not fetch weather data. Please try again.");
    } finally {
      setIsLoading(false);
      setSearchCity(""); // Reset search input
    }
  };
  ////////////////////////////////// THIS IS THE FUNCTION FOR IF SOMEONE ENTERS THE CITY NAME FOR THE API TO SEARCH FOR THE CURRENT WEATHER AND ITS CURRENT WEATHER FORCAST STARTS TO DISPLAY ITS  INFORMATION (EG.WEATHER ICON, WEATHER FORECAST DATA... ENDS ) /////////////////////////////////////////////////

  /////////////////////////////////////////////// THIS IS THE FUNCTION FOR THE FORECAST TO GET THE CURRENT LOCATION DATE, HOUR, WEATHER CONDITIONS AND WEATHER ICONS WIND DIRECTION AND WIND ARROW STARTS AND DISPLAYS THEM STARTS ) /////////////////////////////////////////////////
  const renderForecast = ({ item }) => {
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();
    const weatherCondition = item.weather[0]?.description || "default";
    const localImage = getLocalWeatherImage(weatherCondition);

    ////////////////////////////////////////////////////////////////// Get wind direction in degrees
    const windDeg = item.wind.deg; // Make sure it's coming from the API

    ///////////////////////////////////////////////////////////Convert wind direction to arrow
    const windArrow = getWindDirectionArrow(windDeg);

    return (
      <View style={styles.forecastCard}>
        <Text style={styles.forecastTime}>{`${hours}:00`}</Text>
        {/* Show Local Image If Available */}
        {localImage ? (
          <Image source={localImage} style={styles.forecastIcon} />
        ) : (
          <Image
            source={{
              uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
            }}
            style={styles.forecastIcon}
          />
        )}
        <View style={styles.cardText}>
          <Text style={styles.forecastTemp}>{Math.floor(item.main.temp)}°</Text>
          <Text style={styles.forecastWind}>
            {Math.floor(item.wind.speed)} m/s
          </Text>
          <Text style={styles.forecastWind}>
            {/* {windArrow} ({windDeg}°) */}
            {windArrow}
          </Text>
        </View>

        {/* <Text style={styles.forecastTemp}>{weatherCondition}</Text> */}
      </View>
    );
  };
  ////////////////////////////////// THIS IS THE FUNCTION FOR THE FORECAST TO GET THE CURRENT LOCATION DATE, HOUR, WEATHER CONDITIONS AND WEATHER ICONS WIND DIRECTION AND WIND ARROW STARTS AND DISPLAYS THEM ENDS  ) /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE FUNCTION THAT HANDLES THE URLS FORM THE APP TO THE BROWER ) /////////////////////////////////////////////////
  const handlePress = (url) => {
    Alert.alert(
      "Redirecting",
      "You are about to be redirected to your browser. Do you want to continue?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => Linking.openURL(url) },
      ]
    );
  };
  ////////////////////////////////// THIS IS THE FUNCTION THAT HANDLES THE URLS FORM THE APP TO THE BROWER ENDS) /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS THE FUNCTION THE PRE LOADER STARTS) /////////////////////////////////////////////////
  if (showPreloader) {
    return (
      <View style={styles.preloaderContainer}>
        <ActivityIndicator
          size="large"
          color="black"
          style={styles.preloaderSpinner}
        />
      </View>
    );
  }
  ////////////////////////////////// THIS IS THE FUNCTION THE PRE LOADER ENDS) /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS CONSTANT FOR DISPLAYING THE PRODUCTS SECTION OF THE APP STARTS) /////////////////////////////////////////////////
  const products = [
    {
      id: "1",
      title: "Marine",
      image: require("../assets/marine-products.png"),
      url: "https://www.meteo.gov.gh/Services/marine/",
    },
    {
      id: "2",
      title: "Agrometeorology",
      image: require("../assets/agro-products.png"),
      url: "https://www.meteo.gov.gh/Services/agrometeorology/",
    },
    {
      id: "3",
      title: "Climate",
      image: require("../assets/climo-products.png"),
      url: "https://www.meteo.gov.gh/Services/climate/",
    },
  ];
  ////////////////////////////////// THIS IS CONSTANT FOR DISPLAYING THE PRODUCTS SECTION OF THE APP STARTS ENDS ) /////////////////////////////////////////////////

  ////////////////////////////////// THIS IS HANDLES EVERYTHING THAT DISPLAYS ON THE APP THAT FALLS WITHIN THE BACKGROUND PIC STARTS) /////////////////////////////////////////////////
  return (
    <ImageBackground
      source={require("../assets/background/background-hot.jpeg")}
      style={styles.parentContainer}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <HomePage
          setSearchCity={setSearchCity}
          searchCity={searchCity}
          handleSearch={fetchCityWeather}
        />

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="black"
            style={styles.preloaderSpinner}
          />
        ) : (
          <>
            {/*/////////////////////////////////////////////////////////////////////////////////////// Weather Info Section */}
            <View style={styles.weatherInfoSpace}>
              {currentWeather ? (
                <>
                  <Text style={styles.weatherCity}>{currentWeather.city}</Text>

                  {/*//////////////////////////////////////////////////////////////////////////// Aligning Icon & Temperature in a Row */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {currentWeather.localImage ? (
                      <Image
                        source={currentWeather.localImage}
                        style={styles.CurrentIcon}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `https://openweathermap.org/img/wn/${currentWeather.icon}.png`,
                        }}
                        style={styles.CurrentIcon}
                      />
                    )}
                    <Text style={styles.weatherTemperature}>
                      {Math.floor(currentWeather.temperature)}°
                    </Text>
                  </View>

                  <Text style={styles.weatherDescription}>
                    {currentWeather.description}
                  </Text>
                </>
              ) : (
                <Text style={styles.loadingText}>
                  Fetching location weather...
                </Text>
              )}
            </View>

            {/* /////////////////////////////////////////////////////////////////////////////////Hourly Forecast Section */}
            <View style={styles.forecastContainer}>
              <Text style={styles.sectionTitle}>Weather Forecast</Text>
              <View>
                <FlatList
                  data={hourlyForecast}
                  renderItem={renderForecast}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.forecastList}
                />
              </View>
            </View>

            <View style={styles.dailyForecastContainer}>
              <Text style={styles.dailyForecastTitle}>
                5-Day Weather Forecast
              </Text>
              <FlatList
                data={dailyForecast}
                renderItem={renderDailyForecast}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dailyForecastList}
              />
            </View>

            {/*/////////////////////////////////////////////////////////////////// Our Products Section */}
            <View style={styles.productsContainer}>
              <Text style={styles.sectionTitle}>Our Products</Text>
              <View style={styles.productsBackground}>
                <FlatList
                  data={products}
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.list}
                  renderItem={({ item }) => (
                    <View style={styles.item}>
                      <Image source={item.image} style={styles.productsImage} />
                      <TouchableOpacity onPress={() => handlePress(item.url)}>
                        <Text style={styles.text}>{item.title}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* //////////////////////////////////////////////////////////////////////////////////Footer with navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("IndexScreen")}
        >
          <Ionicons name="map" size={24} color="#fff" />
          <Text style={styles.footerText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Icon name="bars" size={24} color="#fff" />
          <Text style={styles.footerText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};
////////////////////////////////// THIS IS HANDLES EVERYTHING THAT DISPLAYS ON THE APP THAT FALLS WITHIN THE BACKGROUND PIC STARTS) /////////////////////////////////////////////////

////////////////////////////////// THIS IS HANDLES EVERYTHING THAT DISPLAYS ON THE APP THAT FALLS WITHIN THE BACKGROUND PIC ENDS ) /////////////////////////////////////////////////

const styles = StyleSheet.create({
  //The entire Screen Container
  parentContainer: {
    flex: 1,
    zIndex: 1,
    paddingBottom: 70,
    paddingTop: 40,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingText: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#fff",
  },
  preloaderContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  preloaderSpinner: {
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 20,
    top: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 18,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  searchButton: {
    marginStart: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 40,
    paddingLeft: 13,
    justifyContent: "center",
    height: 50,
    width: 50,
  },
  weatherCity: {
    fontSize: 30,
    fontWeight: "bold",
    color: "rgb(236, 215, 26)",
  },
  weatherTemperature: {
    fontSize: 70,
    marginLeft: 20,
    color: "#fff",
  },
  weatherDescription: {
    fontSize: 18,
    color: "rgb(255, 255, 255)",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  weatherInfoSpace: {
    marginTop: 60,
    marginBottom: 150,
    height: "auto",
    //backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 20,
    //justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    paddingHorizontal: 10,
    //top: -40,
  },
  forecastBackground: {
    borderRadius: 20,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    padding: 20,
    //paddingStart: 20,
    //paddingEnd: 20,
  },
  forecastContainer: {
    marginVertical: 20,
    top: -100,
    paddingStart: 20,
    paddingEnd: 20,
  },
  day:{
    color:"white",
    fontWeight:"bold",
    marginEnd:50,
    marginTop:10
  },
  dailyforecastIcon: {
    width: 40,
    height: 40,
    marginHorizontal:50,
  },
  temp:{
    color:"white",
    fontWeight:"bold",
    marginStart:50,
    marginTop:10
  },
  dailyForecastCard: {
    flex:1,
    flexDirection:"row",
    borderTopWidth:1,
    borderBottomWidth:1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding:10,
    marginHorizontal:20
  },
  productsContainer: {
    marginTop:40,
    marginHorizontal:20
  },
  productsBackground: {
    borderRadius: 20,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    padding: 20,
    height: 220,
    //paddingStart: 20,
    //paddingEnd: 20,
  },
  container: {
    paddingVertical: 10,
    backgroundColor: "#002B5B", // Background color
    borderRadius: 15,
    marginHorizontal: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    paddingLeft: 10,
  },
  list: {
    paddingHorizontal: 10,
  },
  item: {
    alignItems: "center",
    marginRight: 15,
  },
  productsImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Makes it circular
    borderWidth: 1,
    borderColor: "#fff",
  },
  text: {
    marginTop: 5,
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "rgb(255, 255, 255)",
    marginHorizontal: 20,
    marginBottom: 10,
    start: -15,
    // borderWidth:0.3,
    // borderColor:"white",
    // borderRadius:5,
    // maxWidth:"150",
  },
  cardheader: {
    // backgroundColor: "rgba(255, 255, 255, 0.27)",
    // padding: 20,
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
    // height: 10,
    // width: 140,
  },
  forecastCard: {
    alignItems: "center",
    marginRight: 15,
    //backgroundColor: "rgba(255, 255, 255, 0.26)",
    //padding: 15,
    //borderRadius: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.3)",
    height: "auto",
    width: 90,
  },
  cardText: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    left: -5,
  },
  forecastTime: {
    position: "absolute",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    top: 10,
    left: 15,
  },
  forecastTemp: {
    fontSize: 18,
    fontFamily: "Open Sans",
    color: "#fff",
    textTransform: "capitalize",
  },
  forecastWind: {
    fontSize: 18,
    fontFamily: "Open Sans",
    color: "#fff",
  },
  forecastIcon: {
    width: 60,
    height: 60,
    marginTop:60,
    marginStart:-10,
  },
  CurrentIcon: {
    width: 70,
    height: 70,
    //marginTop: 60,
    //marginStart: -10,
  },

  dailyForecastContainer: {
    marginHorizontal: 20,
    borderWidth:1,
    borderRadius:20,
    borderColor:"rgba(255, 255, 255, 0.2)",
    //marginBottom:20

  },
  dailyForecastTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F8FAFC", // Light text color
    margin:20
  },
  dailyForecastList: {
    flex:1,
    flexDirection:"column",
  },

  footer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0)",
    paddingHorizontal: 20,
    marginStart: 20,
    marginEnd: 20,
    bottom: 0,
    left: 0,
    right: 0,
    //zIndex: 10, // Ensure it stays on top of other elements
  },
  footerButton: {
    alignItems: "center",
    padding: 10,
    flexDirection: "column",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500", // Slightly lighter font weight for better balance
    color: "#fff",
    marginTop: 4, // Add space between the icon and text
  },
  footerIcon: {
    fontSize: 28, // Increase icon size for better visibility
    color: "#fff",
  },
});

export default Content;
