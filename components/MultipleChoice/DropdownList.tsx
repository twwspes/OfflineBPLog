import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { MemoizedMultipleChoiceRow } from './DropdownListRow';
import { MainButtonClear } from '../UI/MainButtonClear';

const screenHeight = Math.round(Dimensions.get('window').height);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00000088',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  buttonStyle: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    // backgroundColor: 'red',
  },
  buttonText: {
    fontSize: 12,
  },
});

interface ListOfItemProps {
  list: {
    title: string;
    value: string | number;
    selected: boolean;
  }[];
  onItemClicked: (value: string | number, selected: boolean) => void;
  initialPosition: number;
}

const ListOfItem: React.FC<ListOfItemProps> = ({
  list,
  onItemClicked,
  initialPosition,
}) => {
  return (
    <View style={{ maxHeight: screenHeight * 0.8 }}>
      <FlatList
        data={list}
        keyExtractor={(item) => item.value.toString()}
        initialScrollIndex={initialPosition}
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        renderItem={(itemData) => (
          <MemoizedMultipleChoiceRow
            title={itemData.item.title}
            selected={itemData.item.selected}
            onPress={() => {
              onItemClicked(itemData.item.value, itemData.item.selected);
            }}
          />
        )}
      />
    </View>
  );
};

interface Item {
  label: string;
  value: string | number;
}

interface Props {
  onItemSelected: (
    id: string,
    value: string | number,
    triggered: boolean,
  ) => void;
  id: string;
  items: Item[];
  initialValue: string | number;
  buttonTextStyle?: object;
  buttonStyle?: object;
  isModalActive?: (active: boolean) => void;
}

export const SingleChoice: React.FC<Props> = ({
  onItemSelected,
  id,
  items,
  initialValue,
  buttonTextStyle,
  buttonStyle,
  isModalActive,
}) => {
  const [selected, setSelected] = useState(initialValue);
  const [activeModal, setActiveModal] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);

  const [listOfItemsToBeSelected, setlistOfItemsToBeSelected] = useState<
    { title: string; value: string | number; selected: boolean }[]
  >([]);
  const [jsonOfItemsToBeSelected, setjsonOfItemsToBeSelected] = useState<
    Record<string | number, string>
  >({});

  useEffect(() => {
    setSelected(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const listOfItemsToBeSelectedTemp: typeof listOfItemsToBeSelected = [];
    const jsonOfItemsToBeSelectedTemp: typeof jsonOfItemsToBeSelected = {};
    for (const i of items) {
      listOfItemsToBeSelectedTemp.push({
        title: i.label,
        value: i.value,
        selected: Number(i.value) === Number(selected) ? true : false,
      });
      jsonOfItemsToBeSelectedTemp[i.value] = i.label;
    }
    setlistOfItemsToBeSelected(listOfItemsToBeSelectedTemp);
    setjsonOfItemsToBeSelected(jsonOfItemsToBeSelectedTemp);
    setInitialPosition(() => {
      return Math.max(
        items.findIndex((item) => {
          return Number(item.value) === Number(selected);
        }) - 3,
        0,
      );
    });
  }, [items, selected]);

  useEffect(() => {
    onItemSelected(id, selected, true);
  }, [selected, jsonOfItemsToBeSelected, onItemSelected, id]);

  const selectToggleHandler = (value: string | number) => {
    setSelected(value);
    setActiveModal(false);
  };

  useEffect(() => {
    if (isModalActive) {
      if (activeModal) {
        isModalActive(true);
      } else {
        isModalActive(false);
      }
    }
  }, [activeModal, isModalActive]);

  return (
    <View>
      <MainButtonClear
        buttonStyle={{ ...styles.buttonStyle, ...buttonStyle }}
        buttonText={{ ...styles.buttonText, ...buttonTextStyle }}
        onPress={() => {
          setActiveModal((previousValue) => !previousValue);
        }}
      >
        {jsonOfItemsToBeSelected[selected]}
      </MainButtonClear>
      {activeModal && (
        <Modal animationType="fade" transparent visible={true}>
          <TouchableOpacity
            style={styles.container}
            onPress={() => {
              setActiveModal(false);
            }}
          >
            <ListOfItem
              list={listOfItemsToBeSelected}
              onItemClicked={selectToggleHandler}
              initialPosition={initialPosition}
            />
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};
