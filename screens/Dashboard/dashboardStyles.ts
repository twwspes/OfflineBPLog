import { Dimensions, Platform, StyleSheet } from 'react-native';

import { FontSize } from '../../constants/FontSize';

const screenWidth = Math.round(Dimensions.get('window').width);

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 0 : 30,
  },
  categoryContainer: {
    width: '100%',
  },
  titleContainer: {
    height: 40,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  title: {
    fontSize: FontSize.subsubsubtitle,
    textAlign: 'center',
  },
  otherProfileBtnContainer: {
    width: '100%',
    height: 120,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    height: 40,
  },
  flatListContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 180,
  },
  flatListItem: {
    margin: '1%',
    minHeight: 50,
    width: screenWidth * 0.2,
  },
  flatListItemClear: {
    margin: '1%',
    minHeight: 50,
    width: screenWidth * 0.2,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 0,
  },
  tableText: {
    fontSize: FontSize.title,
  },
  tableTitleText: {
    fontSize: FontSize.smallButton,
  },
  bloodPressureRangeTable: {
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },
  bloodPressureRangeTableTitleContainer: {
    alignItems: 'center',
    height: 100,
    width: '100%',
    flexDirection: 'row',
  },
  bloodPressureRangeTableTitleTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: '50%',
  },
  bloodPressureRangeTableTitleText: {
    fontSize: FontSize.smallContent,
  },
  bloodPressureRangeTableRowContainer: {
    alignItems: 'center',
    height: 120,
    width: '100%',
  },
  bloodPressureRangeTableRowDescContainer: {
    alignItems: 'center',
    height: 30,
    width: '100%',
    flexDirection: 'row',
  },
  bloodPressureRangeTableRowDescTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: '40%',
  },
  bloodPressureRangeTableRowDescText: {
    fontSize: FontSize.smallContent,
  },
  bloodPressureRangeTableRowContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: '100%',
    flexDirection: 'row',
  },
  bloodPressureRangeTableRowContentTextContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 60,
    width: '50%',
  },
  bloodPressureRangeTableRowContentText: {
    fontSize: FontSize.varySmallContent,
    textAlign: 'right',
  },
  bloodPressureRangeTableRowContentDigitContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: '50%',
  },
  bloodPressureRangeTableRowContentDigit: {
    fontSize: FontSize.title,
  },
  indicatorContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordText: {
    // backgroundColor: 'yellow',
    textAlign: 'center',
    fontSize: FontSize.content,
  },
});
