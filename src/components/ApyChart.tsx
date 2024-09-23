/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react'; // Annotated: Added useMemo
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

interface DataEntry {
  time: number;
  value: number;
}

interface ApyChartProps {
  data: DataEntry[];
}

// Register all necessary components for Chart.js
Chart.register(...registerables);

// Configuration options for the chart
const options = {
  responsive: true, // Ensures the chart is responsive
  maintainAspectRatio: false, // Disables maintaining aspect ratio
  scales: {
    x: {
      display: true, // Displays the x-axis
      title: {
        display: true, // Displays the title for x-axis
        text: 'Date', // Title text for x-axis
      },
    },
    y: {
      display: true, // Displays the y-axis
      title: {
        display: true, // Displays the title for y-axis
        text: 'Value (%)', // Title text for y-axis
      },
      min: 0, // Annotated: Set minimum value to 0
    },
  },
  plugins: {
    legend: {
      display: true, // Displays the legend
      position: 'bottom' as const, // Positions the legend at the bottom
    },
    tooltip: {
      enabled: true, // Enables tooltips
    },
  },
};

// Function to calculate Simple Moving Average (SMA)
const calculateSMA = (data: any[], windowSize: number) => {
  const sma: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      sma.push(null); // Not enough data to calculate SMA
    } else {
      const windowData = data.slice(i - windowSize + 1, i + 1); // Data within the window
      const average = windowData.reduce((sum, value) => sum + value, 0) / windowSize; // Calculate average
      sma.push(average); // Push the average to the SMA array
    }
  }
  return sma;
};

// Function to calculate the average of an array of numbers
const calculateAverage = (data: any[]) => {
  const sum = data.reduce((acc, value) => acc + value, 0); // Sum all values
  return sum / data.length; // Return the average
};

const ApyChart: React.FC<ApyChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<number | 'max'>(30);

  // Determine the timeframe in days
  const timeframeInDays = useMemo(() => {
    return timeframe === 'max' ? data.length : timeframe;
  }, [timeframe, data.length]);

  // Memoize the filtered data based on the timeframe
  const filteredData = useMemo(() => {
    return data
      .slice(-timeframeInDays)
      .map(entry => ({
        ...entry,
        time: new Date(entry.time * 1000).toLocaleDateString(),
        value: entry.value * 100,
      }));
  }, [data, timeframeInDays]);

  // Memoize the values extracted from filtered data
  const values = useMemo(() => filteredData.map(entry => entry.value), [filteredData]);

  // Memoize all values for SMA calculation
  const allValues = useMemo(() => data.map(entry => entry.value * 100), [data]);

  // Memoize the SMA values
  const smaValues = useMemo(() => {
    return calculateSMA(allValues, 15).slice(-timeframeInDays);
  }, [allValues, timeframeInDays]);

  // Memoize the average value
  const averageValue = useMemo(() => calculateAverage(values), [values]);

  // Memoize the chart data
  const chartData = useMemo(
    () => ({
      labels: filteredData.map(entry => entry.time),
      datasets: [
        {
          label: 'Value (%)',
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          data: values,
        },
        {
          label: '15-Day SMA (%)',
          backgroundColor: 'rgba(153,102,255,0.4)',
          borderColor: 'rgba(153,102,255,1)',
          data: smaValues,
          pointRadius: 0,
        },
        {
          label: 'Average APR (%)',
          backgroundColor: 'rgba(255,159,64,0.4)',
          borderColor: 'rgba(255,159,64,1)',
          pointRadius: 0,
          data: Array(values.length).fill(averageValue),
          
        },
      ],
    }),
    [filteredData, values, smaValues, averageValue],
  );

  return (
    <div className="w-full md:h-[calc(75vh)] h-[50vh] pr-4 pl-4 flex flex-col justify-center items-center "> {/* Fixed calc syntax */}
      <Line data={chartData} options={options} /> {/* Render the Line chart */}
      <div className="mt-4">
        {/* Button to set timeframe to 7 days */}
        <button
          onClick={() => setTimeframe(7)}
          className={`mr-2 p-2 rounded ${timeframe === 7 ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'}`} // Annotated: Updated for light and dark mode
        >
          7 Days
        </button>
        {/* Button to set timeframe to 30 days */}
        <button
          onClick={() => setTimeframe(30)}
          className={`mr-2 p-2 rounded ${timeframe === 30 ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'}`} // Annotated: Updated for light and dark mode
        >
          30 Days
        </button>
        {/* Button to set timeframe to 180 days */}
        <button
          onClick={() => setTimeframe(180)}
          className={`mr-2 p-2 rounded ${timeframe === 180 ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'}`} // Annotated: Updated for light and dark mode
        >
          180 Days
        </button>
        {/* Button to set timeframe to the maximum available data */}
        <button
          onClick={() => setTimeframe('max')}
          className={`p-2 rounded ${timeframe === data.length ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'}`} // Annotated: Updated for light and dark mode
        >
          Max
        </button>
      </div>
    </div>
  );
};

export default ApyChart;