"use client";

import React, { JSX } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface TemperatureHistoryChartProps {
  data: Array<{
    date: string;
    temperature: number;
  }>;
}

function TemperatureHistoryChart({ data }: TemperatureHistoryChartProps): JSX.Element {
  // Show the latest 30 days
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recent = sorted.slice(-30);

  const chartData = {
    labels: recent.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: recent.map(item => item.temperature),
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        title: { display: true, text: '°C' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      x: {
        title: { display: true, text: 'Date' },
        ticks: {
          autoSkip: false,
          maxTicksLimit: 10,
          maxRotation: 60,
          minRotation: 45,
        },
      },
    }
  };

  return (
    <div className="my-8">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default TemperatureHistoryChart;