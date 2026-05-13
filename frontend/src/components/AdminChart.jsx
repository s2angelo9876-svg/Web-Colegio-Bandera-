import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const AdminChart = ({ data, title, type = "line", color = "#003087" }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Estadísticas Visuales</h4>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">{title}</h3>
        </div>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-75" />
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1.5rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px 20px'
                }}
                itemStyle={{ fontWeight: 'black', fontSize: '12px', color: '#003087' }}
              />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke={color} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={2000}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1.5rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px 20px'
                }}
                itemStyle={{ fontWeight: 'black', fontSize: '12px', color: '#003087' }}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke={color} 
                strokeWidth={4} 
                dot={{ r: 6, fill: color, strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
    </div>
  );
};

export default AdminChart;
