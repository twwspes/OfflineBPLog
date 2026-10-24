import React from 'react';
import moment from 'moment/min/moment-with-locales';
import { VictoryAxis } from 'victory-native';
import { VictoryAxisProps } from 'victory-axis';
import { useLocalisation } from '../../hooks/useLocalisation';

interface ChartAxisProps extends VictoryAxisProps {
  minValue: number;
  maxValue: number;
}

export const ChartAxis: React.FC<ChartAxisProps> = (props) => {
  const { locale2 } = useLocalisation();

  const { maxValue, minValue, ...otherProps } = props;

  const tickValues = Array.from({ length: 7 }, (_, i) =>
    i === 6 ? maxValue : ((maxValue - minValue) * i) / 6 + minValue,
  );

  return (
    <VictoryAxis
      {...otherProps}
      tickValues={tickValues}
      tickFormat={(t: number) => {
        const date = moment(t).locale(locale2);
        const isLongRange =
          Math.abs(maxValue - minValue) > 1000 * 60 * 60 * 24 * 7;

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
