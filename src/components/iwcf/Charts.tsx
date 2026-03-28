import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

interface ChartParams {
  depth: string;
  mudWeight: string;
  killMudWeight: string;
  poreGradient: string;
  fractureGradient: string;
  geothermGradient: string;
  surfaceTemp: string;
  icp: string;
  fcp: string;
  totalStrokes: string;
}

const initial: ChartParams = {
  depth: "3000",
  mudWeight: "1.25",
  killMudWeight: "1.35",
  poreGradient: "0.104",
  fractureGradient: "0.180",
  geothermGradient: "0.025",
  surfaceTemp: "20",
  icp: "200",
  fcp: "150",
  totalStrokes: "500",
};

const SVGChart = ({
  width, height, children, viewBox,
}: {
  width?: number | string; height?: number | string; children: React.ReactNode; viewBox?: string;
}) => (
  <svg
    width={width || "100%"}
    height={height || "100%"}
    viewBox={viewBox || "0 0 600 400"}
    className="w-full"
    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
  >
    {children}
  </svg>
);

export default function Charts() {
  const [params, setParams] = useState<ChartParams>(initial);
  const [activeChart, setActiveChart] = useState<"pressure" | "temperature" | "killschedule">("pressure");

  const set = (key: keyof ChartParams) => (v: string) =>
    setParams(prev => ({ ...prev, [key]: v }));

  const n = (v: string) => parseFloat(v) || 0;

  const pressureData = useMemo(() => {
    const depth = n(params.depth);
    const mw = n(params.mudWeight);
    const kmw = n(params.killMudWeight);
    const poreGrad = n(params.poreGradient);
    const fracGrad = n(params.fractureGradient);
    const points = 20;

    return Array.from({ length: points + 1 }, (_, i) => {
      const d = (depth / points) * i;
      return {
        depth: d,
        hydrostatic: mw * 0.0981 * d,
        killHydrostatic: kmw * 0.0981 * d,
        pore: poreGrad * d,
        fracture: fracGrad * d,
      };
    });
  }, [params]);

  const tempData = useMemo(() => {
    const depth = n(params.depth);
    const geotherm = n(params.geothermGradient);
    const surfTemp = n(params.surfaceTemp);
    const points = 20;

    return Array.from({ length: points + 1 }, (_, i) => {
      const d = (depth / points) * i;
      return {
        depth: d,
        temp: surfTemp + geotherm * d,
      };
    });
  }, [params]);

  const killScheduleData = useMemo(() => {
    const icp = n(params.icp);
    const fcp = n(params.fcp);
    const strokes = n(params.totalStrokes);
    const dpStrokes = Math.round(strokes * 0.4);
    const annStrokes = strokes - dpStrokes;

    return Array.from({ length: 11 }, (_, i) => {
      const pct = i / 10;
      const stroke = Math.round(pct * dpStrokes);
      const pressure = icp - (icp - fcp) * pct;
      return { stroke, pressure, pct: Math.round(pct * 100) };
    }).concat(
      Array.from({ length: 6 }, (_, i) => {
        const pct = i / 5;
        const stroke = dpStrokes + Math.round(pct * annStrokes);
        return { stroke, pressure: fcp, pct: 100 };
      })
    );
  }, [params]);

  const maxPressure = useMemo(() => {
    return Math.max(...pressureData.map(d => d.fracture)) * 1.1;
  }, [pressureData]);

  const maxDepth = n(params.depth) || 3000;
  const maxTemp = Math.max(...tempData.map(d => d.temp)) * 1.1;
  const maxStroke = n(params.totalStrokes) || 500;
  const maxICP = n(params.icp) * 1.2;

  const W = 560;
  const H = 320;
  const padL = 55;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const px = (p: number) => padL + (p / maxPressure) * chartW;
  const py = (d: number) => padT + (d / maxDepth) * chartH;
  const tx = (t: number) => padL + (t / (maxTemp || 100)) * chartW;
  const kx = (s: number) => padL + (s / maxStroke) * chartW;
  const ky = (p: number) => padT + chartH - (p / (maxICP || 300)) * chartH;

  const pathFrom = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const yAxisLabels = (count: number, max: number, fmt = (v: number) => v.toFixed(0)) =>
    Array.from({ length: count + 1 }, (_, i) => ({
      value: (max / count) * i,
      y: padT + chartH - (i / count) * chartH,
      label: fmt((max / count) * i),
    }));

  const xAxisLabels = (count: number, max: number, fmt = (v: number) => v.toFixed(0)) =>
    Array.from({ length: count + 1 }, (_, i) => ({
      value: (max / count) * i,
      x: padL + (i / count) * chartW,
      label: fmt((max / count) * i),
    }));

  const COLORS = {
    hydrostatic: "#22d3ee",
    kill: "#4ade80",
    pore: "#fb923c",
    fracture: "#f87171",
    temp: "#f59e0b",
    schedule: "#22d3ee",
    grid: "#1e2a38",
    axis: "#64748b",
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="BarChart2" size={16} className="text-[hsl(var(--iwcf-cyan))]" />
            Графики и диаграммы
          </h2>
          <p className="text-xs text-muted-foreground">Визуализация параметров скважины в реальном времени</p>
        </div>
        <div className="flex gap-1 bg-muted/30 rounded p-0.5">
          {(["pressure", "temperature", "killschedule"] as const).map(c => (
            <button
              key={c}
              onClick={() => setActiveChart(c)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                activeChart === c ? "bg-[hsl(var(--iwcf-cyan))] text-[hsl(210,20%,6%)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "pressure" ? "Давление" : c === "temperature" ? "Температура" : "График глушения"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-64 shrink-0 overflow-y-auto scrollbar-thin space-y-3">
          <div className="panel p-3">
            <p className="section-title">Параметры скважины</p>
            <div className="space-y-2">
              {[
                { label: "Глубина TVD (м)", key: "depth" as const },
                { label: "Плотность р-ра (кг/л)", key: "mudWeight" as const },
                { label: "Плотность глушения (кг/л)", key: "killMudWeight" as const },
                { label: "Поровый градиент (бар/м)", key: "poreGradient" as const },
                { label: "Градиент гидроразрыва (бар/м)", key: "fractureGradient" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="label-text text-[10px] block mb-0.5">{label}</label>
                  <input className="inp text-xs py-1" type="number" step="any" value={params[key]} onChange={e => set(key)(e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-3">
            <p className="section-title">Температура</p>
            <div className="space-y-2">
              {[
                { label: "Поверхн. температура (°C)", key: "surfaceTemp" as const },
                { label: "Геотерм. градиент (°C/м)", key: "geothermGradient" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="label-text text-[10px] block mb-0.5">{label}</label>
                  <input className="inp text-xs py-1" type="number" step="any" value={params[key]} onChange={e => set(key)(e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-3">
            <p className="section-title">График глушения</p>
            <div className="space-y-2">
              {[
                { label: "ICP (бар)", key: "icp" as const },
                { label: "FCP (бар)", key: "fcp" as const },
                { label: "Ходы насоса (total)", key: "totalStrokes" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="label-text text-[10px] block mb-0.5">{label}</label>
                  <input className="inp text-xs py-1" type="number" step="any" value={params[key]} onChange={e => set(key)(e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 panel overflow-hidden flex flex-col">
          <div className="panel-header">
            <Icon name="TrendingDown" size={14} className="text-[hsl(var(--iwcf-cyan))]" />
            <span className="text-sm font-semibold">
              {activeChart === "pressure" ? "График давления по глубине" :
               activeChart === "temperature" ? "Температурный профиль скважины" :
               "График снижения давления при глушении (Kill Schedule)"}
            </span>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {activeChart === "pressure" && (
              <>
                <div className="flex gap-4 mb-3">
                  {[
                    { color: COLORS.hydrostatic, label: "Гидростат. давление (MW)" },
                    { color: COLORS.kill, label: "Давление глушения (KMW)" },
                    { color: COLORS.pore, label: "Поровое давление" },
                    { color: COLORS.fracture, label: "Давление гидроразрыва" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-6 h-0.5 rounded" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
                <SVGChart viewBox={`0 0 ${W} ${H}`}>
                  <defs>
                    <pattern id="grid-p" width="40" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 32" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect x={padL} y={padT} width={chartW} height={chartH} fill="url(#grid-p)" />
                  <rect x={padL} y={padT} width={chartW} height={chartH} fill="none" stroke={COLORS.axis} strokeWidth="1" />

                  {xAxisLabels(6, maxPressure, v => v.toFixed(0)).map(({ x, label }) => (
                    <g key={label}>
                      <line x1={x} y1={padT} x2={x} y2={padT + chartH} stroke={COLORS.grid} strokeWidth="0.8" />
                      <text x={x} y={padT + chartH + 14} textAnchor="middle" fill={COLORS.axis} fontSize="9">{label}</text>
                    </g>
                  ))}
                  {Array.from({ length: 6 }, (_, i) => {
                    const d = (maxDepth / 5) * i;
                    return (
                      <g key={d}>
                        <text x={padL - 4} y={py(d) + 3} textAnchor="end" fill={COLORS.axis} fontSize="9">{d.toFixed(0)}</text>
                      </g>
                    );
                  })}
                  <text x={W / 2} y={H - 2} textAnchor="middle" fill={COLORS.axis} fontSize="9">Давление (бар)</text>
                  <text x={10} y={padT + chartH / 2} textAnchor="middle" fill={COLORS.axis} fontSize="9" transform={`rotate(-90,10,${padT + chartH / 2})`}>Глубина (м)</text>

                  <path d={pathFrom(pressureData.map(d => ({ x: px(d.pore), y: py(d.depth) })))} fill="none" stroke={COLORS.pore} strokeWidth="1.5" strokeDasharray="5,3" />
                  <path d={pathFrom(pressureData.map(d => ({ x: px(d.fracture), y: py(d.depth) })))} fill="none" stroke={COLORS.fracture} strokeWidth="1.5" strokeDasharray="5,3" />
                  <path d={pathFrom(pressureData.map(d => ({ x: px(d.hydrostatic), y: py(d.depth) })))} fill="none" stroke={COLORS.hydrostatic} strokeWidth="2" />
                  <path d={pathFrom(pressureData.map(d => ({ x: px(d.killHydrostatic), y: py(d.depth) })))} fill="none" stroke={COLORS.kill} strokeWidth="2" />
                </SVGChart>
              </>
            )}

            {activeChart === "temperature" && (
              <>
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 rounded" style={{ backgroundColor: COLORS.temp }} />
                    <span className="text-[10px] text-muted-foreground">Температура пласта (°C)</span>
                  </div>
                </div>
                <SVGChart viewBox={`0 0 ${W} ${H}`}>
                  <defs>
                    <pattern id="grid-t" width="40" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 32" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
                    </pattern>
                    <linearGradient id="tempGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor={COLORS.temp} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={COLORS.temp} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <rect x={padL} y={padT} width={chartW} height={chartH} fill="url(#grid-t)" />
                  <rect x={padL} y={padT} width={chartW} height={chartH} fill="none" stroke={COLORS.axis} strokeWidth="1" />

                  {xAxisLabels(5, maxTemp || 100, v => v.toFixed(0)).map(({ x, label }) => (
                    <g key={label}>
                      <line x1={x} y1={padT} x2={x} y2={padT + chartH} stroke={COLORS.grid} strokeWidth="0.8" />
                      <text x={x} y={padT + chartH + 14} textAnchor="middle" fill={COLORS.axis} fontSize="9">{label}</text>
                    </g>
                  ))}
                  {Array.from({ length: 6 }, (_, i) => {
                    const d = (maxDepth / 5) * i;
                    return (
                      <text key={d} x={padL - 4} y={py(d) + 3} textAnchor="end" fill={COLORS.axis} fontSize="9">{d.toFixed(0)}</text>
                    );
                  })}
                  <text x={W / 2} y={H - 2} textAnchor="middle" fill={COLORS.axis} fontSize="9">Температура (°C)</text>
                  <text x={10} y={padT + chartH / 2} textAnchor="middle" fill={COLORS.axis} fontSize="9" transform={`rotate(-90,10,${padT + chartH / 2})`}>Глубина (м)</text>

                  <path
                    d={pathFrom(tempData.map(d => ({ x: tx(d.temp), y: py(d.depth) }))) + ` L${padL},${padT + chartH} Z`}
                    fill="url(#tempGrad)"
                  />
                  <path d={pathFrom(tempData.map(d => ({ x: tx(d.temp), y: py(d.depth) })))} fill="none" stroke={COLORS.temp} strokeWidth="2" />

                  {tempData.filter((_, i) => i % 4 === 0).map((d, i) => (
                    <g key={i}>
                      <circle cx={tx(d.temp)} cy={py(d.depth)} r="3" fill={COLORS.temp} />
                      <text x={tx(d.temp) + 6} y={py(d.depth) + 3} fill={COLORS.temp} fontSize="8">{d.temp.toFixed(1)}°C</text>
                    </g>
                  ))}
                </SVGChart>
              </>
            )}

            {activeChart === "killschedule" && (
              <>
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 rounded" style={{ backgroundColor: COLORS.schedule }} />
                    <span className="text-[10px] text-muted-foreground">График снижения давления (инженерный метод)</span>
                  </div>
                </div>
                <SVGChart viewBox={`0 0 ${W} ${H}`}>
                  <defs>
                    <pattern id="grid-k" width="40" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 32" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
                    </pattern>
                    <linearGradient id="killGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.schedule} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={COLORS.schedule} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <rect x={padL} y={padT} width={chartW} height={chartH} fill="url(#grid-k)" />
                  <rect x={padL} y={padT} width={chartW} height={chartH} fill="none" stroke={COLORS.axis} strokeWidth="1" />

                  {xAxisLabels(5, maxStroke, v => v.toFixed(0)).map(({ x, label }) => (
                    <g key={label}>
                      <line x1={x} y1={padT} x2={x} y2={padT + chartH} stroke={COLORS.grid} strokeWidth="0.8" />
                      <text x={x} y={padT + chartH + 14} textAnchor="middle" fill={COLORS.axis} fontSize="9">{label}</text>
                    </g>
                  ))}
                  {yAxisLabels(5, maxICP || 300, v => v.toFixed(0)).map(({ y, label }) => (
                    <g key={label}>
                      <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke={COLORS.grid} strokeWidth="0.8" />
                      <text x={padL - 4} y={y + 3} textAnchor="end" fill={COLORS.axis} fontSize="9">{label}</text>
                    </g>
                  ))}
                  <text x={W / 2} y={H - 2} textAnchor="middle" fill={COLORS.axis} fontSize="9">Ходы насоса (stroke)</text>
                  <text x={10} y={padT + chartH / 2} textAnchor="middle" fill={COLORS.axis} fontSize="9" transform={`rotate(-90,10,${padT + chartH / 2})`}>Давление (бар)</text>

                  <path
                    d={pathFrom(killScheduleData.map(d => ({ x: kx(d.stroke), y: ky(d.pressure) }))) + ` L${kx(killScheduleData[killScheduleData.length - 1].stroke)},${padT + chartH} L${padL},${padT + chartH} Z`}
                    fill="url(#killGrad)"
                  />
                  <path d={pathFrom(killScheduleData.map(d => ({ x: kx(d.stroke), y: ky(d.pressure) })))} fill="none" stroke={COLORS.schedule} strokeWidth="2.5" />

                  {killScheduleData.filter((_, i) => i % 3 === 0).map((d, i) => (
                    <circle key={i} cx={kx(d.stroke)} cy={ky(d.pressure)} r="3" fill={COLORS.schedule} />
                  ))}

                  <line x1={kx(Math.round(n(params.totalStrokes) * 0.4))} y1={padT} x2={kx(Math.round(n(params.totalStrokes) * 0.4))} y2={padT + chartH} stroke="#4ade80" strokeWidth="1" strokeDasharray="4,3" />
                  <text x={kx(Math.round(n(params.totalStrokes) * 0.4)) + 4} y={padT + 14} fill="#4ade80" fontSize="8">До долота</text>
                </SVGChart>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
