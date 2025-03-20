import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
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





const getTemperatureColor = (temp) => {
  // Adjust these thresholds based on Ghana's climate
  // Blue for cool, red for hot
  if (temp <= 20) return 'rgb(0, 0, 255)'; // Cool - Blue
  if (temp <= 24) return 'rgb(0, 100, 255)';
  if (temp <= 27) return 'rgb(0, 200, 255)';
  if (temp <= 30) return 'rgb(255, 255, 0)'; // Yellow for moderate
  if (temp <= 33) return 'rgb(255, 100, 0)';
  return 'rgb(255, 0, 0)'; // Hot - Red
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
  const [heatMapMode, setHeatMapMode] = useState(false);

  const toggleHeatMap = () => {
    setHeatMapMode(prev => !prev);
  };
  
  


  const [region, setRegion] = useState({
    //// the  map funtion to zoom in and zoom out
    latitude: 7.9465,
    longitude: -1.0232, /////this is whwere you zoom in and out
    latitudeDelta: 6.6,
    longitudeDelta: 6,
  });


  const zoomIn = () => {
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 0.8,
      longitudeDelta: prev.longitudeDelta * 0.8,
    }));
  };

  const zoomOut = () => {
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 1.2,
      longitudeDelta: prev.longitudeDelta * 1.2,
    }));
  };

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



    }
  };

  const fetchWeatherData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
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
        //source={require("../assets/background/Background Image.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.childcontainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            
            <View style={styles.arrow}>
            <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
              <Ionicons name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>
            </View>


            {/* ************Map View Below********************* */}
            
            <MapView

              style={StyleSheet.absoluteFillObject} // Makes map cover the full screen
              region={region}
              onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Track zoom changes

              onPress={handleMapClick}


              
        
            >

              
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
      {heatMapMode ? (
        <View style={[
          styles.heatMapMarker, 
          {backgroundColor: getTemperatureColor(region.temperature)}
        ]}>
          <Text style={[styles.markerText, {color: region.temperature > 27 ? 'white' : 'black'}]}>
            {region.temperature}°C
          </Text>
        </View>
      ) : (
        <>
          <Image
            source={getLocalWeatherImage(region.description)}
            style={styles.weatherIcon}
          />
          <Text style={styles.markerText}>
            {region.temperature}°C
          </Text>
        </>
      )}
    </View>
  </Marker>
))}
            </MapView>
    
<View style={styles.zoomContainer}>
  <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
    <Text style={styles.zoomText}>+</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
    <Text style={styles.zoomText}>-</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={toggleHeatMap} style={[styles.zoomButton, heatMapMode ? styles.activeButton : {}]}>
    <Text style={styles.zoomText}>🔥</Text>
  </TouchableOpacity>
</View>

      <View style={styles.legendContainer}>
  <View style={styles.legendItem}>
    <View style={[styles.colorBox, { backgroundColor: 'blue' }]} />
    <Text style={styles.legendText}>Water</Text>
  </View>
  <View style={styles.legendItem}>
    <View style={[styles.colorBox, { backgroundColor: 'green' }]} />
    <Text style={styles.legendText}>Plantation</Text>
  </View>
  <View style={styles.legendItem}>
    <View style={[styles.colorBox, { backgroundColor: 'brown' }]} />
    <Text style={styles.legendText}>Mountains</Text>
  </View>
  <View style={styles.legendItem}>
    <View style={[styles.colorBox, { backgroundColor: 'yellow' }]} />
    <Text style={styles.legendText}>Desert</Text>
  </View>
</View>



{heatMapMode && (
            <View style={styles.heatLegendContainer}>
              <Text style={styles.legendTitle}>Temperature</Text>
              <View style={styles.legendGradient}>
                <View style={[styles.legendColorBox, {backgroundColor: 'rgb(0, 0, 255)'}]} />
                <View style={[styles.legendColorBox, {backgroundColor: 'rgb(0, 100, 255)'}]} />
                <View style={[styles.legendColorBox, {backgroundColor: 'rgb(0, 200, 255)'}]} />
                <View style={[styles.legendColorBox, {backgroundColor: 'rgb(255, 255, 0)'}]} />
                <View style={[styles.legendColorBox, {backgroundColor: 'rgb(255, 100, 0)'}]} />
                <View style={[styles.legendColorBox, {backgroundColor: 'rgb(255, 0, 0)'}]} />
              </View>
              <View style={styles.legendLabels}>
                <Text style={styles.legendText}>Cold</Text>
                <Text style={styles.legendText}>Hot</Text>
              </View>
            </View>
          )}











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

                 
                </View>
              </Animated.View>
            ) : (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Fetching weather...</Text>
              </View>
            )}
          </ScrollView>

      
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  arrow:{
    position: "absolute",
    justifyContent: "center",
    marginBottom: 70,
    marginLeft: 20,
    marginTop:50,
    borderRadius: 40,
    paddingLeft: 14,
    zIndex:2,
  },
  activityTitleText: {
    color: "white",
    fontSize: 20,
    paddingLeft: 20,
  },
  parentcontainer: {
    flex: 1,
    width: "100%",
  },
  childcontainer: {
    flex: 1,
    marginTop:40,
  },
  scrollContainer: {
    flexGrow: 1,
    zIndex: 1,
    paddingBottom: 100,
    //position:"absolute"
  },

  background: {
    flex: 1,
    backgroundColor:"rgba(14, 253, 142, 0.29)"
  },

  zoomContainer:{
    position:"absolute",
    top:50,
    right:20

  },
  zoomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db', // Blue color
    borderRadius: 5,
    borderWidth:2,
    borderColor:"#fff",
    margin: 5,
    width: 40,
    height: 40,
  },
  zoomText: {
    color: '#fff', // White text color
    fontSize: 20,
    fontWeight: 'bold',
  },

  


  legendContainer: {
    position: 'absolute',
    top: 90,
    left: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.56)', // Semi-transparent white background
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: 120, // Adjust as needed
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },


  heatMapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  activeButton: {
    backgroundColor: '#e74c3c', // A reddish color to indicate active
  },

  heatMapLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  heatMapLoadingText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#e74c3c',
  },
  heatLegendContainer: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  legendGradient: {
    flexDirection: 'row',
    height: 20,
    width: 150,
  },
  legendColorBox: {
    flex: 1,
    height: 20,
  },
  legendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  legendText: {
    fontSize: 12,
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
    flex: 1, // Makes the map take up full space
  },
  weatherInfo: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 10,
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
