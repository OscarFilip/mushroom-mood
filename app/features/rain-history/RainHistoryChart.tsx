"use client";

import React, { JSX } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface RainHistoryChartProps {
  data: Array<{
    date: string;
    rainFall: number;
  }>;
}

function RainHistoryChart({ data }: RainHistoryChartProps): JSX.Element {
  // Show the latest 30 days
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recent = sorted.slice(-30);

  const chartData = {
    labels: recent.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: recent.map(item => item.rainFall),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        barPercentage: 1.2,
        categoryPercentage: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'mm' } },
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
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default RainHistoryChart;