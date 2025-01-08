import React, { useState, useEffect } from "react";
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
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location"; // Import expo-location for geolocation

const flashcards = [
  { id: "1", image: require("../assets/gmet p.jpg") },
  { id: "2", image: require("../assets/event.jpg") },
  { id: "3", image: require("../assets/gmet in.png") },
];

const Content = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const fetchWeatherData = async (url) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  };

  const getCurrentLocationWeather = async () => {
    const apiKey = "c96328ab68a28b3c39087a9b874dcb0e";

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

      const currentData = await fetchWeatherData(currentWeatherUrl);
      const forecastData = await fetchWeatherData(forecastUrl);

      if (currentData && forecastData) {
        setCurrentWeather({
          city: currentData.name,
          temperature: currentData.main.temp,
          description: currentData.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png`,
        });

        setHourlyForecast(forecastData.list.slice(0, 4)); // Next 4 hours
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching current location weather:", error);
    }
  };

  const fetchCityWeather = async () => {
    if (!searchCity.trim()) {
      console.error("City name is empty.");
      return;
    }

    setIsLoading(true);
    const apiKey = "c96328ab68a28b3c39087a9b874dcb0e";
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${encodeURIComponent(
      searchCity
    )}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${encodeURIComponent(
      searchCity
    )}&appid=${apiKey}`;

    try {
      const currentData = await fetchWeatherData(currentWeatherUrl);
      const forecastData = await fetchWeatherData(forecastUrl);

      if (currentData && forecastData) {
        setCurrentWeather({
          city: currentData.name,
          temperature: currentData.main.temp,
          description: currentData.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png`,
        });

        setHourlyForecast(forecastData.list.slice(0, 4));
      } else {
        console.error("Failed to fetch city weather data.");
      }
    } catch (error) {
      console.error("Error in fetchCityWeather:", error);
    } finally {
      setIsLoading(false);
    }

    setSearchCity("");
  };

  const renderForecast = ({ item }) => {
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();

    return (
      <View style={styles.forecastCard}>
        <Text style={styles.forecastTime}>{`${hours}:00`}</Text>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png` }}
          style={styles.forecastIcon}
        />
        <Text style={styles.forecastTemp}>{item.main.temp}°C</Text>
      </View>
    );
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL("https://www.meteo.gov.gh/news/")}
    >
      <Image source={item.image} style={styles.cardImage} />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <>
            {/* Search Section */}
            <View style={styles.section}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search city..."
                  value={searchCity}
                  onChangeText={setSearchCity}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={fetchCityWeather}
                >
                  <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Location Weather */}
            <View style={styles.weatherInfoSpace}>
              {currentWeather ? (
                <>
                  <Text style={styles.weatherCity}>{currentWeather.city}</Text>
                  <Text style={styles.weatherTemperature}>{currentWeather.temperature}°C</Text>
                  <Text style={styles.weatherDescription}>{currentWeather.description}</Text>
                  <Image source={{ uri: currentWeather.icon }} style={styles.weatherIcon} />
                </>
              ) : (
                <Text style={styles.loadingText}>Fetching location weather...</Text>
              )}
            </View>

            {/* Hourly Forecast Section */}
            <View style={styles.forecastContainer}>
              <Text style={styles.sectionTitle}>Next 4 Hours</Text>
              <FlatList
                data={hourlyForecast}
                renderItem={renderForecast}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.forecastList}
              />
            </View>

            {/* Flashcards Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>News</Text>
              <FlatList
                data={flashcards}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsListContainer}
              />
            </View>

            {/* Footer with Social Media Links */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => Linking.openURL("https://www.facebook.com/GMetForecastOffice")}
              >
                <Icon name="facebook" size={30} color="#3b5998" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => Linking.openURL("https://x.com/GhanaMet")}
              >
                <Icon name="twitter" size={30} color="#00acee" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() =>
                  Linking.openURL("https://www.instagram.com/ghana_meteorological_agency/")
                }
              >
                <Icon name="instagram" size={30} color="#C13584" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() =>
                  Linking.openURL("https://www.linkedin.com/company/ghana-meteo-agency/")
                }
              >
                <Icon name="linkedin" size={30} color="#0e76a8" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};



              
const styles = StyleSheet.create({
                container: {
                  flex: 1,
                  paddingVertical: 20,
                },
                scrollContainer: {
                  flexGrow: 1,
                },
                loadingText: {
                  textAlign: "center",
                  marginTop: 20,
                  fontSize: 18,
                  color: "#fff",
                },
                searchContainer: {
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  marginHorizontal: 20,
                  top:30,
                },
                searchInput: {
                  flex: 1,
                  height: 40,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  backgroundColor: "#fff",
                },
                searchButton: {
                  marginLeft: 10,
                  backgroundColor: "#007bff",
                  borderRadius: 5,
                  paddingHorizontal: 15,
                  justifyContent: "center",
                  height: 40,
                },
                searchButtonText: {
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                },
                currentWeatherContainer: {
                  alignItems: "center",
                  marginVertical: 20,
                },
                weatherCity: {
                  fontSize: 30,
                  fontWeight: "bold",
                  color: "black",
                },
                weatherTemperature: {
                  fontSize: 30,
                  color: "black",
                },
                weatherDescription: {
                  fontSize: 35,
                  color: "black",
                },
                weatherIcon: {
                  width: 100,
                  height: 100,
                },
                weatherInfoSpace: {
                  height: 300,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  marginVertical: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  top:30,
                },
                weatherCard: {
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.6)",
                  marginRight: 15,
                  padding: 10,
                  borderRadius: 10,
                },
                forecastContainer: {
                  marginVertical: 20,
                },
                sectionTitle: {
                  fontSize: 25,
                  fontWeight: "bold",
                  color: "black",
                  marginHorizontal: 20,
                  marginBottom: 10,
                },
                forecastList: {
                  paddingHorizontal: 20,
                },
                forecastCard: {
                  alignItems: "center",
                  marginRight: 15,
                  backgroundColor: "rgba(255,255,255,0.6)",
                  padding: 10,
                  borderRadius: 10,
                },
                forecastTime: {
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#333",
                },
                forecastIcon: {
                  width: 80,
                  height: 100,
                },
                forecastTemp: {
                  fontSize: 16,
                  color: "#666",
                },
                cardsListContainer: {
                  paddingHorizontal: 10,
                },
                card: {
                  width: Dimensions.get("window").width * 0.6,
                  height: 150,
                  marginRight: 10,
                  borderRadius: 15,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: 5,
                  justifyContent: "center",
                  alignItems: "center",
                },
                cardImage: {
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                },
                footer: {
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 5,
                  width: "100%",
                 // borderTopColor: "#ddd",
                 // borderTopWidth: 1,
                 top:10,
                },
                iconContainer: {
                  marginHorizontal: 20,
                },
              });
              
              export default Content;
              