"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function TrendSparkline({ seed, trend }: { seed: number; trend: number }) {
  const data = Array.from({ length: 10 }, (_, index) => ({ value: 35 + index * (trend / 12) + ((seed * 7 + index * 11) % 13) }));
  return <div className="sparkline" aria-label={`${trend}% simulated momentum`}><ResponsiveContainer width="100%" height={54}><LineChart data={data}><Line dataKey="value" type="monotone" stroke="#8c6bff" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div>;
}
