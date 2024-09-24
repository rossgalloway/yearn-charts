// src/components/ApyChart2.tsx
import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

import {
    ChartContainer,
    ChartConfig,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

interface DataEntry {
    time: number;
    value: number;
}

interface ApyChartProps {
    data: DataEntry[];
    selectedAsset: string | null;
}

// Function to calculate Simple Moving Average (SMA)
const calculateSMA = (data: number[], windowSize: number): (number | null)[] => {
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
const calculateAverage = (data: number[]) => {
    const sum = data.reduce((acc, value) => acc + value, 0); // Sum all values
    return sum / data.length; // Return the average
};

const ApyChart: React.FC<ApyChartProps> = ({ data, selectedAsset }) => {
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

    // Prepare chart data array
    const chartDataArray = useMemo(() => {
        return filteredData.map((entry, index) => ({
            time: entry.time,
            value: entry.value,
            smaValue: smaValues[index],
            averageValue: averageValue,
        }));
    }, [filteredData, smaValues, averageValue]);

    // Define chart config
    const chartConfig = {
        value: {
            label: 'Value (%)',
            color: 'hsl(var(--chart-1))',
        },
        smaValue: {
            label: '15-Day SMA (%)',
            color: 'hsl(var(--chart-2))',
        },
        averageValue: {
            label: 'Average APY (%)',
            color: 'hsl(var(--chart-3))',
        },
    } satisfies ChartConfig;

    return (
        <div className="w-full pr-4 pl-4 flex flex-col justify-center items-center" >
            <h1 className="text-xl md:text-5xl">{selectedAsset ? `${selectedAsset} Chart` : 'Name not found'}</h1>
            <div className="w-full" >
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartDataArray}
                            margin={{
                                // left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                domain={[0, 'auto']}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                                dataKey="value"
                                name={chartConfig.value.label}
                                type="monotone"
                                stroke="var(--color-value)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                dataKey="smaValue"
                                name={chartConfig.smaValue.label}
                                type="monotone"
                                stroke="var(--color-smaValue)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                dataKey="averageValue"
                                name={chartConfig.averageValue.label}
                                type="monotone"
                                stroke="var(--color-averageValue)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
            <div className="mt-4">
                {/* Timeframe buttons */}
                <button
                    onClick={() => setTimeframe(7)}
                    className={`mr-2 p-2 rounded ${timeframe === 7
                            ? 'bg-blue-500 text-white'
                            : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'
                        }`}
                >
                    7 Days
                </button>
                <button
                    onClick={() => setTimeframe(30)}
                    className={`mr-2 p-2 rounded ${timeframe === 30
                            ? 'bg-blue-500 text-white'
                            : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'
                        }`}
                >
                    30 Days
                </button>
                <button
                    onClick={() => setTimeframe(180)}
                    className={`mr-2 p-2 rounded ${timeframe === 180
                            ? 'bg-blue-500 text-white'
                            : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'
                        }`}
                >
                    180 Days
                </button>
                <button
                    onClick={() => setTimeframe('max')}
                    className={`p-2 rounded ${timeframe === 'max'
                            ? 'bg-blue-500 text-white'
                            : 'border border-blue-500 text-blue-500 bg-lightBackground dark:bg-darkBackground hover:bg-blue-500 hover:text-white'
                        }`}
                >
                    Max
                </button>
            </div>
        </div>
    );
};

export default ApyChart;
