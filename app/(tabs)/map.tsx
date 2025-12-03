import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider"; // ✅ from your original
import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Circle } from "react-native-maps";

const { width } = Dimensions.get("window");

export default function MapScreen() {
  const [location, setLocation] = useState(null); // real GPS (kept from original, in case you need later)
  const [region, setRegion] = useState(null);     // current “you” location = map center
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
      {/* Search bar */}
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

      {/* Map + draggable “you” behavior */}
      {region && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onRegionChangeComplete={(reg) => {
              // 🔥 This is the key: when user drags the map,
              // update our “you” location to be the map center.
              setRegion(reg);
            }}
          >
            <Circle
              center={region}
              radius={milesToMeters(radiusMiles)}
              fillColor="rgba(255, 50, 50, 0.15)"
              strokeColor="rgba(255, 50, 50, 0.8)"
            />
          </MapView>

          {/* Hinge-style center pin (no fake assets, just Ionicon) */}
          <View pointerEvents="none" style={styles.centerPinContainer}>
            <Ionicons name="location-sharp" size={32} color="#FF1744" />
          </View>
        </>
      )}

      {/* Radius slider */}
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
    bottom: 75,
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

  // Center pin overlay (Hinge-style)
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -16 }, { translateY: -32 }],
    zIndex: 20,
  },
});
