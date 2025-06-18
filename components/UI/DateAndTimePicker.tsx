import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import { Text } from '@/components/UI/Text';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Platform.OS === 'ios' ? '#00000000' : 'transparent',
    position: 'absolute',
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
  },
  header: {
    width: '100%',
    padding: 16,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
});

interface DateAndTimePickerProps {
  date: Date;
  mode?: 'date' | 'time' | 'datetime';
  onClose: (date: Date) => void;
  onChange: (date: Date) => void;
}

export const DateAndTimePicker: React.FC<DateAndTimePickerProps> = ({
  date: initialDate,
  mode = 'datetime',
  onClose,
  onChange,
}) => {
  const [date, setDate] = useState<Date>(initialDate);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) return;

    if (Platform.OS === 'ios') {
      setDate(selectedDate);
      onChange(selectedDate);
    } else {
      onClose(selectedDate);
    }
  };

  const handleClose = () => {
    onClose(date);
  };

  const dateTimePicker = (
    <DateTimePicker
      value={date}
      mode={mode}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handleChange}
      style={{ backgroundColor: 'white' }}
      themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
    />
  );

  if (Platform.OS === 'ios') {
    return (
      <Modal animationType="slide" transparent visible>
        <TouchableOpacity style={styles.container} onPress={handleClose}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: 'white' }}>{dateTimePicker}</View>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleClose}>
      {dateTimePicker}
    </TouchableOpacity>
  );
};
