/**
 * @fileoverview Interactive Map Screen for Location-Based Clipper Discovery
 *
 * Provides an interactive Google Map where users can:
 * - View clippers positioned at their business locations
 * - Search for locations by address
 * - Adjust search radius (1-100 miles)
 * - See distance from search center to each clipper
 * - Tap on clipper markers to see details or navigate to profile
 *
 * Features:
 * - Real-time distance calculations using Haversine formula
 * - Auto-zoom to fit selected radius
 * - Current location detection via GPS
 * - Google Places autocomplete for address search
 * - Filtered clipper display based on search radius
 * - Smooth map animations on zoom and pan
 *
 * @component
 * @returns {React.ReactElement} Full-screen interactive map with controls
 *
 * @example
 * // Used in tab navigation
 * // Users can search addresses and see nearby clippers on map
 */

import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Callout, Circle, Marker } from "react-native-maps";
import { useRouter } from "expo-router";

import { useClippd } from "@/contexts/ClippdContext";
import { ClipperProfile } from "@/type/clippdTypes";
import {
  ClipperWithCoords,
  mockClippersWithLocation,
} from "../../data/mockClippersWithLocation";

const { width } = Dimensions.get("window");
const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type NearbyClipper = ClipperWithCoords & { distance: number };

const hasCoordinates = (
  clipper: ClipperProfile
): clipper is ClipperWithCoords =>
  typeof clipper.latitude === "number" &&
  typeof clipper.longitude === "number" &&
  clipper.latitude !== null &&
  clipper.longitude !== null;

/**
 * MapScreen Component
 *
 * Interactive map-based discovery interface. Displays clippers at their
 * business locations and allows users to search by address and adjust
 * search radius. Includes distance calculations and profile navigation.
 *
 * @returns {React.ReactElement} Map screen with search bar, radius slider, and markers
 */
export default function MapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(10);
  const mapRef = useRef<MapView | null>(null);
  const searchRef = useRef(null);
  const { clippers, isClippersLoading, fetchClippers } = useClippd();
  const router = useRouter();

  const apiKey = Constants.expoConfig!.extra!.googleMapsApiKey;

  /**
   * Converts miles to meters for map distance calculations
   * @param {number} miles - Distance in miles
   * @returns {number} Equivalent in meters
   * @private
   */
  const milesToMeters = (miles: number) => miles * 1609.34;

  /**
   * Computes latitude/longitude delta to show entire search radius on map
   * @param {number} miles - Search radius in miles
   * @returns {number} Delta for both lat and lon (assumes square region)
   * @private
   */
  const computeZoomDelta = (miles: number) => {
    const km = miles * 1.609344;
    const deg = km / 111;
    return deg * 3;
  };

  /**
   * Calculates distance between two geographic coordinates using Haversine formula
   * @param {number} lat1 - First location latitude
   * @param {number} lon1 - First location longitude
   * @param {number} lat2 - Second location latitude
   * @param {number} lon2 - Second location longitude
   * @returns {number} Distance in miles
   * @private
   */
  const calculateDistanceMiles = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusMiles = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusMiles * c;
  };

  const clippersWithCoords = useMemo<ClipperWithCoords[]>(() => {
    const hydrated = (clippers || []).filter(hasCoordinates);
    return [...hydrated, ...mockClippersWithLocation];
  }, [clippers]);

  const nearbyClippers = useMemo<NearbyClipper[]>(() => {
    if (!region) return [];
    return clippersWithCoords
      .map((clipper) => {
        const distance = calculateDistanceMiles(
          region.latitude,
          region.longitude,
          clipper.latitude,
          clipper.longitude
        );
        return { ...clipper, distance };
      })
      .filter((clipper) => clipper.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  }, [clippersWithCoords, radiusMiles, region]);

  const centerMapOn = (latitude: number, longitude: number) => {
    const delta = computeZoomDelta(radiusMiles);
    const nextRegion = {
      latitude,
      longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 450);
  };

  useEffect(() => {
    if (clippers.length === 0) {
      fetchClippers();
    }
  }, [clippers.length, fetchClippers]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          centerMapOn(
            mockClippersWithLocation[0].latitude,
            mockClippersWithLocation[0].longitude
          );
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        centerMapOn(current.coords.latitude, current.coords.longitude);
      } catch (error) {
        centerMapOn(
          mockClippersWithLocation[0].latitude,
          mockClippersWithLocation[0].longitude
        );
      }
    })();
  }, []);

  useEffect(() => {
    setRegion((prev) => {
      if (!prev) return prev;
      const delta = computeZoomDelta(radiusMiles);
      const next = {
        ...prev,
        latitudeDelta: delta,
        longitudeDelta: delta,
      };
      mapRef.current?.animateToRegion(next, 450);
      return next;
    });
  }, [radiusMiles]);

  const openClipperProfile = (clipperId: string) => {
    router.push(`/details/${clipperId}`);
  };

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
            fields: "geometry",
          }}
          onFail={() => {}}
          onNotFound={() => {}}
          onPress={(data, details) => {
            if (!details?.geometry?.location) return;
            const { lat, lng } = details.geometry.location;
            centerMapOn(lat, lng);
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
      {region ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onRegionChangeComplete={(reg) =>
              setRegion((prev) => ({
                ...(prev || reg),
                latitude: reg.latitude,
                longitude: reg.longitude,
              }))
            }
          >
            <Circle
              center={region}
              radius={milesToMeters(radiusMiles)}
              fillColor="rgba(255, 169, 0, 0.2)"
              strokeColor="#ffae00"
              strokeWidth={2}
            />

            {nearbyClippers.map((clipper) => (
              <Marker
                key={clipper.id}
                coordinate={{
                  latitude: clipper.latitude,
                  longitude: clipper.longitude,
                }}
                onPress={() => centerMapOn(clipper.latitude, clipper.longitude)}
              >
                <View style={styles.pin}>
                  <View style={styles.pinInner}>
                    <Image
                      source={{ uri: clipper.profilePic || FALLBACK_AVATAR }}
                      style={styles.pinAvatar}
                    />
                  </View>
                  <View style={styles.pinTip} />
                </View>
                <Callout tooltip onPress={() => openClipperProfile(clipper.id)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>{clipper.name}</Text>
                    <Text style={styles.calloutMeta}>
                      {clipper.location} · {clipper.distance.toFixed(1)} mi
                    </Text>
                    <View style={styles.calloutRatingRow}>
                      <Ionicons name="star" size={14} color="#ffae00" />
                      <Text style={styles.calloutRating}>{clipper.rating}</Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <View pointerEvents="none" style={styles.centerPinContainer}>
            <Ionicons name="location-sharp" size={32} color="#00c2ff" />
          </View>

          <View style={styles.counterChip}>
            <Text style={styles.counterText}>
              {isClippersLoading
                ? "Loading nearby clippers..."
                : `${nearbyClippers.length} clippers within ${radiusMiles} mi`}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffae00" />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
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
          minimumTrackTintColor="#ffae00"
          maximumTrackTintColor="#d7d7d7"
          thumbTintColor="#ffae00"
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
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    height: 52,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  input: {
    height: 52,
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

  pin: {
    alignItems: "center",
  },
  pinInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#ffae00",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  pinAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ffae00",
    marginTop: -2,
  },
  callout: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    minWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  calloutName: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  calloutMeta: {
    color: "#555",
    marginBottom: 6,
  },
  calloutRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  calloutRating: {
    fontWeight: "600",
    color: "#1c1c1c",
    marginLeft: 6,
  },
  counterChip: {
    position: "absolute",
    bottom: 160,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
});
