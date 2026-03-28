import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

interface WellParams {
  depth: string;
  mudWeight: string;
  kickMudWeight: string;
  sipWDP: string;
  casingPressure: string;
  pitGain: string;
  stringVolume: string;
  annularVolume: string;
  pumpOutput: string;
  slowPumpRate: string;
  formationPressure: string;
  casingID: string;
  drillpipeOD: string;
  openHoleID: string;
  mudViscosity: string;
  yieldPoint: string;
  mudDensity: string;
}

interface CalcResults {
  fcp: number | null;
  icp: number | null;
  killMudWeight: number | null;
  maxAllowableMudWeight: number | null;
  bottomholePressure: number | null;
  formationIntegrityPressure: number | null;
  annularPressureLoss: number | null;
  ecd: number | null;
  strokesToSurface: number | null;
  strokesDrillpipe: number | null;
  strokesAnnulus: number | null;
  leakOffPressure: number | null;
  maxSurfacePressure: number | null;
}

const METRIC = {
  pressure: "бар",
  depth: "м",
  density: "кг/л",
  volume: "л",
  flow: "л/ход",
  viscosity: "сПз",
  yp: "Па",
};

const initialParams: WellParams = {
  depth: "",
  mudWeight: "",
  kickMudWeight: "",
  sipWDP: "",
  casingPressure: "",
  pitGain: "",
  stringVolume: "",
  annularVolume: "",
  pumpOutput: "",
  slowPumpRate: "",
  formationPressure: "",
  casingID: "",
  drillpipeOD: "",
  openHoleID: "",
  mudViscosity: "",
  yieldPoint: "",
  mudDensity: "",
};

function calcResults(p: WellParams): CalcResults {
  const n = (v: string) => parseFloat(v) || 0;
  const depth = n(p.depth);
  const mudWeight = n(p.mudWeight);
  const sipWDP = n(p.sipWDP);
  const pumpOutput = n(p.pumpOutput);
  const stringVolume = n(p.stringVolume);
  const annularVolume = n(p.annularVolume);
  const casingID = n(p.casingID);
  const drillpipeOD = n(p.drillpipeOD);
  const openHoleID = n(p.openHoleID);
  const yieldPoint = n(p.yieldPoint);
  const mudViscosity = n(p.mudViscosity);

  const valid = (v: number) => !isNaN(v) && isFinite(v) && v > 0;

  const killMudWeight = valid(sipWDP) && valid(depth) && valid(mudWeight)
    ? mudWeight + (sipWDP / (0.0981 * depth))
    : null;

  const icp = valid(sipWDP) && valid(n(p.slowPumpRate))
    ? sipWDP + n(p.slowPumpRate)
    : null;

  const fcp = valid(n(p.slowPumpRate)) && killMudWeight && valid(mudWeight)
    ? (n(p.slowPumpRate) * killMudWeight) / mudWeight
    : null;

  const bottomholePressure = valid(depth) && valid(mudWeight)
    ? mudWeight * 0.0981 * depth
    : null;

  const formationPressure = n(p.formationPressure) || (valid(sipWDP) && bottomholePressure
    ? bottomholePressure + sipWDP
    : null);

  const maxAllowableMudWeight = valid(n(p.casingPressure)) && valid(depth)
    ? mudWeight + (n(p.casingPressure) / (0.0981 * depth))
    : null;

  const strokesToSurface = valid(pumpOutput) && valid(stringVolume + annularVolume)
    ? Math.ceil((stringVolume + annularVolume) / pumpOutput)
    : null;

  const strokesDrillpipe = valid(pumpOutput) && valid(stringVolume)
    ? Math.ceil(stringVolume / pumpOutput)
    : null;

  const strokesAnnulus = valid(pumpOutput) && valid(annularVolume)
    ? Math.ceil(annularVolume / pumpOutput)
    : null;

  const annularPressureLoss = valid(casingID) && valid(drillpipeOD) && valid(depth) && valid(mudWeight) && valid(yieldPoint)
    ? ((48 * yieldPoint) / (casingID - drillpipeOD)) * depth / 1000
    : null;

  const ecd = annularPressureLoss && valid(depth) && valid(mudWeight)
    ? mudWeight + (annularPressureLoss / (0.0981 * depth))
    : null;

  const leakOffPressure = maxAllowableMudWeight && valid(depth)
    ? maxAllowableMudWeight * 0.0981 * depth
    : null;

  const maxSurfacePressure = maxAllowableMudWeight && killMudWeight && valid(depth)
    ? (maxAllowableMudWeight - (killMudWeight || mudWeight)) * 0.0981 * depth
    : null;

  return {
    killMudWeight, icp, fcp, bottomholePressure,
    annularPressureLoss, ecd, strokesToSurface,
    strokesDrillpipe, strokesAnnulus,
    maxAllowableMudWeight, leakOffPressure, maxSurfacePressure,
  };
}

const FieldGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <p className="section-title">{title}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

const Field = ({
  label, value, onChange, unit, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; placeholder?: string;
}) => (
  <div className="flex items-center gap-2">
    <label className="label-text w-52 shrink-0 text-xs leading-tight">{label}</label>
    <div className="flex-1 flex items-center gap-1">
      <input
        className="inp text-xs py-1.5 flex-1"
        type="number"
        step="any"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "0.00"}
      />
      {unit && <span className="tag-cyan text-[10px] w-12 justify-center shrink-0">{unit}</span>}
    </div>
  </div>
);

const ResultRow = ({
  label, value, unit, color = "cyan",
}: {
  label: string; value: number | null; unit?: string; color?: "cyan" | "amber" | "green" | "red";
}) => {
  const colorClass = {
    cyan: "text-[hsl(var(--iwcf-cyan))]",
    amber: "text-[hsl(var(--iwcf-amber))]",
    green: "text-[hsl(var(--iwcf-green))]",
    red: "text-[hsl(var(--iwcf-red))]",
  }[color];

  return (
    <div className="data-row">
      <span className="label-text text-xs">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-mono font-bold text-sm tabular-nums ${colorClass}`}>
          {value !== null ? value.toFixed(2) : "—"}
        </span>
        {unit && <span className="tag-cyan text-[10px]">{unit}</span>}
      </div>
    </div>
  );
};

export default function Calculator() {
  const [params, setParams] = useState<WellParams>(initialParams);
  const [calculated, setCalculated] = useState(false);
  const [results, setResults] = useState<CalcResults | null>(null);

  const set = useCallback((key: keyof WellParams) => (v: string) => {
    setParams(prev => ({ ...prev, [key]: v }));
    setCalculated(false);
  }, []);

  const handleCalc = () => {
    setResults(calcResults(params));
    setCalculated(true);
  };

  const handleReset = () => {
    setParams(initialParams);
    setResults(null);
    setCalculated(false);
  };

  return (
    <div className="flex gap-4 h-full animate-fade-in">
      <div className="w-[420px] shrink-0 flex flex-col gap-0 overflow-y-auto scrollbar-thin pr-1">
        <div className="panel mb-3">
          <div className="panel-header">
            <Icon name="Settings2" size={15} className="text-[hsl(var(--iwcf-cyan))]" />
            <span className="text-sm font-semibold">Параметры скважины</span>
            <span className="ml-auto tag-cyan">Метрическая СИ</span>
          </div>
          <div className="p-4">
            <FieldGroup title="Геометрия ствола">
              <Field label="Глубина скважины (TVD)" value={params.depth} onChange={set("depth")} unit={METRIC.depth} />
              <Field label="Внутр. диаметр обсадной (ID)" value={params.casingID} onChange={set("casingID")} unit="мм" />
              <Field label="Наруж. диаметр бурильных (OD)" value={params.drillpipeOD} onChange={set("drillpipeOD")} unit="мм" />
              <Field label="Диаметр открытого ствола" value={params.openHoleID} onChange={set("openHoleID")} unit="мм" />
            </FieldGroup>

            <FieldGroup title="Параметры бурового раствора">
              <Field label="Плотность р-ра (MW)" value={params.mudWeight} onChange={set("mudWeight")} unit={METRIC.density} />
              <Field label="Плотность р-ра флюида притока" value={params.kickMudWeight} onChange={set("kickMudWeight")} unit={METRIC.density} />
              <Field label="Вязкость (пластическая)" value={params.mudViscosity} onChange={set("mudViscosity")} unit={METRIC.viscosity} />
              <Field label="ДНС (динамическое напряжение)" value={params.yieldPoint} onChange={set("yieldPoint")} unit={METRIC.yp} />
            </FieldGroup>

            <FieldGroup title="Давления">
              <Field label="СИДТ (SIDPP) — на бур. трубах" value={params.sipWDP} onChange={set("sipWDP")} unit={METRIC.pressure} />
              <Field label="СИДО (SICP) — на обсадной" value={params.casingPressure} onChange={set("casingPressure")} unit={METRIC.pressure} />
              <Field label="Давление пласта (Pпл)" value={params.formationPressure} onChange={set("formationPressure")} unit={METRIC.pressure} />
              <Field label="Медленная прокачка (SCR)" value={params.slowPumpRate} onChange={set("slowPumpRate")} unit={METRIC.pressure} />
            </FieldGroup>

            <FieldGroup title="Объёмы и насос">
              <Field label="Объём бурильной колонны" value={params.stringVolume} onChange={set("stringVolume")} unit={METRIC.volume} />
              <Field label="Объём затрубного пространства" value={params.annularVolume} onChange={set("annularVolume")} unit={METRIC.volume} />
              <Field label="Выход насоса (Q)" value={params.pumpOutput} onChange={set("pumpOutput")} unit={METRIC.flow} />
              <Field label="Прирост объёма приёмных ям" value={params.pitGain} onChange={set("pitGain")} unit={METRIC.volume} />
            </FieldGroup>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleCalc}>
              <Icon name="Calculator" size={15} />
              Рассчитать
            </button>
            <button className="btn-secondary px-3" onClick={handleReset} title="Сбросить">
              <Icon name="RotateCcw" size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!calculated ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <Icon name="FlaskConical" size={28} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/60">Введите параметры скважины</p>
              <p className="text-xs mt-1">и нажмите «Рассчитать» для получения результатов</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="panel">
              <div className="panel-header">
                <Icon name="Target" size={15} className="text-[hsl(var(--iwcf-green))]" />
                <span className="text-sm font-semibold">Глушение скважины (Kill Well)</span>
              </div>
              <div className="p-3 space-y-2">
                <ResultRow label="Плотность р-ра глушения (KMW)" value={results?.killMudWeight ?? null} unit={METRIC.density} color="green" />
                <ResultRow label="Начальное давление глушения (ICP)" value={results?.icp ?? null} unit={METRIC.pressure} color="amber" />
                <ResultRow label="Конечное давление глушения (FCP)" value={results?.fcp ?? null} unit={METRIC.pressure} color="cyan" />
                <ResultRow label="Макс. допуст. плотность р-ра (MAMW)" value={results?.maxAllowableMudWeight ?? null} unit={METRIC.density} color="red" />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <Icon name="Gauge" size={15} className="text-[hsl(var(--iwcf-cyan))]" />
                <span className="text-sm font-semibold">Давления в скважине</span>
              </div>
              <div className="p-3 space-y-2">
                <ResultRow label="Забойное давление (BHP)" value={results?.bottomholePressure ?? null} unit={METRIC.pressure} />
                <ResultRow label="Давление целостности пласта (FIP)" value={results?.leakOffPressure ?? null} unit={METRIC.pressure} color="amber" />
                <ResultRow label="Потери давления в затрубе (APL)" value={results?.annularPressureLoss ?? null} unit={METRIC.pressure} />
                <ResultRow label="Эквивалентная плотность циркуляции (ECD)" value={results?.ecd ?? null} unit={METRIC.density} color="amber" />
                <ResultRow label="Макс. допустимое устьевое давление (MAASP)" value={results?.maxSurfacePressure ?? null} unit={METRIC.pressure} color="red" />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <Icon name="Activity" size={15} className="text-[hsl(var(--iwcf-amber))]" />
                <span className="text-sm font-semibold">Ходы насоса</span>
              </div>
              <div className="p-3 space-y-2">
                <ResultRow label="Ходы до долота (по колонне)" value={results?.strokesDrillpipe ?? null} unit="ходов" color="amber" />
                <ResultRow label="Ходы по затрубу (до устья)" value={results?.strokesAnnulus ?? null} unit="ходов" color="amber" />
                <ResultRow label="Полный цикл (ходы)" value={results?.strokesToSurface ?? null} unit="ходов" color="cyan" />
              </div>
            </div>

            <div className="panel border-[hsl(var(--iwcf-amber)/0.4)]">
              <div className="panel-header">
                <Icon name="BookOpen" size={15} className="text-[hsl(var(--iwcf-amber))]" />
                <span className="text-sm font-semibold">Применённые формулы IWCF</span>
              </div>
              <div className="p-3 space-y-3">
                {[
                  { f: "KMW = MW + (SIDPP / (0.0981 × TVD))", d: "Плотность р-ра глушения" },
                  { f: "ICP = SIDPP + SCR", d: "Начальное давление глушения" },
                  { f: "FCP = SCR × (KMW / MW)", d: "Конечное давление глушения" },
                  { f: "BHP = MW × 0.0981 × TVD", d: "Забойное давление" },
                  { f: "ECD = MW + APL / (0.0981 × TVD)", d: "Эквив. плотность цирк." },
                  { f: "MAASP = (MAMW − KMW) × 0.0981 × TVD", d: "Макс. уст. давление" },
                ].map(({ f, d }) => (
                  <div key={f} className="rounded bg-muted/30 px-3 py-2">
                    <p className="font-mono text-xs text-[hsl(var(--iwcf-cyan))]">{f}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}