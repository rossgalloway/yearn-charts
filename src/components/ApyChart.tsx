/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

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

// ApyChart component definition
const ApyChart: React.FC<{ data: any[] }> = ({ data }) => {
  // State to hold chart data
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { label: string; backgroundColor: string; borderColor: string; data: (number | null)[]; pointRadius?: number }[] }>({ labels: [], datasets: [] });
  // State to hold the selected timeframe
  const [timeframe, setTimeframe] = useState<number>(30);

  // Effect to update chart data when `data` or `timeframe` changes
  useEffect(() => {
    const timeframeInDays = typeof timeframe === 'string' && timeframe === 'max' ? data.length : timeframe; // Determine the timeframe in days
    const filteredData = data.slice(-timeframeInDays).map(entry => ({
      ...entry,
      time: new Date(entry.time * 1000).toLocaleDateString(), // Convert timestamp to date string
      value: entry.value * 100, // Convert value to percentage
    }));

    const values = filteredData.map(entry => entry.value); // Extract values from filtered data
    const allValues = data.map(entry => entry.value * 100); // Extract all values for SMA calculation
    const smaValues = calculateSMA(allValues, 15).slice(-timeframeInDays); // Calculate 15-day SMA and slice to match timeframe
    const averageValue = calculateAverage(values); // Calculate average value

    // Set the chart data
    setChartData({
      labels: filteredData.map(entry => entry.time), // Set labels to the time values
      datasets: [
        {
          label: 'Value (%)', // Label for the dataset
          backgroundColor: 'rgba(75,192,192,0.4)', // Background color for the dataset
          borderColor: 'rgba(75,192,192,1)', // Border color for the dataset
          data: filteredData.map(entry => entry.value), // Data points for the dataset
        },
        {
          label: '15-Day SMA (%)', // Label for the SMA dataset
          backgroundColor: 'rgba(153,102,255,0.4)', // Background color for the SMA dataset
          borderColor: 'rgba(153,102,255,1)', // Border color for the SMA dataset
          data: smaValues, // Data points for the SMA dataset
          pointRadius: 0, // Radius of the points in the SMA dataset
        },
        {
          label: 'Average APR (%)', // Label for the average dataset
          backgroundColor: 'rgba(255,159,64,0.4)', // Background color for the average dataset
          borderColor: 'rgba(255,159,64,1)', // Border color for the average dataset
          pointRadius: 0, // Radius of the points in the average dataset
          data: Array(values.length).fill(averageValue), // Data points for the average dataset
        },
      ],
    });
  }, [data, timeframe]); // Dependency array for the effect

  return (
    <div className="h-[600px] w-[1200px] flex flex-col justify-center items-center">
      <Line data={chartData} options={options} /> {/* Render the Line chart */}
      <div className="mt-4">
        {/* Button to set timeframe to 7 days */}
        <button
          onClick={() => setTimeframe(7)}
          className={`mr-2 p-2 rounded ${timeframe === 7 ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-darkBackground hover:bg-blue-500 hover:text-white'}`}
        >
          7 Days
        </button>
        {/* Button to set timeframe to 30 days */}
        <button
          onClick={() => setTimeframe(30)}
          className={`mr-2 p-2 rounded ${timeframe === 30 ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-darkBackground hover:bg-blue-500 hover:text-white'}`}
        >
          30 Days
        </button>
        {/* Button to set timeframe to 180 days */}
        <button
          onClick={() => setTimeframe(180)}
          className={`mr-2 p-2 rounded ${timeframe === 180 ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-darkBackground hover:bg-blue-500 hover:text-white'}`}
        >
          180 Days
        </button>
        {/* Button to set timeframe to the maximum available data */}
        <button
          onClick={() => setTimeframe(data.length)}
          className={`p-2 rounded ${timeframe === data.length ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500 bg-darkBackground hover:bg-blue-500 hover:text-white'}`}
        >
          Max
        </button>
      </div>
    </div>
  );
};

export default ApyChart;