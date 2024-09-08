// import React, { useState, useContext } from 'react';
// import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { Ionicons } from '@expo/vector-icons';

// import { LocalizationContext } from '../../constants/Localisation';

// import { Colors } from '../../constants/Colors';
// import { FontSize } from '../../constants/FontSize';
// import MainButtonClear from '../UI/MainButtonClearImage';
// import MainButtonOutlineImage from '../UI/MainButtonOutlineImage';

// const OCRPicker = props => {
//   const [pickedImage, setPickedImage] = useState();
//   const { t } = useContext(LocalizationContext);


//   const verifyPermissions = async () => {
//     const result = await ImagePicker.requestCameraPermissionsAsync();
//     if (result.status !== 'granted') {
//       Alert.alert(
//         t('insufficient_rights'),
//         t('you_need_to_grant_camera_permission_to_use_the_app'),
//         [{ text: t('okay') }]
//       );
//       return false;
//     }
//     return true;
//   };

//   const takeImageHandler = async () => {
//     const hasPermission = await verifyPermissions();
//     if (!hasPermission) {
//       return;
//     }
//     const image = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       aspect: [9, 16],
//       quality: 0.1,
//       base64: true,
//     });
//     if (!image.cancelled) {
//       if (image.type === "image") {
//         setPickedImage(image.uri);
//         !!props.onImageTaken && props.onImageTaken(image.uri);
//         !!props.onImageDataTaken && props.onImageDataTaken(image);
//       }
//     }
//   };

//   return (
//     <MainButtonOutlineImage style={{ ...styles.imagePicker, ...props.imagePickerStyles, }} onPress={takeImageHandler}>
//       <Text style={styles.switchText}>{t('scan_bpmonitor')}</Text>
//       <Ionicons
//         name={"camera-outline"}
//         size={72}
//         color={Colors.focus}
//       />
//     </MainButtonOutlineImage>
//   );
// };

// const styles = StyleSheet.create({
//   imagePicker: {
//     alignItems: 'center',
//     // marginBottom: 15,
//     // backgroundColor: 'yellow'
//   },
//   image: {
//     width: '100%',
//     height: '100%'
//   },
//   switchText: {
//     width: '90%',
//     fontSize: FontSize.content,
//     textAlign: 'center'
//   },
// });

// export default OCRPicker;
