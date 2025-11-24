import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Slider from "@react-native-community/slider"; // ✅ FIXED IMPORT

const { width } = Dimensions.get("window");

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(10);
  const mapRef = useRef(null);

  const apiKey = Constants.expoConfig.extra.googleMapsApiKey;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let current = await Location.getCurrentPositionAsync({});
      const userRegion = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };

      setLocation(current.coords);
      setRegion(userRegion);
    })();
  }, []);

  const milesToMeters = (miles) => miles * 1609.34;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search address"
          fetchDetails={true}
          onPress={(data, details) => {
            const { lat, lng } = details.geometry.location;

            const newRegion = {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            };

            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);
          }}
          query={{
            key: apiKey,
            language: "en",
          }}
          styles={{
            textInputContainer: styles.inputContainer,
            textInput: styles.input,
          }}
        />
      </View>

      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker coordinate={region} />
          <Circle
            center={region}
            radius={milesToMeters(radiusMiles)}
            fillColor="rgba(255, 50, 50, 0.15)"
            strokeColor="rgba(255, 50, 50, 0.8)"
          />
        </MapView>
      )}

      <View style={styles.sliderContainer}>
        <Text style={styles.radiusLabel}>{radiusMiles} miles</Text>

        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={radiusMiles}
          onValueChange={setRadiusMiles}
          minimumTrackTintColor="#FF1744"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#FF1744"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: "absolute",
    top: 50,
    width: width * 0.9,
    alignSelf: "center",
    zIndex: 10,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 50,
  },
  input: {
    height: 50,
    fontSize: 16,
  },
  sliderContainer: {
    position: "absolute",
    bottom: 40,
    width: width * 0.9,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
});
