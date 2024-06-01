import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
  } from "recharts";
import React from "react";
  
export default function DrawLineChart({data}) { 
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    return (        
        <ResponsiveContainer width="90%" height={400}>
          <LineChart data={data} margin={{ left: 10, right: 10 }}>
              <Line dataKey="value" />
              <XAxis dataKey="date" />
              <YAxis dataKey="value" />
              <Tooltip />
              <CartesianGrid />
          </LineChart>
        </ResponsiveContainer>
    );
}