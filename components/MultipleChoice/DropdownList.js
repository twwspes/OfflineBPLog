import React, { useReducer, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

import DropdownListRow from './DropdownListRow';
import MainButtonClear from '../UI/MainButtonClear';

const screenHeight = Math.round(Dimensions.get('window').height);

const SingleChoice = ({ onItemSelected, id, items, initialValue, buttonTextStyle, buttonStyle, isModalActive }) => {
    console.log("render DropdownList");

    // const { onItemSelected, id, items, initialValue } = props;

    const [selected, setSelected] = useState(initialValue);
    const [activeModal, setActiveModal] = useState(false);
    const [initialPosition, setInitialPosition] = useState(0);

    // let listOfItemsToBeSelected = [];
    // let jsonOfItemsToBeSelected = {};
    const [listOfItemsToBeSelected, setlistOfItemsToBeSelected] = useState([]);
    const [jsonOfItemsToBeSelected, setjsonOfItemsToBeSelected] = useState({});

    // console.log('props');
    // console.log(props);

    useEffect(()=>{
        setSelected(initialValue)
    }, [initialValue]);

    useEffect(() => {
        console.log("SingleChoice setlistOfItemsToBeSelected");
        var listOfItemsToBeSelectedTemp = [];
        var jsonOfItemsToBeSelectedTemp = {};
        for (var i of items) {
            listOfItemsToBeSelectedTemp.push({ title: i.label, value: i.value, selected: parseInt(i.value) === parseInt(selected) ? true : false });
            jsonOfItemsToBeSelectedTemp[i.value] = i.label;
            // console.log('jsonOfItemsToBeSelected');
            // console.log(jsonOfItemsToBeSelected);
        };
        setlistOfItemsToBeSelected(listOfItemsToBeSelectedTemp);
        setjsonOfItemsToBeSelected(jsonOfItemsToBeSelectedTemp);
        setInitialPosition(() => {
            return (Math.max(items.findIndex((item) => {
                return parseInt(item.value) === parseInt(selected)
            })-3, 0));
        });
        console.log("selected");
        console.log(selected);
        console.log("initialPosition");
        console.log(initialPosition);
    }, [items, selected]);

    useEffect(() => {
        console.log("SingleChoice onItemSelected");
        console.log(jsonOfItemsToBeSelected[selected]);
        onItemSelected(id, selected, true);
    }, [selected, jsonOfItemsToBeSelected]);

    const selectToggleHandler = (value, selected) => {
        setSelected(value);
        setActiveModal(false);
    };

    useEffect(()=>{
        if (!!isModalActive){
            if (activeModal){
                isModalActive(true);
            } else {
                isModalActive(false);
            }
        }
        
    }, [activeModal]);

    return (
        <View>
            {/* <Text>Hello</Text> */}
            <MainButtonClear
                buttonStyle={{ ...styles.buttonStyle, ...buttonStyle }}
                buttonText={{ ...styles.buttonText, ...buttonTextStyle }}
                onPress={() => { setActiveModal((previousValue) => !previousValue) }}
            >
                {jsonOfItemsToBeSelected[selected]}
            </MainButtonClear>
            {activeModal && <Modal
                animationType="fade"
                transparent
                visible={true}
            >
                <TouchableOpacity style={styles.container} onPress={() => {
                    setActiveModal(false);
                }}>

                    {/* <ScrollView style={{ backgroundColor: 'white', maxHeight: screenHeight * 0.8 }}>
                        <ListOfItem
                            list={listOfItemsToBeSelected}
                            onItemClicked={selectToggleHandler}
                        />
                    </ScrollView> */}
                    <ListOfItem
                        list={listOfItemsToBeSelected}
                        onItemClicked={selectToggleHandler}
                        initialPosition={initialPosition}
                    />
                </TouchableOpacity>
            </Modal>}
        </View>
    );
};

const ListOfItem = ({ list, onItemClicked, initialPosition }) => {
    console.log('render list');
    // console.log(list);
    return (<View style={{ maxHeight: screenHeight * 0.8 }}>
        {/* {list.map((item, index) => {
            // console.log(disease.title);
            return (
                <DropdownListRow
                    // id={index}
                    key={index}
                    title={item.title}
                    selected={item.selected}
                    onPress={() => {
                        onItemClicked(item.value, item.selected);
                    }
                    }
                />
            );
        })} */}
        <FlatList
            data={list}
            keyExtractor={item => item.value.toString()}
            initialScrollIndex={initialPosition}
            getItemLayout={(data, index) => (
                { length: 80, offset: 80 * index, index }
            )}
            renderItem={itemData => <DropdownListRow
                // id={index}
                title={itemData.item.title}
                selected={itemData.item.selected}
                onPress={() => {
                    onItemClicked(itemData.item.value, itemData.item.selected);
                }
                }
            />
            }
        />
    </View>);

};

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
        fontSize: 12
    }
});

export default SingleChoice;