import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [city, setCity] = useState<string>("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);

  const fetchData = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=f61f4fbd162bfdb8d11a253cab11d96d`
      );

      if (!response.ok) {
        throw new Error("Error fetching weather data");
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=f61f4fbd162bfdb8d11a253cab11d96d`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Error fetching weather data: ${response.status}`);
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather by coordinates:", error);
      alert("Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData.coords);
      fetchWeatherByCoords(locationData.coords.latitude, locationData.coords.longitude);
    } catch (error) {
      console.error("Error fetching location:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = () => {
    if (city.trim() !== "") {
      fetchData(city);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Detail Demo</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={city}
          onChangeText={setCity}
        />
        <Button title="Get Weather" onPress={handleSubmit} />
      </View>
      <Button title="Use GPS Location" onPress={getLocation} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      ) : weatherData ? (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>City: {weatherData.name}</Text>
          <Text style={styles.weatherText}>Temperature: {weatherData.main.temp}°C</Text>
          <Text style={styles.weatherText}>Description: {weatherData.weather[0].description}</Text>
          <Text style={styles.weatherText}>Feels Like: {weatherData.main.feels_like}°C</Text>
          <Text style={styles.weatherText}>Humidity: {weatherData.main.humidity}%</Text>
          <Text style={styles.weatherText}>Pressure: {weatherData.main.pressure} hPa</Text>
          <Text style={styles.weatherText}>Wind Speed: {weatherData.wind.speed} m/s</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>No weather data available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  loading: {
    marginTop: 20,
  },
  weatherContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#e0f7fa",
    borderRadius: 10,
  },
  weatherText: {
    fontSize: 18,
    marginBottom: 10,
  },
  placeholder: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});