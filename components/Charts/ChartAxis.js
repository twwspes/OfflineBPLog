import React, { useContext } from 'react';
import moment from 'moment/min/moment-with-locales';
import { VictoryAxis } from 'victory-native';
import { LocalizationContext } from '../../constants/Localisation';
import { min } from 'moment';
import { useLocalisation } from '../../hooks/useLocalisation';

const ChartAxis = (props) => {
  const { locale2 } = useLocalisation();
  moment.locale(locale2);

  function periodValueMapping(period) {
    switch (period) {
      case 'one_day':
        return 1000 * 60 * 60 * 24;
      case 'one_week':
        return 1000 * 60 * 60 * 24 * 7;
      case 'one_month':
        return 1000 * 60 * 60 * 24 * 31;
      case 'three_months':
        return 1000 * 60 * 60 * 24 * 31 * 3;
      case 'six_months':
        return 1000 * 60 * 60 * 24 * 31 * 6;
      case 'one_year':
        return 1000 * 60 * 60 * 24 * 366;
      case 'all':
        return 1593633109356;
      default:
        return 1000 * 60 * 60 * 24;
    }
  }

  let { maxValue, minValue, ...otherProps } = props;

  return (
    <VictoryAxis
      {...otherProps}
      // tickCount={3}
      tickValues={[
        minValue,
        ((maxValue - minValue) * 1) / 6 + minValue,
        ((maxValue - minValue) * 2) / 6 + minValue,
        ((maxValue - minValue) * 3) / 6 + minValue,
        ((maxValue - minValue) * 4) / 6 + minValue,
        ((maxValue - minValue) * 5) / 6 + minValue,
        maxValue,
      ]}
      tickFormat={(t) => {
        // console.log("maxValue - minValue");
        // console.log(new Date(maxValue));
        // console.log(new Date(minValue));
        // console.log(maxValue-minValue)
        return (
          moment(t).format('MMM D') +
          '\n' +
          (Math.abs(maxValue - minValue) > periodValueMapping('one_week')
            ? moment(t).format('YYYY')
            : locale2 === 'zh-cn'
            ? moment(t).format('ah点')
            : locale2 === 'zh-hk'
            ? moment(t).format('ah點')
            : locale2 === 'fr'
            ? moment(t).format('kk[h]')
            : locale2 === 'es'
            ? moment(t).format('kk[h]')
            : moment(t).format('ha'))
        );
      }}
      style={{
        tickLabels: { fontSize: 10, padding: 5 },
      }}
      // angle={-45}
    />
  );
};

export default ChartAxis;
