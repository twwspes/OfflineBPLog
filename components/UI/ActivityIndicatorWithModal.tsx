import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { Colors } from '../../constants/Colors';

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

// // If you want to add props later, define them here:
// interface Props {
//   // visible?: boolean; // you could add this if needed
// }

export const ActivityIndicatorWithModal: React.FC = () => {
  return (
    <Modal animationType="fade" transparent visible>
      <TouchableOpacity style={styles.container} onPress={() => {}}>
        <View style={styles.indicatorContainer}>
          <ActivityIndicator size="large" color={Colors.focus} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
