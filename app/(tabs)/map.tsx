import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Circle } from "react-native-maps";

const { width } = Dimensions.get("window");

export default function MapScreen() {
  const [region, setRegion] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(10);
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const apiKey = Constants.expoConfig!.extra!.googleMapsApiKey;

  const milesToMeters = (miles: number) => miles * 1609.34;

  // 🔥 Convert radius → zoom level (bigger multiplier = more zoom-out)
  const computeZoomDelta = (miles: number) => {
    const km = miles * 1.609344;
    const deg = km / 111;
    return deg * 3; // zoom out enough to fit entire circle
  };

  // 🔥 Auto-zoom when radius changes
  useEffect(() => {
    if (!region) return;

    const delta = computeZoomDelta(radiusMiles);

    const updated = {
      ...region,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };

    setRegion(updated);
    mapRef.current?.animateToRegion(updated, 450);
  }, [radiusMiles, region]);

  // 🔥 Get user GPS location
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

      setRegion(userRegion);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔎 Search Bar */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={searchRef}
          placeholder="Search address"
          fetchDetails={true}
          listViewDisplayed={false}
          GooglePlacesDetailsQuery={{
            fields: "geometry", // 🔥 REQUIRED or details.geometry will be null
          }}
          onFail={() => {}}
          onNotFound={() => {}}
          onPress={(data, details) => {
            if (!details?.geometry?.location) return;

            const { lat, lng } = details.geometry.location;

            const newRegion = {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            };

            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);

            // 🔥 HIDE DROPDOWN COMPLETELY
            searchRef.current?.clear();
            searchRef.current?.setAddressText("");
            searchRef.current?.blur();
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

      {/* 🗺 Map + Circle + Center Pin */}
      {region && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onRegionChangeComplete={(reg) => setRegion(reg)}
          >
            <Circle
              center={region}
              radius={milesToMeters(radiusMiles)}
              fillColor="rgba(255, 50, 50, 0.15)"
              strokeColor="rgba(255, 50, 50, 0.8)"
            />
          </MapView>

          {/* 📍 Center Pin */}
          <View pointerEvents="none" style={styles.centerPinContainer}>
            <Ionicons name="location-sharp" size={32} color="#FF1744" />
          </View>
        </>
      )}

      {/* 🎚 Radius Slider */}
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

  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -16 }, { translateY: -32 }],
    zIndex: 20,
  },
});
