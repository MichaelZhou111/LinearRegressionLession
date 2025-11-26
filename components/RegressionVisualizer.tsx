import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ReferenceArea
} from 'recharts';
import { DataPoint } from '../types';

interface RegressionVisualizerProps {
  data: DataPoint[];
  slope: number;
  intercept: number;
  bestFitSlope?: number;
  bestFitIntercept?: number;
  showResiduals?: boolean;
  onChartClick?: (x: number, y: number) => void;
  onPointClick?: (point: DataPoint) => void;
  interactive?: boolean;
}

const RegressionVisualizer: React.FC<RegressionVisualizerProps> = ({
  data,
  slope,
  intercept,
  bestFitSlope,
  bestFitIntercept,
  showResiduals = false,
  onChartClick,
  onPointClick,
  interactive = false
}) => {
  // Generate line points for the current hypothesis
  const minX = 0;
  const maxX = 100;
  
  const currentLineData = [
    { x: minX, yLine: slope * minX + intercept },
    { x: maxX, yLine: slope * maxX + intercept }
  ];

  // Generate line points for the Best Fit (OLS) if provided
  const bestFitLineData = (bestFitSlope !== undefined && bestFitIntercept !== undefined) ? [
    { x: minX, yBest: bestFitSlope * minX + bestFitIntercept },
    { x: maxX, yBest: bestFitSlope * maxX + bestFitIntercept }
  ] : [];

  // Combine data for plotting
  const chartData = data.map(pt => ({
    ...pt,
    yLine: slope * pt.x + intercept,
    // Provide a simple residual for the current hypothesis
    residual: (slope * pt.x + intercept) - pt.y
  }));

  return (
    <div className="w-full h-[400px] bg-white rounded-lg shadow-sm border border-slate-200 p-4 relative select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          onClick={(e) => {
            // Placeholder for potential future background click handling
            if (interactive && onChartClick && e) {
               // Implementing precise click-to-add on responsive charts is complex without
               // direct access to D3 scales. For now, we rely on explicit UI controls.
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[0, 100]} 
            name="X (特征)" 
            unit="" 
            stroke="#64748b"
            label={{ value: 'X (特征)', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            dataKey="y" 
            type="number" 
            domain={[0, 120]} 
            name="Y (目标)" 
            unit="" 
            stroke="#64748b"
            label={{ value: 'Y (目标)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                // Find the scatter point payload
                const ptPayload = payload.find(p => p.dataKey === 'y' && p.payload.residual !== undefined);
                if (ptPayload) {
                    const pt = ptPayload.payload;
                    return (
                    <div className="bg-white p-2 border border-slate-200 shadow-md rounded text-sm z-50">
                        <p className="font-semibold text-slate-700">数据点</p>
                        <p>x: {pt.x}</p>
                        <p>y: {pt.y}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          预测值: {(slope * pt.x + intercept).toFixed(1)}
                        </p>
                        <p className="text-xs text-red-400">
                          误差 (Residual): {Math.abs(pt.residual).toFixed(1)}
                        </p>
                        {onPointClick && <p className="text-xs text-blue-500 mt-1 italic">点击移除</p>}
                    </div>
                    );
                }
              }
              return null;
            }}
          />
          
          {/* The Data Points */}
          <Scatter 
            name="Data" 
            data={chartData} 
            fill="#3b82f6" 
            shape="circle" 
            r={6}
            onClick={(data) => {
                if (interactive && onPointClick) {
                    onPointClick(data.payload);
                }
            }}
            style={{ cursor: interactive && onPointClick ? 'pointer' : 'default' }}
          />
          
          {/* The Current Regression Line (Red) */}
          <Line
            data={currentLineData}
            dataKey="yLine"
            stroke="#ef4444"
            strokeWidth={3}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            name="当前模型"
          />

          {/* The Best Fit Line (Green Dotted) */}
          {bestFitLineData.length > 0 && (
             <Line
                data={bestFitLineData}
                dataKey="yBest"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                name="完美解 (OLS)"
             />
          )}

          {/* Residual Lines (Visualizing Loss) */}
          {showResiduals && chartData.map((entry, index) => (
             <Line
               key={`res-${index}`}
               data={[
                 { x: entry.x, y: entry.y },
                 { x: entry.x, y: entry.yLine }
               ]}
               dataKey="y"
               stroke="#ef4444"
               strokeDasharray="2 2"
               strokeWidth={1}
               strokeOpacity={0.5}
               dot={false}
               isAnimationActive={false}
             />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Legend Overlay */}
      <div className="absolute top-6 right-8 bg-white/80 p-2 rounded border border-slate-100 text-xs shadow-sm backdrop-blur-sm pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-1 bg-red-500 rounded"></div>
            <span>当前模型 (你控制的)</span>
        </div>
        {bestFitSlope !== undefined && (
            <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-1 bg-green-500 border-b-2 border-green-500 border-dotted"></div>
                <span>最优解 (Least Squares)</span>
            </div>
        )}
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>真实数据 {interactive && "(点击移除)"}</span>
        </div>
      </div>
    </div>
  );
};

export default RegressionVisualizer;