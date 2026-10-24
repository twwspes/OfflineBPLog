import React from 'react';
import moment from 'moment/min/moment-with-locales';
import { VictoryAxis } from 'victory-native';
import { VictoryAxisProps } from 'victory-axis';
import { useLocalisation } from '../../hooks/useLocalisation';

type Period =
  | 'one_day'
  | 'one_week'
  | 'one_month'
  | 'three_months'
  | 'six_months'
  | 'one_year'
  | 'all';

interface ChartAxisProps extends VictoryAxisProps {
  minValue: number;
  maxValue: number;
  // Add any other props you intend to pass to VictoryAxis
  // [key: string]: any;
}

export const ChartAxis: React.FC<ChartAxisProps> = (props) => {
  const { locale2 } = useLocalisation();
  moment.locale(locale2);

  function periodValueMapping(period: Period): number {
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

  const { maxValue, minValue, ...otherProps } = props;

  const tickValues = Array.from({ length: 7 }, (_, i) =>
    i === 6 ? maxValue : ((maxValue - minValue) * i) / 6 + minValue,
  );

  return (
    <VictoryAxis
      {...otherProps}
      tickValues={tickValues}
      tickFormat={(t: number) => {
        const date = moment(t);
        const isLongRange =
          Math.abs(maxValue - minValue) > periodValueMapping('one_week');

        let timeLabel: string;

        if (isLongRange) {
          timeLabel = date.format('YYYY');
        } else if (locale2 === 'zh-cn') {
          timeLabel = date.format('ah点');
        } else if (locale2 === 'zh-hk') {
          timeLabel = date.format('ah點');
        } else if (locale2 === 'fr' || locale2 === 'es') {
          timeLabel = date.format('kk[h]');
        } else {
          timeLabel = date.format('ha');
        }

        return `${date.format('MMM D')}\n${timeLabel}`;
      }}
      style={{
        tickLabels: { fontSize: 10, padding: 5 },
      }}
    />
  );
};
