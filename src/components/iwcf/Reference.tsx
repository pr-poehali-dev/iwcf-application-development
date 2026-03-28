import { useState } from "react";
import Icon from "@/components/ui/icon";

const TABS = [
  { id: "constants", label: "Константы", icon: "Hash" },
  { id: "formulas", label: "Формулы IWCF", icon: "BookOpen" },
  { id: "fluids", label: "Флюиды", icon: "Droplets" },
  { id: "grades", label: "Марки труб", icon: "Layers" },
  { id: "conversion", label: "Конвертер", icon: "ArrowLeftRight" },
];

const constants = [
  { name: "g (ускорение свободного падения)", value: "9.81", unit: "м/с²", category: "Физика" },
  { name: "Коэффициент давления (метрика)", value: "0.0981", unit: "бар/(кг/л·м)", category: "Бурение" },
  { name: "Плотность воды (стандарт)", value: "1.000", unit: "кг/л", category: "Флюиды" },
  { name: "Плотность морской воды", value: "1.025", unit: "кг/л", category: "Флюиды" },
  { name: "Плотность нефти (типичная)", value: "0.80–0.87", unit: "кг/л", category: "Флюиды" },
  { name: "Плотность газа (метан, НУ)", value: "0.000717", unit: "кг/л", category: "Флюиды" },
  { name: "Геотермический градиент (типовой)", value: "0.025–0.030", unit: "°C/м", category: "Геология" },
  { name: "Гидростатический градиент (вода)", value: "0.0981", unit: "бар/м", category: "Давление" },
  { name: "Гидростатический градиент (нефть)", value: "0.083", unit: "бар/м", category: "Давление" },
  { name: "Гидростатический градиент (рассол)", value: "0.105", unit: "бар/м", category: "Давление" },
  { name: "Нормальный поровый градиент", value: "0.104", unit: "бар/м", category: "Давление" },
  { name: "Переход бар → кПа", value: "100", unit: "кПа/бар", category: "Конвертация" },
  { name: "Переход бар → psi", value: "14.504", unit: "psi/бар", category: "Конвертация" },
  { name: "Переход м → фут", value: "3.2808", unit: "фут/м", category: "Конвертация" },
  { name: "Переход кг/л → ppg", value: "8.345", unit: "ppg/(кг/л)", category: "Конвертация" },
];

const formulas = [
  {
    category: "Глушение (Well Kill)",
    items: [
      {
        name: "Плотность раствора глушения (KMW)",
        formula: "KMW = MW + SIDPP / (0.0981 × TVD)",
        description: "Минимальная плотность для создания гидростатического давления, равного пластовому",
        vars: "MW — плотность текущего р-ра (кг/л), SIDPP — устьевое давление на буровых трубах (бар), TVD — глубина по вертикали (м)",
      },
      {
        name: "Начальное давление глушения (ICP)",
        formula: "ICP = SIDPP + SCR",
        description: "Давление на насосе в начале глушения методом дрилера или инженерным методом",
        vars: "SIDPP — статическое давление на б/трубах, SCR — давление медленной прокачки",
      },
      {
        name: "Конечное давление глушения (FCP)",
        formula: "FCP = SCR × (KMW / MW)",
        description: "Давление на насосе после замены исходного раствора на раствор глушения",
        vars: "SCR — давление медленной прокачки, KMW — плотность р-ра глушения, MW — исходная плотность",
      },
      {
        name: "Давление пласта (Pp)",
        formula: "Pp = BHP + SIDPP = MW × 0.0981 × TVD + SIDPP",
        description: "Пластовое давление — основа всех расчётов глушения",
        vars: "BHP — забойное давление, SIDPP — давление на буровых трубах",
      },
    ],
  },
  {
    category: "Давление и гидростатика",
    items: [
      {
        name: "Гидростатическое давление (BHP)",
        formula: "BHP = MW × 0.0981 × TVD",
        description: "Давление столба жидкости на забой скважины",
        vars: "MW — плотность р-ра (кг/л), 0.0981 — константа (бар·л/кг·м), TVD — глубина (м)",
      },
      {
        name: "Эквивалентная плотность циркуляции (ECD)",
        formula: "ECD = MW + APL / (0.0981 × TVD)",
        description: "Эффективная плотность с учётом потерь давления при циркуляции",
        vars: "APL — потери давления в затрубе (бар)",
      },
      {
        name: "Максимально допустимое давление (MAASP)",
        formula: "MAASP = (MAMW − KMW) × 0.0981 × TVD",
        description: "Максимальное допустимое устьевое давление при глушении",
        vars: "MAMW — максимальная допустимая плотность р-ра (из LOT)",
      },
      {
        name: "Максимальная допустимая плотность (MAMW)",
        formula: "MAMW = MW + MASP / (0.0981 × TVD)",
        description: "Максимальная плотность для предотвращения гидроразрыва пласта",
        vars: "MASP — давление теста на поглощение (LOT/FIT)",
      },
    ],
  },
  {
    category: "Объёмы и геометрия",
    items: [
      {
        name: "Объём ствола скважины (открытый ствол)",
        formula: "V = π/4 × (Dh² − Dp²) × L × 10⁻⁶",
        description: "Объём затрубного пространства в открытом стволе",
        vars: "Dh — диаметр скважины (мм), Dp — OD труб (мм), L — длина (м), результат в м³",
      },
      {
        name: "Объём внутри трубы",
        formula: "V = π/4 × Di² × L × 10⁻⁶",
        description: "Объём внутри бурильного инструмента (колонна)",
        vars: "Di — внутренний диаметр трубы (мм), L — длина (м)",
      },
      {
        name: "Ходы насоса до долота",
        formula: "N = V_string / Q",
        description: "Количество ходов насоса для заполнения колонны",
        vars: "V_string — объём колонны (л), Q — выход насоса (л/ход)",
      },
    ],
  },
  {
    category: "Гидравлика",
    items: [
      {
        name: "Число Рейнольдса (Re)",
        formula: "Re = 928 × ρ × v × d / μ",
        description: "Режим течения: Re < 2100 — ламинарный, Re > 4000 — турбулентный",
        vars: "ρ — плотность (кг/л), v — скорость (м/с), d — диаметр (мм), μ — вязкость",
      },
      {
        name: "Потери давления в затрубе (APL)",
        formula: "APL = (48 × YP / (Do−Di)) × L / 1000",
        description: "Упрощённый расчёт потерь давления для псевдопластичного р-ра",
        vars: "YP — ДНС (Па), Do/Di — диаметры (мм), L — длина (м)",
      },
      {
        name: "Скорость подъёма шлама",
        formula: "v_ann = Q / (π/4 × (Dh² − Dp²)) × 10⁶/60",
        description: "Восходящая скорость потока для эффективного выноса шлама (>0.5 м/мин)",
        vars: "Q — выход насоса (л/мин), Dh — диаметр скв. (мм), Dp — OD труб (мм)",
      },
    ],
  },
];

const fluids = [
  { name: "Вода пресная", density: "1.000", gradient: "0.0981", viscosity: "1", type: "Водная" },
  { name: "Морская вода", density: "1.025", gradient: "0.1006", viscosity: "1.1", type: "Водная" },
  { name: "Насыщ. рассол NaCl", density: "1.200", gradient: "0.1177", viscosity: "1.5", type: "Рассол" },
  { name: "Рассол CaCl₂ (20%)", density: "1.180", gradient: "0.1158", viscosity: "2.1", type: "Рассол" },
  { name: "Рассол KCl (15%)", density: "1.095", gradient: "0.1074", viscosity: "1.2", type: "Рассол" },
  { name: "Нефть лёгкая", density: "0.800", gradient: "0.0785", viscosity: "2–10", type: "УВ" },
  { name: "Нефть средняя", density: "0.870", gradient: "0.0854", viscosity: "10–50", type: "УВ" },
  { name: "Нефть тяжёлая", density: "0.950", gradient: "0.0932", viscosity: "50+", type: "УВ" },
  { name: "Метан CH₄ (НУ)", density: "0.000717", gradient: "0.000070", viscosity: "0.01", type: "Газ" },
  { name: "CO₂ (газ, НУ)", density: "0.001965", gradient: "0.000193", viscosity: "0.015", type: "Газ" },
  { name: "H₂S (газ, НУ)", density: "0.001539", gradient: "0.000151", viscosity: "0.012", type: "Газ" },
  { name: "Буровой раствор (норм.)", density: "1.200", gradient: "0.1177", viscosity: "20–40", type: "Раствор" },
  { name: "Цементный раствор", density: "1.800", gradient: "0.1766", viscosity: "100+", type: "Цемент" },
];

const pipeGrades = [
  { grade: "E-75", minYield: "517", tensile: "689", hardness: "HRC 22 max", use: "Бурильные трубы (нагрузки)" },
  { grade: "X-95", minYield: "655", tensile: "724", hardness: "HRC 22 max", use: "Стандарт для нефтяных скважин" },
  { grade: "G-105", minYield: "724", tensile: "793", hardness: "HRC 22 max", use: "Умеренно нагруженные скважины" },
  { grade: "S-135", minYield: "931", tensile: "1000", hardness: "HRC 35 max", use: "Высоконагруженные, HPHT" },
  { grade: "V-150", minYield: "1034", tensile: "1138", hardness: "HRC 37 max", use: "Экстремальные условия" },
  { grade: "J-55", minYield: "379", tensile: "517", hardness: "—", use: "Обсадные трубы, неглубокие" },
  { grade: "K-55", minYield: "379", tensile: "655", hardness: "—", use: "Обсадные трубы, стандарт" },
  { grade: "N-80", minYield: "552", tensile: "689", hardness: "—", use: "Обсадные, НКТ, умеренные" },
  { grade: "L-80", minYield: "552", tensile: "655", hardness: "HRC 23 max", use: "H₂S среды (NACE MR0175)" },
  { grade: "P-110", minYield: "758", tensile: "862", hardness: "—", use: "Глубокие обсадные, хвостовики" },
  { grade: "Q-125", minYield: "862", tensile: "1000", hardness: "HRC 35 max", use: "HPHT обсадные, спецприменения" },
];

const ConversionTool = () => {
  const [value, setValue] = useState("");
  const [from, setFrom] = useState("bar");
  const [to, setTo] = useState("psi");

  const units: Record<string, { label: string; toBase: number; category: string }> = {
    bar: { label: "бар", toBase: 1, category: "давление" },
    psi: { label: "psi", toBase: 0.0689476, category: "давление" },
    kpa: { label: "кПа", toBase: 0.01, category: "давление" },
    mpa: { label: "МПа", toBase: 10, category: "давление" },
    atm: { label: "атм", toBase: 1.01325, category: "давление" },
    kgcm2: { label: "кгс/см²", toBase: 0.980665, category: "давление" },
    m: { label: "м", toBase: 1, category: "длина" },
    ft: { label: "фут", toBase: 0.3048, category: "длина" },
    "kg/l": { label: "кг/л", toBase: 1, category: "плотность" },
    ppg: { label: "ppg", toBase: 0.119826, category: "плотность" },
    "sg": { label: "уд. вес (SG)", toBase: 1, category: "плотность" },
    l: { label: "литр", toBase: 1, category: "объём" },
    bbl: { label: "баррель", toBase: 158.987, category: "объём" },
    m3: { label: "м³", toBase: 1000, category: "объём" },
    gal: { label: "галлон (US)", toBase: 3.78541, category: "объём" },
  };

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return "—";
    const result = v * units[from].toBase / units[to].toBase;
    return result.toFixed(4);
  };

  return (
    <div className="space-y-4">
      <p className="section-title">Конвертер единиц</p>
      <div className="grid grid-cols-3 gap-3 items-end">
        <div>
          <label className="label-text text-xs mb-1 block">Значение</label>
          <input className="inp text-sm" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className="label-text text-xs mb-1 block">Из</label>
          <select className="inp text-sm" value={from} onChange={e => setFrom(e.target.value)}>
            {Object.entries(units).map(([k, u]) => (
              <option key={k} value={k}>{u.label} ({u.category})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text text-xs mb-1 block">В</label>
          <select className="inp text-sm" value={to} onChange={e => setTo(e.target.value)}>
            {Object.entries(units).map(([k, u]) => (
              <option key={k} value={k}>{u.label} ({u.category})</option>
            ))}
          </select>
        </div>
      </div>
      <div className="result-card flex items-center justify-between">
        <span className="label-text text-sm">{value || "0"} {units[from]?.label}</span>
        <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
        <span className="value-display text-xl">{convert()} <span className="text-sm text-muted-foreground">{units[to]?.label}</span></span>
      </div>
    </div>
  );
};

export default function Reference() {
  const [activeTab, setActiveTab] = useState("constants");

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex gap-1 mb-4 bg-muted/30 rounded-lg p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[hsl(var(--iwcf-cyan))] text-[hsl(210,20%,6%)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={tab.icon as "Hash"} size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === "constants" && (
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <Icon name="Hash" size={14} className="text-[hsl(var(--iwcf-cyan))]" />
              <span className="text-sm font-semibold">Константы и коэффициенты</span>
            </div>
            <table className="grid-table w-full">
              <thead>
                <tr>
                  <th>Константа</th>
                  <th>Значение</th>
                  <th>Ед. изм.</th>
                  <th>Категория</th>
                </tr>
              </thead>
              <tbody>
                {constants.map((c) => (
                  <tr key={c.name}>
                    <td className="text-foreground text-xs">{c.name}</td>
                    <td><span className="value-display text-xs">{c.value}</span></td>
                    <td><span className="tag-cyan">{c.unit}</span></td>
                    <td><span className="tag text-[10px] bg-muted/60 text-muted-foreground">{c.category}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "formulas" && (
          <div className="space-y-4">
            {formulas.map(cat => (
              <div key={cat.category} className="panel">
                <div className="panel-header">
                  <Icon name="BookOpen" size={14} className="text-[hsl(var(--iwcf-amber))]" />
                  <span className="text-sm font-semibold">{cat.category}</span>
                </div>
                <div className="p-3 space-y-3">
                  {cat.items.map(item => (
                    <div key={item.name} className="rounded-lg border border-border/50 overflow-hidden">
                      <div className="bg-muted/40 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{item.name}</span>
                      </div>
                      <div className="px-3 py-2.5">
                        <div className="font-mono text-[13px] text-[hsl(var(--iwcf-cyan))] bg-muted/30 px-3 py-2 rounded mb-2">
                          {item.formula}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1.5">{item.description}</p>
                        <p className="text-[11px] text-muted-foreground/70 font-mono">{item.vars}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "fluids" && (
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <Icon name="Droplets" size={14} className="text-[hsl(var(--iwcf-cyan))]" />
              <span className="text-sm font-semibold">Свойства флюидов</span>
            </div>
            <table className="grid-table w-full">
              <thead>
                <tr>
                  <th>Флюид</th>
                  <th>Плотность (кг/л)</th>
                  <th>Градиент (бар/м)</th>
                  <th>Вязкость (сПз)</th>
                  <th>Тип</th>
                </tr>
              </thead>
              <tbody>
                {fluids.map(f => (
                  <tr key={f.name}>
                    <td className="text-xs text-foreground">{f.name}</td>
                    <td><span className="value-display text-xs">{f.density}</span></td>
                    <td><span className="font-mono text-xs text-[hsl(var(--iwcf-amber))]">{f.gradient}</span></td>
                    <td><span className="font-mono text-xs">{f.viscosity}</span></td>
                    <td>
                      <span className={`tag text-[10px] ${
                        f.type === "Газ" ? "bg-[hsl(var(--iwcf-red)/0.15)] text-[hsl(var(--iwcf-red))]" :
                        f.type === "УВ" ? "bg-[hsl(var(--iwcf-amber)/0.15)] text-[hsl(var(--iwcf-amber))]" :
                        f.type === "Рассол" ? "tag-cyan" : "bg-muted/60 text-muted-foreground"
                      }`}>{f.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <Icon name="Layers" size={14} className="text-[hsl(var(--iwcf-cyan))]" />
              <span className="text-sm font-semibold">Марки трубных сталей (API 5DP / 5CT)</span>
            </div>
            <table className="grid-table w-full">
              <thead>
                <tr>
                  <th>Марка</th>
                  <th>Предел текучести (МПа)</th>
                  <th>Прочность (МПа)</th>
                  <th>Твёрдость</th>
                  <th>Применение</th>
                </tr>
              </thead>
              <tbody>
                {pipeGrades.map(g => (
                  <tr key={g.grade}>
                    <td><span className="tag-cyan font-bold">{g.grade}</span></td>
                    <td><span className="value-display text-xs">{g.minYield}</span></td>
                    <td><span className="font-mono text-xs">{g.tensile}</span></td>
                    <td><span className="font-mono text-xs text-muted-foreground">{g.hardness}</span></td>
                    <td className="text-xs text-muted-foreground">{g.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "conversion" && (
          <div className="panel p-4">
            <ConversionTool />
          </div>
        )}
      </div>
    </div>
  );
}
