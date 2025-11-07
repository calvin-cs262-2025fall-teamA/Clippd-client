import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';

export default function MapScreen() {
  const [miles, setMiles] = useState(0);
  const [address, setAddress] = useState('');
  const [sliderWidth, setSliderWidth] = useState(0);

  const sliderThumbPosition = (miles / 100) * sliderWidth; // Calculate the thumb position dynamically

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🗺️ This is where the Google map will be displayed</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your address, neighborhood, or ZIP code"
        value={address}
        onChangeText={(text) => setAddress(text)}
      />
      <View
        style={styles.sliderContainer}
        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)} // Get slider width dynamically
      >
        {/* Display the miles text above the slider thumb */}
        <Text
          style={[
            styles.milesText,
            { left: sliderThumbPosition - 15 }, // Adjust position dynamically
          ]}
        >
          {miles} miles
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={miles}
          onValueChange={(value) => setMiles(value)} // Updates the miles state in real-time
          minimumTrackTintColor="#1E90FF"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#FF4500"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomColor: '#d3d3d3',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  sliderContainer: {
    width: '80%',
    position: 'relative',
    height: 60, // Increased height to accommodate the text above the slider
  },
  milesText: {
    position: 'absolute',
    top: -20, // Position the text above the slider thumb
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
