'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '@/lib/format';

interface DataPoint {
  index: number;
  views: number;
  label: string;
}

interface ChannelGrowthChartProps {
  data: DataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className='rounded-xl border border-white/[0.08] bg-[#111118] px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <p className='mb-1 text-[10px] uppercase tracking-[0.12em] text-[#4A4845]'>
        {label}
      </p>
      <p className='text-[13px] font-medium text-[#F0EEE8]'>
        {formatNumber(Number(payload[0].value ?? 0))}
        <span className='ml-1 text-[10px] text-[#4A4845]'>views</span>
      </p>
    </div>
  );
}

export function ChannelGrowthChart({ data }: ChannelGrowthChartProps) {
  if (!data.length) return null;

  return (
    <div className='h-[200px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id='lineGlow' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#E8441C' stopOpacity={0.15} />
              <stop offset='100%' stopColor='#E8441C' stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray='1 4'
            stroke='rgba(255,255,255,0.04)'
            vertical={false}
          />

          <XAxis
            dataKey='label'
            stroke='transparent'
            tick={{
              fill: '#3E3C38',
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
            }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke='transparent'
            tick={{
              fill: '#3E3C38',
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatNumber(v)}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'rgba(255,255,255,0.06)',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
          />

          <Line
            type='monotone'
            dataKey='views'
            stroke='#E8441C'
            strokeWidth={1.5}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#E8441C',
              stroke: '#0a0a0f',
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
