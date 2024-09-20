/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Add options for customization
const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Value (%)',
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const, // Change position of labels
    },
    tooltip: {
      enabled: true,
    },
  },
};

const calculateSMA = (data: any[], windowSize: number) => {
  const sma: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      sma.push(null); // Not enough data to calculate SMA
    } else {
      const windowData = data.slice(i - windowSize + 1, i + 1);
      const average = windowData.reduce((sum, value) => sum + value, 0) / windowSize;
      sma.push(average);
    }
  }
  return sma;
};

const calculateAverage = (data: any[]) => {
  const sum = data.reduce((acc, value) => acc + value, 0);
  return sum / data.length;
};

const TestChart: React.FC<{ data: any[] }> = ({ data }) => {
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { label: string; backgroundColor: string; borderColor: string; data: (number | null)[] }[] }>({ labels: [], datasets: [] });

  useEffect(() => {
    const last30DaysData = data.slice(-90).map(entry => ({
      ...entry,
      time: new Date(entry.time * 1000).toLocaleDateString(),
      value: entry.value * 100,
    }));

    const values = last30DaysData.map(entry => entry.value);
    const smaValues = calculateSMA(values, 15); // 15-day moving average
    const averageValue = calculateAverage(values);

    setChartData({
      labels: last30DaysData.map(entry => entry.time),
      datasets: [
        {
          label: 'Value (%)',
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          data: last30DaysData.map(entry => entry.value),
        },
        {
          label: '15-Day SMA (%)',
          backgroundColor: 'rgba(153,102,255,0.4)',
          borderColor: 'rgba(153,102,255,1)',
          data: smaValues,
        },
        {
          label: 'Average APR (%)',
          backgroundColor: 'rgba(255,159,64,0.4)',
          borderColor: 'rgba(255,159,64,1)',
          // @ts-expect-error: pointRadius is not recognized by the type definition
          pointRadius: 0,
          data: Array(values.length).fill(averageValue),
        },
      ],
    });
  }, [data]);

  return (
    <div className="h-[600px] w-[1200px] flex justify-center items-center">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TestChart;