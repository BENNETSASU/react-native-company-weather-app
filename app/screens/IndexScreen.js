import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";


const getLocalWeatherImage = (condition) => {
  switch (condition.toLowerCase()) {
    case "scattered clouds":
      return require("../assets/clearsky_day.png");
    case "broken clouds":
      return require("../assets/fair_day.png");
    case "overcast clouds":
      return require("../assets/cloudy.png");
    case "light rain":
      return require("../assets/lightrains.png");
    default:
      return null; // Provide a fallback image
  }
};






const temperatureData = {
  labels: ["0h", "1h", "2h", "3h", "4h", "5h"], // Time labels
  datasets: [
    {
      data: [22, 24, 25, 23, 26, 27], // Example temperature data
      strokeWidth: 2, // Thickness of the line
      color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Color of the line
    },
  ],
};

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

const { width, height } = Dimensions.get("window");
const apiKey = "aa39f484a324f3970d43e82d0856b259";

// Ghana regions for weather data
const ghanaRegions = [
  { name: "Greater Accra", latitude: 5.56, longitude: -0.205 },
  { name: "Ashanti", latitude: 6.6833, longitude: -1.6163 },
  { name: "Northern", latitude: 9.4008, longitude: -0.8393 },
  { name: "Western", latitude: 5.5, longitude: -2.5 },
  { name: "Volta", latitude: 6.6, longitude: 0.45 },
  { name: "Eastern", latitude: 6.0833, longitude: -0.25 },
  { name: "Central", latitude: 5.1, longitude: -1.2833 },
  { name: "Upper East", latitude: 10.95, longitude: -0.6333 },
  { name: "Upper West", latitude: 10.067, longitude: -2.5 },
  { name: "Bono", latitude: 7.5833, longitude: -2.3333 },
  { name: "Bono East", latitude: 7.6667, longitude: -1.75 },
  { name: "Ahafo", latitude: 6.9, longitude: -2.3667 },
  { name: "Oti", latitude: 8.3333, longitude: 0.2333 },
  { name: "North East", latitude: 10.5, longitude: -0.3333 },
  { name: "Savannah", latitude: 9.0833, longitude: -1.8167 },
  { name: "Western North", latitude: 6.0, longitude: -2.5 },
];

const Content = () => {
  const navigation = useNavigation();
  const [regionWeather, setRegionWeather] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState({
    //// the  map funtion to zoom in and zoom out
    latitude: 7.9465,
    longitude: -1.0232, /////this is whwere you zoom in and out
    latitudeDelta: 10.6,
    longitudeDelta: 10,
  });
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    getCurrentLocationWeather();
    fetchRegionWeather();
  }, []);

  const updateWeatherData = (weatherData) => {
    if (weatherData) {
      setCurrentWeather({
        city: correctCityName(weatherData.name),
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        humidity: weatherData.main.humidity,
      });

      // Update charts data
      setTemperatureData((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [...prev.datasets[0].data, weatherData.main.temp],
          },
        ],
      }));

      setWindSpeedData((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [...prev.datasets[0].data, weatherData.wind.speed],
          },
        ],
      }));

      setHumidityData((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [...prev.datasets[0].data, weatherData.main.humidity],
          },
        ],
      }));
    }
  };

  const fetchWeatherData = async (url) => {
    try {
      //console.log("Fetching weather data from:", url); // Log the URL to check if it's correct.
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      //console.log("Weather data fetched:", data); // Log the data to check the response.
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  };

  const fetchRegionWeather = async () => {
    try {
      const weatherPromises = ghanaRegions.map(async (region) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${region.latitude}&lon=${region.longitude}&units=metric&appid=${apiKey}`;
        const data = await fetchWeatherData(url);
        if (data) {
          return {
            ...region,
            temperature: Math.round(data.main.temp),
           
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
            description: data.weather[0]?.description || "unknown", // Ensure it's defined

          };
        }
        return null;
      });
      const results = await Promise.all(weatherPromises);
      setRegionWeather(results.filter((weather) => weather !== null));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching region weather:", error);
    }
  };

  const getCurrentLocationWeather = async () => {
    console.log("Requesting location permissions...");
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    //console.log("Current location fetched:", location.coords); // Log the location to verify.

    const { latitude, longitude } = location.coords;
    setUserLocation({ latitude, longitude });

    // Fetch weather data based on the current location.
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    const weatherData = await fetchWeatherData(weatherUrl);
    updateWeatherData(weatherData); // Update the state with weather data

    if (weatherData) {
      setCurrentWeather({
        city: correctCityName(weatherData.name), // Use correctCityName here
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        humidity: weatherData.main.humidity,
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    const searchUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&units=metric&appid=${apiKey}`;
    const searchData = await fetchWeatherData(searchUrl);

    if (searchData) {
      setRegion({
        latitude: searchData.coord.lat,
        longitude: searchData.coord.lon,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });

      setCurrentWeather({
        city: correctCityName(searchData.name), // Use correctCityName here
        temperature: Math.round(searchData.main.temp),
        description: searchData.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${searchData.weather[0].icon}.png`,
        windSpeed: searchData.wind.speed,
        windDirection: searchData.wind.deg,
        humidity: searchData.main.humidity,
        
      });
    }
  };

  const handleMapClick = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    const weatherData = await fetchWeatherData(weatherUrl);

    if (weatherData) {
      setCurrentWeather({
        city: weatherData.name,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        humidity: weatherData.main.humidity,
      });
      setMarkers([{ latitude, longitude, title: weatherData.name }]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.parentcontainer}>
      <ImageBackground
        source={require("../assets/background/Background Image.png")}
        style={styles.background}
        resizeMode="cover"
      >
  
        <View style={styles.activityTitle}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
          <Text style={styles.activityTitleText}>Map Viewer</Text>
        </View>

        <View style={styles.childcontainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* ************Map View Below********************* */}
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.locateButton}
            >
              <Icon name="map-marker" size={30} color="#fff" />
            </TouchableOpacity>

            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapClick}
            >
              {/* {userLocation && (
                <Marker coordinate={userLocation} title="You are here" />
              )} */}
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  }}
                  title={marker.title}
                >
                  <View style={styles.markerContainer}>
                    {/* <Image source={{ uri: marker.icon }} style={styles.weatherIcon} /> */}
                    {/* <Text style={styles.markerText}>{Math.round(marker.temperature)}°C</Text> */}
                  </View>
                </Marker>
              ))}
             {regionWeather.map((region, index) => (
  <Marker
    key={index}
    coordinate={{
      latitude: region.latitude,
      longitude: region.longitude,
    }}
    title={region.name}
  >
    <View style={styles.markerContainer}>
      <Image
        source={getLocalWeatherImage(region.description)} // Use local image
        style={styles.weatherIcon}
      />
      <Text style={styles.markerText}>{region.temperature}°C</Text>
    </View>
  </Marker>
))}

            </MapView>

            {currentWeather ? (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.weatherInfo}
              >
                <View style={styles.descriptionContainer}>
                  <Text style={styles.city}>
                    {currentWeather.city || "Fetching location..."}
                  </Text>

                {/* <Image
                  //  source={{ uri: currentWeather.icon }}
                    style={styles.Icon}
                  />
                  */} 
<Image
  source={getLocalWeatherImage(currentWeather.description)}
  style={styles.Icon}
/>
                  <Text style={styles.temperature}>
                    {currentWeather.temperature !== undefined
                      ? `${Math.round(currentWeather.temperature)}°C`
                      : "Loading..."}
                  </Text>

                  <Text style={styles.description}>
                    {currentWeather.description || "Getting weather..."}
                  </Text>

                  {/* Additional Weather Details */}
                  <View style={styles.weatherDetailsContainer}>
                    <View style={styles.weatherDetailsRow}>
                      <Text style={styles.detailsDescriptionName}>
                        Wind Speed:
                      </Text>
                      <Text style={styles.detailsDescriptionValue}>
                        {currentWeather.windSpeed !== undefined
                          ? `${currentWeather.windSpeed} m/s\n`
                          : "Loading..."}
                      </Text>
                    </View>
                    <View style={styles.weatherDetailsRow}>
                      <Text style={styles.detailsDescriptionName}>
                        Wind Direction:
                      </Text>
                      <Text style={styles.detailsDescriptionValue}>
                        {currentWeather.windDirection !== undefined
                          ? `${currentWeather.windDirection}°\n`
                          : "Loading..."}
                      </Text>
                    </View>
                    <View style={styles.weatherDetailsRow}>
                      <Text style={styles.detailsDescriptionName}>
                        Humidity:
                      </Text>
                      <Text style={styles.detailsDescriptionValue}>
                        {currentWeather.humidity !== undefined
                          ? `${currentWeather.humidity}%\n`
                          : "Loading..."}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Fetching weather...</Text>
              </View>
            )}

            {/* ***************Graph View below******************** */}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => navigation.navigate("HomeScreen")}
            >
              <Icon name="home" size={24} color="#fff" />
              <Text style={styles.footerText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerButton}>
              <Icon name="bars" size={24} color="#fff" />
              <Text style={styles.footerText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  activityTitle: {
    marginTop: 50,
    marginStart:20,
    paddingBottom: 20,
    flexDirection: "row",
  },
  activityTitleText: {
    color: "white",
    fontSize: 20,
    paddingLeft: 20,
  },
  parentcontainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingRight: 0,
    paddingLeft: 0,
  },
  childcontainer: {
    flex: 1,
    width: 420,
    marginStart:15,
    paddingBottom: 70,
    paddingRight: 0,
    paddingLeft: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    zIndex: 1,
    paddingBottom: 100,
    //position:"absolute"
  },

  background: {
    flex: 1,
  },

  //markerContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)", padding: 5, borderRadius: 5 }, //////////////////Duplicate
  //weatherIcon: { width: 30, height: 30 },                                                                                             /////////////////Duplicate
  //markerText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },                                                                   /////////////////Duplicate

  descriptionContainer: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 10,
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(255, 255, 255)",
    width: 350,
  },
  weatherDetailsContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "flex-start",
    borderTopWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
  },
  weatherDetailsRow: {
    flexDirection: "row",
  },
  detailsDescriptionName: {
    fontSize: 16,
    color: "rgba(1,1,1,1)",
    marginTop: 4,
    fontWeight: "bold",
  },
  detailsDescriptionValue: {
    flex: 1,
    fontSize: 16,
    color: "rgba(1,1,1,1)",
    marginTop: 4,
  },
  searchInput: {
    width: "60%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  locateButton: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgb(255, 255, 255)",
    marginLeft: 20,
    marginBottom: 70,
    borderRadius: 40,
    paddingLeft: 14,
    justifyContent: "center",
    height: 50,
    width: 50,
  },
  searchButton: {
    backgroundColor: "rgba(0, 123, 255, 1)",
    //backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  map: {
    marginStart: 20,
    width: width - 70,
    height: height / 2.3,
    borderRadius: 10,
    marginVertical: -5,
    top: -30,
  },
  weatherInfo: {
    alignItems: "flex-start",
    marginStart: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  city: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "rgb(0, 0, 0)",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  //Style for the map icon container
  markerContainer: {
    flexDirection: "row",
    alignItems: "center",
    /////////////////////////I made changes here
    backgroundColor: "rgba(255, 255, 255, 0)",
    //padding: 5,
    //borderRadius: 5,
    //marginRight:10
  },

  weatherIcon: {
    width: 40,
    height: 40,
    borderColor: "white",
    // borderWidth:1,
    //  backgroundColor: rgba(0, 0, 0, 0.11),
  },

  markerText: {
    color: "black",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 15,
  },
  temperature: {
    fontSize: 65,
    marginVertical: 5,
    color: "rgba(0, 0, 0,1)",
  },
  description: {
    fontSize: 30,
    color: "rgba(0, 0, 0,1)",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0)",
    paddingHorizontal: 20,
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerButton: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  footerText: {
    fontSize: 15,
    color: "#fff",
  },

  Icon: {
    width: 80,
    height: 60,
    borderColor: "white",
    // borderWidth:1,
    // backgroundColor:rgba(0, 0, 0, 0.11),
  },
});
//rgba(102,178,255, 100)

export default Content;
