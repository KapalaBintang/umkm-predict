"use client"

import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface PriceChartProps {
  data: any[]
  type: "area" | "bar" | "line"
}

export function PriceChart({ data, type }: PriceChartProps) {
  const colors = {
    telur: "#f97316", // orange-500
    cabai: "#ef4444", // red-500
    minyak: "#22c55e", // green-500
    beras: "#3b82f6", // blue-500
  }

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTelur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.telur} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.telur} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCabai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.cabai} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.cabai} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorMinyak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.minyak} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.minyak} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorBeras" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.beras} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.beras} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="bulan" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip
              formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, ""]}
              labelFormatter={(label) => `Bulan: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="telur"
              name="Telur Ayam"
              stroke={colors.telur}
              fillOpacity={1}
              fill="url(#colorTelur)"
            />
            <Area
              type="monotone"
              dataKey="cabai"
              name="Cabai Merah"
              stroke={colors.cabai}
              fillOpacity={1}
              fill="url(#colorCabai)"
            />
            <Area
              type="monotone"
              dataKey="minyak"
              name="Minyak Goreng"
              stroke={colors.minyak}
              fillOpacity={1}
              fill="url(#colorMinyak)"
            />
            <Area
              type="monotone"
              dataKey="beras"
              name="Beras"
              stroke={colors.beras}
              fillOpacity={1}
              fill="url(#colorBeras)"
            />
          </RechartsAreaChart>
        )
      case "bar":
        return (
          <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, ""]}
              labelFormatter={(label) => `Bulan: ${label}`}
            />
            <Legend />
            <Bar dataKey="telur" name="Telur Ayam" fill={colors.telur} />
            <Bar dataKey="cabai" name="Cabai Merah" fill={colors.cabai} />
            <Bar dataKey="minyak" name="Minyak Goreng" fill={colors.minyak} />
            <Bar dataKey="beras" name="Beras" fill={colors.beras} />
          </RechartsBarChart>
        )
      case "line":
        return (
          <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, ""]}
              labelFormatter={(label) => `Bulan: ${label}`}
            />
            <Legend />
            <Line type="monotone" dataKey="telur" name="Telur Ayam" stroke={colors.telur} />
            <Line type="monotone" dataKey="cabai" name="Cabai Merah" stroke={colors.cabai} />
            <Line type="monotone" dataKey="minyak" name="Minyak Goreng" stroke={colors.minyak} />
            <Line type="monotone" dataKey="beras" name="Beras" stroke={colors.beras} />
          </RechartsLineChart>
        )
      default:
        return null
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  )
}
