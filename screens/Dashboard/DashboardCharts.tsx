import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
  VictoryLegend,
  VictoryBoxPlot,
  VictoryScatter,
} from 'victory-native';

import type {
  BloodPressureGeneralType,
  BloodPressureTypeForStatistics,
} from '../../helpers/dbBloodPressure';
import type { DashboardSeries } from '../../helpers/dashboardData';
import { useLocalisation } from '../../hooks/useLocalisation';
import { ChartAxis } from '../../components/Charts/ChartAxis';
import { FontSize } from '../../constants/FontSize';

interface Props extends DashboardSeries {
  bloodPressures: BloodPressureGeneralType | undefined;
  bloodPressuresAvgMaxMin: BloodPressureTypeForStatistics[];
}

export const DashboardCharts: React.FC<Props> = ({
  bloodPressures,
  bloodPressuresAvgMaxMin,
  bloodPressuresSystolicForChart,
  bloodPressuresDiastolicForChart,
  bloodPressuresPulseForChart,
  bloodPressuresSystolicMinMaxForChart,
  bloodPressuresDiastolicMinMaxForChart,
  bloodPressuresPulseMinMaxForChart,
}) => {
  const { t } = useLocalisation();
  const shouldRenderSystolicChart =
    bloodPressures !== undefined &&
    bloodPressures.array.length > 0 &&
    (bloodPressuresSystolicForChart.length > 0 ||
      bloodPressuresDiastolicForChart.length > 0);

  const hasDiastolicMinMax = !!bloodPressuresDiastolicMinMaxForChart[1];

  const renderSystolicChart = useMemo(() => {
    if (!shouldRenderSystolicChart) return null;

    const maxSysY = bloodPressuresAvgMaxMin[0].max_systolic_blood_pressure + 10;
    const minDiaY =
      bloodPressuresAvgMaxMin[0].min_diastolic_blood_pressure - 10;

    const renderAxis = () => {
      if (
        bloodPressuresSystolicForChart[1] &&
        bloodPressuresDiastolicForChart[1]
      ) {
        return (
          <ChartAxis
            crossAxis
            minValue={Math.min(
              bloodPressuresSystolicForChart[0].x.valueOf(),
              bloodPressuresDiastolicForChart[0].x.valueOf(),
            )}
            maxValue={Math.max(
              bloodPressuresSystolicForChart[
                bloodPressuresSystolicForChart.length - 1
              ].x.valueOf(),
              bloodPressuresDiastolicForChart[
                bloodPressuresDiastolicForChart.length - 1
              ].x.valueOf(),
            )}
          />
        );
      }
      if (bloodPressuresSystolicForChart[1]) {
        return (
          <ChartAxis
            crossAxis
            minValue={bloodPressuresSystolicForChart[0].x.valueOf()}
            maxValue={bloodPressuresSystolicForChart[
              bloodPressuresSystolicForChart.length - 1
            ].x.valueOf()}
          />
        );
      }
      if (bloodPressuresDiastolicForChart[1]) {
        return (
          <ChartAxis
            crossAxis
            minValue={bloodPressuresDiastolicForChart[0].x.valueOf()}
            maxValue={bloodPressuresDiastolicForChart[
              bloodPressuresDiastolicForChart.length - 1
            ].x.valueOf()}
          />
        );
      }
      return null;
    };

    return (
      <View>
        <VictoryChart
          theme={VictoryTheme.material}
          scale={{ x: 'time' }}
          maxDomain={{ y: maxSysY }}
          minDomain={{ y: minDiaY }}
          domainPadding={10}
        >
          {renderAxis()}
          <VictoryAxis dependentAxis />
          <VictoryLegend
            x={100}
            y={0}
            borderPadding={{ right: 25 }}
            orientation="vertical"
            gutter={20}
            style={{
              border: { stroke: 'black' },
              labels: { fontSize: FontSize.veryvarySmallContent },
            }}
            data={
              bloodPressuresSystolicMinMaxForChart[1]
                ? [
                    {
                      name: `${t('systolic_blood_pressure')} (mmHg)`,
                      symbol: { fill: 'red' },
                    },
                    {
                      name: t('min_q1_mean_q3_max'),
                      symbol: { fill: 'grey' },
                    },
                  ]
                : [
                    {
                      name: `${t('systolic_blood_pressure')} (mmHg)`,
                      symbol: { fill: 'red' },
                    },
                    {
                      name: `${t('diastolic_blood_pressure')} (mmHg)`,
                      symbol: { fill: 'blue' },
                    },
                  ]
            }
          />
          {!!bloodPressuresSystolicMinMaxForChart[1] && (
            <VictoryBoxPlot
              data={bloodPressuresSystolicMinMaxForChart}
              boxWidth={10}
              whiskerWidth={5}
            />
          )}
          {!!bloodPressuresSystolicForChart[1] && (
            <VictoryLine
              style={{
                data: { stroke: 'red' },
                parent: { border: '1px solid #ccc' },
              }}
              data={bloodPressuresSystolicForChart}
            />
          )}
          {!!bloodPressuresSystolicForChart[1] && (
            <VictoryScatter
              data={bloodPressuresSystolicForChart}
              style={{ data: { fill: 'red' } }}
            />
          )}
          {!!bloodPressuresDiastolicForChart[1] && !hasDiastolicMinMax && (
            <VictoryLine
              style={{
                data: { stroke: 'blue' },
                parent: { border: '1px solid #ccc' },
              }}
              data={bloodPressuresDiastolicForChart}
            />
          )}
          {!!bloodPressuresDiastolicForChart[1] && !hasDiastolicMinMax && (
            <VictoryScatter
              data={bloodPressuresDiastolicForChart}
              style={{ data: { fill: 'blue' } }}
            />
          )}
        </VictoryChart>

        {hasDiastolicMinMax && (
          <VictoryChart
            theme={VictoryTheme.material}
            scale={{ x: 'time' }}
            maxDomain={{
              y: bloodPressuresAvgMaxMin[0].max_diastolic_blood_pressure + 10,
            }}
            minDomain={{
              y: bloodPressuresAvgMaxMin[0].min_diastolic_blood_pressure - 10,
            }}
            domainPadding={10}
          >
            {renderAxis()}
            <VictoryAxis dependentAxis />
            <VictoryLegend
              x={100}
              y={0}
              borderPadding={{ right: 25 }}
              orientation="vertical"
              gutter={20}
              style={{
                border: { stroke: 'black' },
                labels: { fontSize: FontSize.veryvarySmallContent },
              }}
              data={[
                {
                  name: `${t('diastolic_blood_pressure')} (mmHg)`,
                  symbol: { fill: 'blue' },
                },
                {
                  name: t('min_q1_mean_q3_max'),
                  symbol: { fill: 'grey' },
                },
              ]}
            />
            {!!bloodPressuresDiastolicMinMaxForChart[1] && (
              <VictoryBoxPlot
                data={bloodPressuresDiastolicMinMaxForChart}
                boxWidth={10}
                whiskerWidth={5}
              />
            )}
            {!!bloodPressuresDiastolicForChart[1] && (
              <VictoryLine
                style={{
                  data: { stroke: 'blue' },
                  parent: { border: '1px solid #ccc' },
                }}
                data={bloodPressuresDiastolicForChart}
              />
            )}
            {!!bloodPressuresDiastolicForChart[1] && (
              <VictoryScatter
                data={bloodPressuresDiastolicForChart}
                style={{ data: { fill: 'blue' } }}
              />
            )}
          </VictoryChart>
        )}
      </View>
    );
  }, [
    bloodPressuresAvgMaxMin,
    bloodPressuresDiastolicForChart,
    bloodPressuresDiastolicMinMaxForChart,
    bloodPressuresSystolicForChart,
    bloodPressuresSystolicMinMaxForChart,
    hasDiastolicMinMax,
    shouldRenderSystolicChart,
    t,
  ]);

  const renderPulseChart = useMemo(() => {
    const hasPulseData =
      bloodPressures &&
      bloodPressures.array.length > 1 &&
      bloodPressuresPulseForChart.length > 1;

    if (!hasPulseData) return null;

    const hasPulseMinMax = bloodPressuresPulseMinMaxForChart.length > 1;

    const minValue = bloodPressuresPulseForChart[0].x.valueOf();
    const maxValue =
      bloodPressuresPulseForChart[
        bloodPressuresPulseForChart.length - 1
      ].x.valueOf();

    const minY = bloodPressuresAvgMaxMin[0].min_pulse - 10;
    const maxY = bloodPressuresAvgMaxMin[0].max_pulse + 10;

    return (
      <VictoryChart
        theme={VictoryTheme.material}
        scale={{ x: 'time' }}
        maxDomain={{ y: maxY }}
        minDomain={{ y: minY }}
        domainPadding={10}
      >
        <ChartAxis crossAxis minValue={minValue} maxValue={maxValue} />
        <VictoryAxis dependentAxis />
        <VictoryLegend
          x={125}
          y={0}
          borderPadding={{ right: 25 }}
          orientation="vertical"
          gutter={20}
          style={{
            border: { stroke: 'black' },
            labels: { fontSize: FontSize.veryvarySmallContent },
          }}
          data={[
            {
              name: `${t('heartbeat')} (bpm)`,
              symbol: { fill: 'red' },
            },
            ...(hasPulseMinMax
              ? [{ name: t('min_q1_mean_q3_max'), symbol: { fill: 'grey' } }]
              : []),
          ]}
        />
        {hasPulseMinMax && (
          <VictoryBoxPlot
            data={bloodPressuresPulseMinMaxForChart}
            boxWidth={10}
            whiskerWidth={5}
          />
        )}
        <VictoryLine
          style={{
            data: { stroke: '#c43a31' },
            parent: { border: '1px solid #ccc' },
          }}
          data={bloodPressuresPulseForChart}
        />
        <VictoryScatter
          data={bloodPressuresPulseForChart}
          style={{ data: { fill: 'red' } }}
        />
      </VictoryChart>
    );
  }, [
    bloodPressures,
    bloodPressuresAvgMaxMin,
    bloodPressuresPulseForChart,
    bloodPressuresPulseMinMaxForChart,
    t,
  ]);

  return (
    <>
      {renderSystolicChart}
      {renderPulseChart}
    </>
  );
};
