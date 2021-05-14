import React, { useState, useContext, useReducer, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';

import Colors from '../../constants/Colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00000088',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ActivityIndicatorWithModal = props => {

  return (
    <Modal
      animationType="fade"
      transparent
      visible={true}
    >
      <TouchableOpacity style={styles.container} onPress={() => { }}>
        <View style={styles.indicatorContainer}>
          <ActivityIndicator size="large" color={Colors.focus} />

        </View>
      </TouchableOpacity>
    </Modal>
  );

}

export default ActivityIndicatorWithModal;