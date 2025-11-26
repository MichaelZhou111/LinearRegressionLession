import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Calculator, 
  Target, 
  Play, 
  Menu,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Brain,
  Plus,
  Trash2,
  Pause,
  Zap,
  MousePointerClick,
  Sigma,
  Activity,
  MoveDiagonal,
  Layers
} from 'lucide-react';
import RegressionVisualizer from './components/RegressionVisualizer';
import AITutor from './components/AITutor';
import { LessonId, LessonContent, DataPoint } from './types';

// Curriculum Data
const LESSONS: LessonContent[] = [
  { id: LessonId.INTRO, title: '1. 什么是线性回归？', description: '监督学习的“Hello World”' },
  { id: LessonId.MATH_BASICS, title: '2. 基础数学补给站', description: '从零开始的数学直觉' },
  { id: LessonId.HYPOTHESIS, title: '3. 核心概念：假设函数', description: 'y = wx + b 的魔法' },
  { id: LessonId.LOSS_FUNCTION, title: '4. 损失函数 (Loss)', description: '我们要优化什么？' },
  { id: LessonId.GRADIENT_DESCENT, title: '5. 梯度下降', description: '让机器“自动学习”' },
  { id: LessonId.APPLICATIONS, title: '6. 现实应用场景', description: '它能做什么？' },
  { id: LessonId.PLAYGROUND, title: '7. 互动实验室', description: '动手试一试' },
];

// Initial Dummy Data
const INITIAL_DATA: DataPoint[] = [
  { x: 10, y: 15 }, { x: 20, y: 30 }, { x: 30, y: 28 }, { x: 40, y: 45 },
  { x: 50, y: 55 }, { x: 60, y: 65 }, { x: 70, y: 62 }, { x: 80, y: 85 }
];

// Simple data for Loss Function Lesson
const LOSS_LESSON_DATA: DataPoint[] = [
  { x: 20, y: 30 }, { x: 50, y: 50 }, { x: 80, y: 70 }
];

const App: React.FC = () => {
  const [activeLesson, setActiveLesson] = useState<LessonId>(LessonId.INTRO);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Lesson 2: Math Basics State ---
  const [mathTab, setMathTab] = useState<'line' | 'sigma' | 'derivative' | 'vector'>('line');
  // Line Demo
  const [mathLineW, setMathLineW] = useState(1);
  const [mathLineB, setMathLineB] = useState(0);
  // Derivative Demo
  const [derivX, setDerivX] = useState(0);

  // --- Lesson 4: Loss Function State ---
  const [lossW, setLossW] = useState(0.5);
  const [lossB, setLossB] = useState(10);

  // --- Playground State ---
  const [slope, setSlope] = useState(0.5);
  const [intercept, setIntercept] = useState(10);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(INITIAL_DATA);
  const [loss, setLoss] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.0001);
  // For manual adding in playground
  const [newPointX, setNewPointX] = useState<string>('50');
  const [newPointY, setNewPointY] = useState<string>('50');

  // OLS (Best Fit) State
  const [bestFit, setBestFit] = useState<{slope: number, intercept: number}>({ slope: 0, intercept: 0 });

  // Gradient Descent Demo State (Lesson 5)
  const [gdDemoStep, setGdDemoStep] = useState(0); // 0 to 10 position on curve

  // Calculate Loss (MSE)
  const calculateLoss = useCallback((currentSlope: number, currentIntercept: number, points: DataPoint[]) => {
    if (points.length === 0) return 0;
    let sumSquaredError = 0;
    points.forEach(pt => {
      const prediction = currentSlope * pt.x + currentIntercept;
      sumSquaredError += Math.pow(pt.y - prediction, 2);
    });
    return sumSquaredError / (2 * points.length);
  }, []);

  useEffect(() => {
    setLoss(calculateLoss(slope, intercept, dataPoints));
  }, [slope, intercept, dataPoints, calculateLoss]);

  // Calculate Ordinary Least Squares (Best Fit)
  useEffect(() => {
    if (dataPoints.length < 2) {
        setBestFit({ slope: 0, intercept: 0 });
        return;
    }
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
    const sumXY = dataPoints.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumXX = dataPoints.reduce((acc, p) => acc + p.x * p.x, 0);

    const denominatorSlope = n * sumXX - sumX * sumX;

    if (denominatorSlope !== 0) {
      const newSlope = (n * sumXY - sumX * sumY) / denominatorSlope;
      const newIntercept = (sumY - newSlope * sumX) / n;
      setBestFit({ slope: newSlope, intercept: newIntercept });
    }
  }, [dataPoints]);

  // Gradient Descent Step Function
  const performGradientDescentStep = () => {
    let dSlope = 0;
    let dIntercept = 0;
    const N = dataPoints.length;

    if (N === 0) return;

    dataPoints.forEach(pt => {
      const prediction = slope * pt.x + intercept;
      const error = prediction - pt.y;
      dSlope += error * pt.x;
      dIntercept += error;
    });

    // Averaging gradients
    dSlope = dSlope / N;
    dIntercept = dIntercept / N;

    setSlope(prev => prev - learningRate * dSlope);
    setIntercept(prev => prev - learningRate * dIntercept);
  };

  // Training Loop Effect
  useEffect(() => {
    let interval: number;
    if (isTraining) {
      interval = window.setInterval(performGradientDescentStep, 20);
    }
    return () => clearInterval(interval);
  }, [isTraining, slope, intercept, learningRate, dataPoints]);

  // Data Manipulation Helpers
  const addRandomPoint = () => {
    const x = Math.floor(Math.random() * 90) + 5;
    const noise = (Math.random() - 0.5) * 30;
    const y = Math.max(0, Math.min(100, x + 10 + noise));
    setDataPoints(prev => [...prev, { x, y }]);
  };

  const addManualPoint = () => {
      const x = parseFloat(newPointX);
      const y = parseFloat(newPointY);
      if (!isNaN(x) && !isNaN(y)) {
          setDataPoints(prev => [...prev, { x, y }]);
      }
  };

  const removePoint = (pointToRemove: DataPoint) => {
      setDataPoints(prev => prev.filter(p => p !== pointToRemove));
  };

  const clearData = () => {
    setDataPoints([]);
    setSlope(0);
    setIntercept(0);
    setIsTraining(false);
  };

  const resetData = () => {
    setDataPoints(INITIAL_DATA);
    setSlope(0.5);
    setIntercept(10);
    setIsTraining(false);
  };

  const renderContent = () => {
    switch (activeLesson) {
      case LessonId.INTRO:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">1. 什么是线性回归？</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              想象一下，你想在城市里买一套房子。你手头有一些数据：房子的面积和对应的价格。
              如果现在有一套新出的房子，你知道它的面积，你能预测它的价格吗？
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="font-semibold text-blue-800">核心定义</p>
              <p className="text-blue-700 mt-2">
                线性回归（Linear Regression）是一种监督学习算法，它试图找到自变量（输入，如面积）和因变量（输出，如房价）之间的<strong>线性关系</strong>。
              </p>
            </div>
            <p className="text-slate-600">
              简单来说，就是在数据点之间画一条“最合适”的直线。这条直线可以用来预测未来的数据。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-bold mb-2 flex items-center gap-2"><Brain className="text-purple-500"/> 监督学习</h3>
                <p className="text-sm text-slate-500">我们要给机器“标准答案”（标签），比如告诉它：“这间100平米的房子卖了200万”。</p>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-bold mb-2 flex items-center gap-2"><TrendingUp className="text-green-500"/> 回归问题</h3>
                <p className="text-sm text-slate-500">输出是一个连续的数值（如价格、温度、销量），而不是类别（猫或狗）。</p>
              </div>
            </div>
          </div>
        );

      case LessonId.MATH_BASICS:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">2. 基础数学补给站</h2>
            <p className="text-lg text-slate-600 mb-6">
              别担心，我们不需要成为数学家。学懂线性回归，你只需要掌握以下 4 个核心概念。
            </p>
            
            {/* Custom Tabs Navigation */}
            <div className="flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-slate-200">
              {[
                { id: 'line', label: '代数：直线方程', icon: MoveDiagonal },
                { id: 'sigma', label: '统计：求和符号', icon: Sigma },
                { id: 'derivative', label: '微积分：导数/梯度', icon: Activity },
                { id: 'vector', label: '线性代数：向量', icon: Layers },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMathTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    mathTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md font-bold' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
              {mathTab === 'line' && (
                <div className="animate-fadeIn space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MoveDiagonal className="text-blue-500"/> 直线方程 y = wx + b
                  </h3>
                  <p className="text-slate-600">
                    线性回归的最终目标就是找到一条线。在初中数学里，我们叫它 $y = kx + b$。
                    在机器学习里，我们通常写成 $y = wx + b$。
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-center border border-slate-200">
                       {/* Simple Line SVG */}
                       <svg width="300" height="300" viewBox="-50 -50 400 400" className="overflow-visible">
                          {/* Grid */}
                          <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="300" height="300" fill="url(#grid)" />
                          {/* Axes */}
                          <line x1="0" y1="300" x2="0" y2="0" stroke="#94a3b8" strokeWidth="2" />
                          <line x1="0" y1="300" x2="300" y2="300" stroke="#94a3b8" strokeWidth="2" />
                          <text x="310" y="300" fill="#64748b" fontSize="14">x</text>
                          <text x="0" y="-10" fill="#64748b" fontSize="14">y</text>
                          
                          {/* The Line: y = wx + b. (SVG y is inverted) */}
                          {/* Scaled: x=0..300 maps to logical 0..10. y=300..0 maps to logical 0..10 */}
                          {/* Logical: y = w*x + b.  Scale: 30px = 1 unit */}
                          <line 
                            x1="0" 
                            y1={300 - (mathLineB * 30)} 
                            x2="300" 
                            y2={300 - ((mathLineW * 10 + mathLineB) * 30)} 
                            stroke="#3b82f6" 
                            strokeWidth="4" 
                          />
                          
                          {/* Intercept Point */}
                          <circle cx="0" cy={300 - (mathLineB * 30)} r="5" fill="#ef4444" />
                          <text x="10" y={300 - (mathLineB * 30) - 10} fill="#ef4444" fontSize="12" fontWeight="bold">b (截距)</text>
                       </svg>
                    </div>
                    <div className="space-y-6">
                       <div className="bg-blue-50 p-4 rounded border border-blue-100">
                          <p className="font-mono text-2xl text-center text-blue-800 font-bold">y = {mathLineW.toFixed(1)}x + {mathLineB.toFixed(1)}</p>
                       </div>
                       
                       <div>
                         <label className="font-bold text-slate-700 block mb-2">w (斜率/权重): 控制倾斜度</label>
                         <input 
                           type="range" min="-2" max="5" step="0.1"
                           value={mathLineW} onChange={e => setMathLineW(parseFloat(e.target.value))}
                           className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                         />
                         <p className="text-sm text-slate-500 mt-1">w 越大，线越陡。w 为负，线向下。</p>
                       </div>

                       <div>
                         <label className="font-bold text-slate-700 block mb-2">b (截距/偏置): 控制上下平移</label>
                         <input 
                           type="range" min="0" max="8" step="0.1"
                           value={mathLineB} onChange={e => setMathLineB(parseFloat(e.target.value))}
                           className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                         />
                         <p className="text-sm text-slate-500 mt-1">b 代表当 x=0 时，y 的基础值。</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {mathTab === 'sigma' && (
                <div className="animate-fadeIn space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Sigma className="text-purple-500"/> 求和符号 (Sigma)
                  </h3>
                  <p className="text-slate-600">
                    这个像“E”一样的符号 $\sum$ 只是**加法**的简写。在代码中，它就是一个 <code className="bg-slate-100 px-1 rounded">for</code> 循环。
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-slate-900 text-white p-6 rounded-xl font-mono shadow-lg">
                        <p className="text-slate-400 mb-4">// 程序员视角</p>
                        <p className="mb-2"><span className="text-purple-400">let</span> sum = 0;</p>
                        <p className="mb-2"><span className="text-purple-400">const</span> data = [2, 5, 8];</p>
                        <p className="mb-2"><span className="text-purple-400">for</span> {"(let i=0; i<3; i++) {"}</p>
                        <p className="ml-4 text-green-400">{"sum = sum + data[i];"}</p>
                        <p>{"}"}</p>
                        <p className="mt-4 text-slate-400">// sum 现在是 15</p>
                    </div>
                    
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="text-center text-5xl font-serif text-slate-700">
                           {'$$ \\sum_{i=1}^{3} x_i $$'}
                        </div>
                        <div className="text-center text-lg text-slate-600">
                            = <span className="inline-block bg-blue-100 px-2 py-1 rounded mx-1">2</span> + 
                              <span className="inline-block bg-blue-100 px-2 py-1 rounded mx-1">5</span> + 
                              <span className="inline-block bg-blue-100 px-2 py-1 rounded mx-1">8</span>
                        </div>
                        <div className="text-center text-3xl font-bold text-purple-600 mt-4">
                            = 15
                        </div>
                        <p className="text-sm text-slate-500 text-center mt-4">
                            在损失函数中，我们用它来把所有数据点的误差加起来。
                        </p>
                    </div>
                  </div>
                </div>
              )}

              {mathTab === 'derivative' && (
                <div className="animate-fadeIn space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-red-500"/> 导数 (Derivative)
                  </h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                      <p className="text-yellow-800 font-bold">一句话直觉：导数 = 斜率 = 变化率</p>
                  </div>
                  <p className="text-slate-600">
                    想象你在山上（曲线）。导数告诉你现在的脚下有多**陡**，以及倾向于**往哪边滑**。
                  </p>

                  <div className="flex flex-col items-center mt-6">
                      <div className="relative w-full max-w-md h-64 border-b border-slate-300">
                          {/* Visualizing y = x^2 / 10. Derivative y' = x/5 */}
                          <svg viewBox="-50 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                              <path d="M -50 100 Q 0 0 50 100" fill="none" stroke="#94a3b8" strokeWidth="2" />
                              
                              {/* Tangent Line */}
                              {/* At x=derivX, y = x^2/25 (visual scale). slope = 2x/25. */}
                              {/* Let's keep visual logic simpler. Map -50..50 logical to SVG coords. */}
                              {/* Use visual approximation: Curve goes from (-50, 0) to (0, 100) to (50, 0) in SVG coords? No, let's implement a parabola path manually. */}
                              {/* Path: M -50 0 Q 0 100 50 0 is upside down parabola. */}
                              {/* Let's use standard y=x^2 visual. */}
                              <path d="M -40 -80 Q 0 80 40 -80" fill="none" stroke="#cbd5e1" strokeWidth="2" transform="scale(1, -1)"/> 
                              
                              {/* Re-draw cleaner curve using points */}
                              <path d="M -40 80 Q 0 0 40 80" fill="none" stroke="#64748b" strokeWidth="3" />
                              
                              {/* Current Point */}
                              <circle cx={derivX} cy={derivX * derivX * 0.05} r="3" fill="#ef4444" />
                              
                              {/* Tangent Line: y - y0 = m(x - x0) */}
                              {/* y = x^2 * 0.05 => y' = 0.1 * x */}
                              {/* We need to draw a line segment. */}
                              <line 
                                x1={derivX - 20} 
                                y1={(derivX * derivX * 0.05) - (0.1 * derivX * 20)} 
                                x2={derivX + 20} 
                                y2={(derivX * derivX * 0.05) + (0.1 * derivX * 20)}
                                stroke="#ef4444" 
                                strokeWidth="2"
                              />
                          </svg>
                          
                          {/* Overlay Explanation */}
                          <div className="absolute top-4 left-4 text-sm bg-white/90 p-2 rounded shadow">
                             <p>位置 x: {derivX}</p>
                             <p>导数 (斜率): <span className={Math.abs(derivX) < 2 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{(0.1 * derivX).toFixed(1)}</span></p>
                          </div>
                      </div>

                      <input 
                           type="range" min="-40" max="40" step="1"
                           value={derivX} onChange={e => setDerivX(parseFloat(e.target.value))}
                           className="w-full max-w-md mt-4 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                      <div className="flex justify-between w-full max-w-md text-xs text-slate-400 mt-1">
                          <span>左坡 (导数为负)</span>
                          <span>谷底 (导数为0)</span>
                          <span>右坡 (导数为正)</span>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                      <div className={`p-2 rounded ${derivX < -5 ? 'bg-red-100 font-bold text-red-800' : 'bg-slate-50 text-slate-400'}`}>
                          导数 &lt; 0 <br/> 📉 向下倾斜
                      </div>
                      <div className={`p-2 rounded ${Math.abs(derivX) <= 5 ? 'bg-green-100 font-bold text-green-800' : 'bg-slate-50 text-slate-400'}`}>
                          导数 ≈ 0 <br/> ✅ 到达底部
                      </div>
                      <div className={`p-2 rounded ${derivX > 5 ? 'bg-red-100 font-bold text-red-800' : 'bg-slate-50 text-slate-400'}`}>
                          导数 &gt; 0 <br/> 📈 向上倾斜
                      </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                      在梯度下降中，我们要做的就是：<strong>沿着导数反方向走</strong>，直到导数变为 0。
                  </p>
                </div>
              )}

              {mathTab === 'vector' && (
                <div className="animate-fadeIn space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="text-indigo-500"/> 向量 (Vector)
                  </h3>
                  <p className="text-slate-600">
                    在计算机里，数据通常是一组一组出现的。向量就是**有序的数字列表**。
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-2">1. 为什么需要向量？</h4>
                        <p className="text-sm text-slate-600 mb-2">
                            假设房子有 3 个特征：面积、房间数、楼层。
                        </p>
                        <div className="font-mono bg-white p-2 rounded border border-slate-200 text-sm">
                            x = [100, 3, 8]
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                            这样我们就可以用一个变量 $x$ 代表所有特征，写公式更简洁。
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded border border-slate-100">
                         <h4 className="font-bold text-slate-700 mb-2">2. 点积 (Dot Product)</h4>
                         <p className="text-sm text-slate-600 mb-2">
                             向量乘法的一种。把对应位置相乘，再求和。
                         </p>
                         <div className="space-y-1 font-mono text-sm">
                             <p>w = [2, 5] <span className="text-slate-400">(权重)</span></p>
                             <p>x = [3, 1] <span className="text-slate-400">(特征)</span></p>
                             <hr className="border-slate-300"/>
                             <p className="text-indigo-600 font-bold">w·x = (2*3) + (5*1) = 11</p>
                         </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case LessonId.HYPOTHESIS:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">3. 假设函数 (Hypothesis)</h2>
            <p className="text-lg text-slate-600">
              我们假设输入 $x$ 和输出 $y$ 之间存在线性关系。这就是我们的模型。
            </p>
            
            <div className="flex justify-center my-8">
              <div className="bg-orange-50 border-2 border-orange-200 p-8 rounded-2xl shadow-md text-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-5xl font-serif text-slate-800 italic">y = wx + b</span>
                <p className="mt-4 text-slate-500 text-sm">f(x) = weight * x + bias</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 p-6 rounded-xl hover:border-blue-400 hover:shadow-md transition-all">
                <h4 className="font-bold text-xl mb-3 text-blue-600">w (Weight) 权重/斜率</h4>
                <p className="text-slate-600 mb-2">
                    决定了直线的倾斜程度。
                </p>
                <div className="text-sm bg-slate-50 p-2 rounded text-slate-500">
                  <span className="font-bold">现实意义：</span>如果 w = 2，意味着面积每增加1平米，房价增加2万。
                </div>
              </div>
              <div className="border border-slate-200 p-6 rounded-xl hover:border-blue-400 hover:shadow-md transition-all">
                <h4 className="font-bold text-xl mb-3 text-blue-600">b (Bias) 偏置/截距</h4>
                <p className="text-slate-600 mb-2">
                  决定了直线与Y轴的交点。
                </p>
                <div className="text-sm bg-slate-50 p-2 rounded text-slate-500">
                  <span className="font-bold">现实意义：</span>如果 b = 10，意味着即使面积为0（地皮费），基础价格也是10万。
                </div>
              </div>
            </div>
          </div>
        );

      case LessonId.LOSS_FUNCTION:
        const demoLoss = calculateLoss(lossW, lossB, LOSS_LESSON_DATA);
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">4. 损失函数 (Loss Function)</h2>
            <p className="text-lg text-slate-600">
              机器怎么知道它画的线是“好”还是“坏”？我们需要一个指标来打分。
            </p>

            <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start gap-4">
              <div className="bg-red-100 p-2 rounded-full text-red-600 mt-1">
                 <Target size={24}/>
              </div>
              <div>
                <h3 className="font-bold text-red-800 mb-1 text-lg">目标：最小化误差</h3>
                <p className="text-red-700">
                    损失 (Loss) 越小，代表预测越准。我们的目标就是找到 w 和 b，让 Loss 接近 0。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-2">
                    <div className="bg-white p-4 border rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-bold text-slate-700">动手试试：调整红线，减小误差！</h4>
                             <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">数据点固定</span>
                        </div>
                        <RegressionVisualizer 
                            data={LOSS_LESSON_DATA} 
                            slope={lossW} 
                            intercept={lossB}
                            showResiduals={true}
                            interactive={false}
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-900 text-yellow-400 p-6 rounded-xl shadow-lg text-center">
                        <p className="text-sm text-slate-400 mb-1 uppercase tracking-wider">当前损失 (MSE)</p>
                        <span className="text-4xl font-mono font-bold">{demoLoss.toFixed(1)}</span>
                        <p className="text-xs text-slate-500 mt-2">Loss = ∑ (预测 - 真实)² / 2N</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <div>
                            <label className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                斜率 w: {lossW.toFixed(2)}
                            </label>
                            <input 
                                type="range" min="-1" max="2" step="0.1" 
                                value={lossW} 
                                onChange={(e) => setLossW(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div>
                            <label className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                截距 b: {lossB.toFixed(0)}
                            </label>
                            <input 
                                type="range" min="-20" max="80" step="5" 
                                value={lossB} 
                                onChange={(e) => setLossB(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <p className="text-xs text-slate-500 italic">
                            观察左图中的红色虚线（误差线）。你的目标是让所有红虚线变得最短。
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="text-center p-4 bg-white border rounded shadow-sm">
                    <p className="font-bold text-slate-800 text-lg mb-1">平方</p>
                    <p className="text-xs text-slate-500">让误差永远为正，且严惩大误差。</p>
                </div>
                <div className="text-center p-4 bg-white border rounded shadow-sm">
                    <p className="font-bold text-slate-800 text-lg mb-1">求和</p>
                    <p className="text-xs text-slate-500">把所有数据点的误差加起来。</p>
                </div>
                <div className="text-center p-4 bg-white border rounded shadow-sm">
                    <p className="font-bold text-slate-800 text-lg mb-1">平均</p>
                    <p className="text-xs text-slate-500">除以数量，保持数值规模合理。</p>
                </div>
            </div>
          </div>
        );

      case LessonId.GRADIENT_DESCENT:
        return (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">5. 梯度下降 (Gradient Descent)</h2>
            <p className="text-lg text-slate-600">
              有了损失函数，我们如何自动找到让 Loss 最小的 w 和 b 呢？我们使用<strong>梯度下降</strong>算法。
            </p>

            {/* Visual Aid for Gradient Descent */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <h3 className="text-xl font-bold mb-6 text-center text-slate-700">⛰️ 下山可视化：寻找最低点</h3>
                
                <div className="relative h-64 w-full flex justify-center items-end">
                    <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                        {/* The curve y = (x-200)^2 / 200 */}
                        <path d="M 0 0 Q 200 200 400 0" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                        <path d="M 0 0 Q 200 200 400 0" fill="url(#grad1)" opacity="0.1" />
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: 'rgb(255, 255, 255)', stopOpacity: 0}} />
                            </linearGradient>
                        </defs>
                        
                        {/* Axis Labels */}
                        <text x="200" y="220" textAnchor="middle" fill="#64748b" fontSize="12">权重 w</text>
                        <text x="-20" y="100" textAnchor="middle" fill="#64748b" fontSize="12" transform="rotate(-90 -20 100)">Loss (误差)</text>

                        {/* The Ball */}
                        <circle 
                            cx={50 + gdDemoStep * 15} 
                            cy={200 - Math.pow(((50 + gdDemoStep * 15) - 200)/14.2, 2) + (gdDemoStep > 10 ? 0 : 0)} 
                            r="12" 
                            fill="#ef4444" 
                            stroke="white" 
                            strokeWidth="2"
                            className="transition-all duration-500 ease-out"
                        />
                        
                        {/* Gradient Vector Arrow */}
                         <line 
                           x1={50 + gdDemoStep * 15} 
                           y1={200 - Math.pow(((50 + gdDemoStep * 15) - 200)/14.2, 2)} 
                           x2={(50 + gdDemoStep * 15) + 40} 
                           y2={(200 - Math.pow(((50 + gdDemoStep * 15) - 200)/14.2, 2)) + (gdDemoStep < 10 ? 20 : 0)}
                           stroke="#10b981" 
                           strokeWidth="3" 
                           markerEnd="url(#arrowhead)"
                           className={`transition-all duration-500 ${gdDemoStep >= 10 ? 'opacity-0' : 'opacity-100'}`}
                         />
                         <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                         </marker>
                    </svg>

                    <div className="absolute top-4 right-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm max-w-xs">
                       <p className="font-bold mb-1">当前状态:</p>
                       <p>Loss (高度): <span className={gdDemoStep > 8 ? "text-green-600 font-bold" : "text-slate-600"}>{gdDemoStep > 8 ? "极小 (谷底)" : "很大 (山腰)"}</span></p>
                       <p>导数 (斜率): <span className="text-slate-600">{gdDemoStep > 9 ? "0 (水平)" : "负数 (陡峭)"}</span></p>
                    </div>
                </div>

                <div className="flex justify-center mt-6 gap-4">
                    <button 
                        onClick={() => setGdDemoStep(0)} 
                        className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                    >
                        回到山顶
                    </button>
                    <button 
                        onClick={() => setGdDemoStep(prev => Math.min(prev + 1, 10))} 
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
                        disabled={gdDemoStep >= 10}
                    >
                        迈出一步 (迭代) <ArrowRight size={16}/>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-4">学习率 (Learning Rate)</h3>
                   <p className="text-slate-600 mb-4 leading-relaxed">
                     你可以把它想象成<strong>下山的步长</strong>。这是我们在训练前必须手动设置的“超参数”。
                   </p>
                   <div className="space-y-3">
                       <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex gap-2">
                          <span className="text-xl">🐌</span>
                          <div>
                              <span className="font-bold block">太小</span> 
                              像蚂蚁搬家，下山非常慢，电脑要算很久。
                          </div>
                       </div>
                       <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex gap-2">
                          <span className="text-xl">🚀</span>
                          <div>
                             <span className="font-bold block">太大</span> 
                             步子太大，一脚跨过谷底，甚至会反向冲上对面的山坡（发散）。
                          </div>
                       </div>
                       <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 flex gap-2">
                          <span className="text-xl">✅</span>
                          <div>
                             <span className="font-bold block">合适</span> 
                             稳步下降，既不太慢，也不会走偏。
                          </div>
                       </div>
                   </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">算法核心步骤</h3>
                    <ol className="relative border-l border-slate-200 ml-3 space-y-8">
                        <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full -left-4 ring-4 ring-white">1</span>
                            <h4 className="font-bold text-slate-900">随机初始化</h4>
                            <p className="text-sm text-slate-500">闭着眼睛在山上随机选一个位置 (w, b)。</p>
                        </li>
                        <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full -left-4 ring-4 ring-white">2</span>
                            <h4 className="font-bold text-slate-900">计算梯度 (找方向)</h4>
                            <p className="text-sm text-slate-500">看看脚下，哪个方向下坡最陡？（通过对 Loss 求导得到）</p>
                        </li>
                        <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full -left-4 ring-4 ring-white">3</span>
                            <h4 className="font-bold text-slate-900">更新参数 (迈步)</h4>
                            <p className="text-sm text-slate-500 font-mono bg-slate-100 inline-block px-2 py-1 rounded mt-1">w = w - 学习率 * 梯度</p>
                            <p className="text-sm text-slate-500 mt-1">朝下坡方向走一步。</p>
                        </li>
                         <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full -left-4 ring-4 ring-white">4</span>
                            <h4 className="font-bold text-slate-900">重复</h4>
                            <p className="text-sm text-slate-500">重复步骤 2 和 3，直到到达谷底。</p>
                        </li>
                    </ol>
                </div>
            </div>
          </div>
        );

      case LessonId.APPLICATIONS:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">6. 现实应用场景</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-slate-100">
                <div className="h-2 bg-green-500"></div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">📈 销售预测</h3>
                  <p className="text-slate-600 text-sm">
                    根据广告投入费用 ($x$)，预测产品未来的销量 ($y$)。帮助公司决定营销预算。
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-slate-100">
                <div className="h-2 bg-blue-500"></div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">🏠 房价评估</h3>
                  <p className="text-slate-600 text-sm">
                    经典的入门案例。根据面积、房龄、距离市中心的距离等特征，预测房屋市场价值。
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-slate-100">
                <div className="h-2 bg-purple-500"></div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">🏥 医疗风险</h3>
                  <p className="text-slate-600 text-sm">
                    根据病人的体重、血压、年龄等指标，预测患某种疾病的风险指数。
                  </p>
                </div>
              </div>

            </div>
            <p className="text-center text-slate-500 mt-8">
              虽然深度学习现在很火，但线性回归因为简单、可解释性强，在金融、经济学和统计学中依然是首选工具。
            </p>
          </div>
        );

      case LessonId.PLAYGROUND:
        return (
          <div className="space-y-6 animate-fadeIn pb-20">
             <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Zap className="text-yellow-500" fill="currentColor"/> 互动实验室
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        添加数据点，观察<strong>最优解 (绿色虚线)</strong>如何实时更新。
                    </p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={resetData}
                     className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                   >
                     <RefreshCw size={16}/> 重置
                   </button>
                   <button 
                     onClick={clearData}
                     className="flex items-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors"
                   >
                     <Trash2 size={16}/> 清空
                   </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visualizer Column */}
                <div className="lg:col-span-2 space-y-4">
                   <RegressionVisualizer 
                     data={dataPoints} 
                     slope={slope} 
                     intercept={intercept}
                     bestFitSlope={bestFit.slope}
                     bestFitIntercept={bestFit.intercept}
                     showResiduals={true}
                     interactive={true}
                     onPointClick={removePoint}
                   />
                   <div className="grid grid-cols-2 gap-4 text-sm">
                       <div className="bg-red-50 p-3 rounded border border-red-100">
                           <p className="font-bold text-red-800">当前模型 Loss (MSE):</p>
                           <p className="text-2xl font-mono text-red-600">{loss.toFixed(2)}</p>
                           <p className="text-xs text-red-400 mt-1">你想让这个数字越小越好</p>
                       </div>
                       <div className="bg-green-50 p-3 rounded border border-green-100 opacity-90 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-1">
                               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                           </div>
                           <p className="font-bold text-green-800">最小可能 Loss (最优解):</p>
                           <p className="text-2xl font-mono text-green-600">
                               {calculateLoss(bestFit.slope, bestFit.intercept, dataPoints).toFixed(2)}
                           </p>
                           <p className="text-xs text-green-600 mt-1 font-semibold">基于最小二乘法 (Least Squares) 实时计算</p>
                       </div>
                   </div>
                </div>

                {/* Controls Column */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 h-fit">
                   
                   {/* Add Data Section */}
                   <div className="space-y-3 border-b border-slate-100 pb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Plus size={18}/> 添加数据
                        </h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={addRandomPoint}
                                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded border border-blue-200 text-sm font-semibold transition-colors"
                            >
                                + 随机点
                            </button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="number" placeholder="X" value={newPointX}
                                onChange={e => setNewPointX(e.target.value)}
                                className="w-16 border rounded px-2 py-1 text-sm"
                            />
                            <input 
                                type="number" placeholder="Y" value={newPointY}
                                onChange={e => setNewPointY(e.target.value)}
                                className="w-16 border rounded px-2 py-1 text-sm"
                            />
                            <button 
                                onClick={addManualPoint}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded text-sm font-medium"
                            >
                                添加
                            </button>
                        </div>
                        <p className="text-xs text-slate-400">提示：点击图表中的点可以删除它。</p>
                   </div>

                   {/* Manual Controls */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                          <MousePointerClick size={18}/> 手动调参
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <label className="font-medium text-slate-700">Slope (斜率 w): {slope.toFixed(2)}</label>
                        </div>
                        <input 
                          type="range" min="-2" max="3" step="0.01" 
                          value={slope} 
                          onChange={(e) => { setSlope(parseFloat(e.target.value)); setIsTraining(false); }}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <label className="font-medium text-slate-700">Intercept (截距 b): {intercept.toFixed(2)}</label>
                        </div>
                        <input 
                          type="range" min="-20" max="100" step="1" 
                          value={intercept} 
                          onChange={(e) => { setIntercept(parseFloat(e.target.value)); setIsTraining(false); }}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>
                   </div>

                   {/* Auto Training */}
                   <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
                          <Brain size={18}/> 自动训练 (梯度下降)
                      </div>
                      
                      <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase">学习率 (Learning Rate)</label>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>慢</span>
                              <span>快</span>
                          </div>
                          <input 
                            type="range" min="0.00001" max="0.0005" step="0.00001" 
                            value={learningRate} 
                            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                      </div>

                      <button
                        onClick={() => setIsTraining(!isTraining)}
                        className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                          isTraining 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isTraining ? (
                          <><Pause size={18} fill="currentColor"/> 暂停训练</>
                        ) : (
                          <><Play size={18} fill="currentColor"/> 开始梯度下降</>
                        )}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu size={24}/>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col shadow-xl md:shadow-none
      `}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
             <TrendingUp size={28} />
             <h1 className="text-xl font-bold tracking-tight">Linear Regression<br/><span className="text-sm font-normal text-slate-500">Master Class</span></h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {LESSONS.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => { setActiveLesson(lesson.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-all ${
                activeLesson === lesson.id 
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-sm truncate">{lesson.title}</span>
              {activeLesson === lesson.id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
           <p className="text-xs text-slate-400 text-center">Powered by Gemini & React</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 pb-32">
           {renderContent()}

           {/* Next Lesson Navigation Footer */}
           {activeLesson !== LessonId.PLAYGROUND && (
             <div className="mt-16 pt-8 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => {
                    const currentIndex = LESSONS.findIndex(l => l.id === activeLesson);
                    if (currentIndex < LESSONS.length - 1) {
                      setActiveLesson(LESSONS[currentIndex + 1].id);
                      window.scrollTo(0,0);
                    }
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-blue-200"
                >
                  下一章 <ArrowRight size={20}/>
                </button>
             </div>
           )}
        </div>
      </main>

      {/* AI Tutor Integration */}
      <AITutor />
    </div>
  );
};

export default App;