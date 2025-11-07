import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function FilterButton() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)} // Open the modal
      >
        <Text style={styles.buttonText}>Filter</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Close the modal when back button is pressed
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Display "Hello" when the modal is opened */}
            <Text style={styles.modalText}>Hello</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)} // Close the modal
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});