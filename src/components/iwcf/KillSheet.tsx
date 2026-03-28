import { useState } from "react";
import Icon from "@/components/ui/icon";

interface KillSheetData {
  wellName: string;
  wellNumber: string;
  date: string;
  operator: string;
  driller: string;
  depth: string;
  holeDiameter: string;
  casingOD: string;
  casingID: string;
  dpOD: string;
  dpID: string;
  hwdpOD: string;
  hwdpID: string;
  hwdpLength: string;
  dcOD: string;
  dcID: string;
  dcLength: string;
  dpLength: string;
  mudWeight: string;
  mudType: string;
  mudViscosity: string;
  yieldPoint: string;
  filtrate: string;
  mudTemp: string;
  pumpOutput: string;
  scrPressure: string;
  scrRate: string;
  sidpp: string;
  sicp: string;
  pitGain: string;
  formationPressure: string;
  maxAllowable: string;
  killMudWeight: string;
  icp: string;
  fcp: string;
  strokesDrillpipe: string;
  strokesAnnulus: string;
  comments: string;
}

const initial: KillSheetData = {
  wellName: "", wellNumber: "", date: new Date().toISOString().slice(0, 10),
  operator: "", driller: "", depth: "", holeDiameter: "", casingOD: "",
  casingID: "", dpOD: "", dpID: "", hwdpOD: "", hwdpID: "", hwdpLength: "",
  dcOD: "", dcID: "", dcLength: "", dpLength: "", mudWeight: "", mudType: "Водная основа",
  mudViscosity: "", yieldPoint: "", filtrate: "", mudTemp: "",
  pumpOutput: "", scrPressure: "", scrRate: "", sidpp: "", sicp: "",
  pitGain: "", formationPressure: "", maxAllowable: "", killMudWeight: "",
  icp: "", fcp: "", strokesDrillpipe: "", strokesAnnulus: "", comments: "",
};

const Row = ({
  label, value, onChange, unit, readOnly = false,
}: {
  label: string; value: string; onChange?: (v: string) => void; unit?: string; readOnly?: boolean;
}) => (
  <tr>
    <td className="py-1.5 px-3 text-xs text-muted-foreground border-r border-border w-64">{label}</td>
    <td className="py-1 px-2">
      <div className="flex items-center gap-1">
        <input
          className={`inp text-xs py-1 ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
          type="text"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          readOnly={readOnly}
        />
        {unit && <span className="tag-cyan text-[10px] shrink-0 w-10 justify-center">{unit}</span>}
      </div>
    </td>
  </tr>
);

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <tr>
    <td colSpan={2} className="py-2 px-3 bg-muted/50">
      <div className="flex items-center gap-2">
        <Icon name={icon as "Settings"} size={13} className="text-[hsl(var(--iwcf-cyan))]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--iwcf-cyan))]">{title}</span>
      </div>
    </td>
  </tr>
);

export default function KillSheet() {
  const [data, setData] = useState<KillSheetData>(initial);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof KillSheetData) => (v: string) => {
    setData(prev => ({ ...prev, [key]: v }));
    setSaved(false);
  };

  const autoCalc = () => {
    const n = (v: string) => parseFloat(v) || 0;
    const depth = n(data.depth);
    const mw = n(data.mudWeight);
    const sidpp = n(data.sidpp);
    const scr = n(data.scrPressure);

    const kmw = mw > 0 && depth > 0 && sidpp > 0
      ? (mw + sidpp / (0.0981 * depth)).toFixed(3)
      : data.killMudWeight;
    const icp = sidpp > 0 && scr > 0 ? (sidpp + scr).toFixed(1) : data.icp;
    const fcp = scr > 0 && n(kmw) > 0 && mw > 0
      ? (scr * n(kmw) / mw).toFixed(1)
      : data.fcp;

    setData(prev => ({ ...prev, killMudWeight: kmw, icp, fcp }));
  };

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem("iwcf_history") || "[]");
    existing.unshift({ ...data, savedAt: new Date().toISOString(), type: "killsheet" });
    localStorage.setItem("iwcf_history", JSON.stringify(existing.slice(0, 50)));
    setSaved(true);
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const rows = [
      ["ЛИСТ ГЛУШЕНИЯ СКВАЖИНЫ (IWCF)", ""],
      ["", ""],
      ["Скважина", data.wellName], ["Номер", data.wellNumber],
      ["Дата", data.date], ["Оператор", data.operator],
      ["Бурильщик", data.driller], ["", ""],
      ["ГЕОМЕТРИЯ", ""],
      ["Глубина TVD (м)", data.depth], ["Диаметр долота (мм)", data.holeDiameter],
      ["OD обсадной (мм)", data.casingOD], ["ID обсадной (мм)", data.casingID],
      ["OD бурильных труб (мм)", data.dpOD], ["ID бурильных труб (мм)", data.dpID],
      ["Длина БТ (м)", data.dpLength], ["", ""],
      ["ПАРАМЕТРЫ РАСТВОРА", ""],
      ["Плотность р-ра (кг/л)", data.mudWeight], ["Тип р-ра", data.mudType],
      ["Вязкость (сПз)", data.mudViscosity], ["ДНС (Па)", data.yieldPoint],
      ["", ""],
      ["ДАННЫЕ ПРИХВАТА/ВЫБРОСА", ""],
      ["СИДТ - SIDPP (бар)", data.sidpp], ["СИДО - SICP (бар)", data.sicp],
      ["Прирост объёма (л)", data.pitGain], ["Давление пласта (бар)", data.formationPressure],
      ["", ""],
      ["РАСЧЁТЫ ГЛУШЕНИЯ", ""],
      ["Плотность р-ра глушения (кг/л)", data.killMudWeight],
      ["Нач. давление глушения ICP (бар)", data.icp],
      ["Кон. давление глушения FCP (бар)", data.fcp],
      ["Ходы по колонне", data.strokesDrillpipe],
      ["Ходы по затрубу", data.strokesAnnulus],
      ["", ""],
      ["Примечания", data.comments],
    ];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KillSheet_${data.wellName || "скважина"}_${data.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="FileText" size={16} className="text-[hsl(var(--iwcf-amber))]" />
            Лист глушения скважины
          </h2>
          <p className="text-xs text-muted-foreground">Kill Sheet — стандарт IWCF, метрическая система</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5" onClick={autoCalc}>
            <Icon name="Zap" size={13} />
            Авторасчёт
          </button>
          <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5" onClick={handleSave}>
            <Icon name="Save" size={13} />
            {saved ? "Сохранено ✓" : "Сохранить"}
          </button>
          <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5" onClick={handleExportCSV}>
            <Icon name="Download" size={13} />
            CSV
          </button>
          <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5" onClick={handlePrint}>
            <Icon name="Printer" size={13} />
            Печать
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-2 gap-3">
          <div className="panel">
            <table className="w-full">
              <tbody>
                <SectionHeader title="Идентификация" icon="FileText" />
                <Row label="Название скважины" value={data.wellName} onChange={set("wellName")} />
                <Row label="Номер скважины" value={data.wellNumber} onChange={set("wellNumber")} />
                <Row label="Дата" value={data.date} onChange={set("date")} />
                <Row label="Компания/Оператор" value={data.operator} onChange={set("operator")} />
                <Row label="Ответственный бурильщик" value={data.driller} onChange={set("driller")} />

                <SectionHeader title="Геометрия ствола" icon="Layers" />
                <Row label="Глубина TVD" value={data.depth} onChange={set("depth")} unit="м" />
                <Row label="Диаметр долота" value={data.holeDiameter} onChange={set("holeDiameter")} unit="мм" />
                <Row label="OD обсадной колонны" value={data.casingOD} onChange={set("casingOD")} unit="мм" />
                <Row label="ID обсадной колонны" value={data.casingID} onChange={set("casingID")} unit="мм" />
                <Row label="OD бурильных труб" value={data.dpOD} onChange={set("dpOD")} unit="мм" />
                <Row label="ID бурильных труб" value={data.dpID} onChange={set("dpID")} unit="мм" />
                <Row label="Длина БТ" value={data.dpLength} onChange={set("dpLength")} unit="м" />
                <Row label="OD УБТ" value={data.hwdpOD} onChange={set("hwdpOD")} unit="мм" />
                <Row label="ID УБТ" value={data.hwdpID} onChange={set("hwdpID")} unit="мм" />
                <Row label="Длина УБТ" value={data.hwdpLength} onChange={set("hwdpLength")} unit="м" />
                <Row label="OD DC (утяжелённые)" value={data.dcOD} onChange={set("dcOD")} unit="мм" />
                <Row label="ID DC (утяжелённые)" value={data.dcID} onChange={set("dcID")} unit="мм" />
                <Row label="Длина DC" value={data.dcLength} onChange={set("dcLength")} unit="м" />

                <SectionHeader title="Параметры бурового раствора" icon="Droplets" />
                <Row label="Плотность раствора (MW)" value={data.mudWeight} onChange={set("mudWeight")} unit="кг/л" />
                <Row label="Тип раствора" value={data.mudType} onChange={set("mudType")} />
                <Row label="Пласт. вязкость" value={data.mudViscosity} onChange={set("mudViscosity")} unit="сПз" />
                <Row label="ДНС (динамич. напряжение сдвига)" value={data.yieldPoint} onChange={set("yieldPoint")} unit="Па" />
                <Row label="Фильтрат (API)" value={data.filtrate} onChange={set("filtrate")} unit="мл/30'" />
                <Row label="Температура раствора" value={data.mudTemp} onChange={set("mudTemp")} unit="°C" />
              </tbody>
            </table>
          </div>

          <div className="panel">
            <table className="w-full">
              <tbody>
                <SectionHeader title="Параметры насоса" icon="Activity" />
                <Row label="Выход насоса (Q)" value={data.pumpOutput} onChange={set("pumpOutput")} unit="л/ход" />
                <Row label="Давление медленной прокачки (SCR)" value={data.scrPressure} onChange={set("scrPressure")} unit="бар" />
                <Row label="Скорость медл. прокачки (SCR rate)" value={data.scrRate} onChange={set("scrRate")} unit="ход/мин" />

                <SectionHeader title="Данные ГНВП (Well Control Event)" icon="AlertTriangle" />
                <Row label="СИДТ — SIDPP (давл. на бур. трубах)" value={data.sidpp} onChange={set("sidpp")} unit="бар" />
                <Row label="СИДО — SICP (давл. на обсадной)" value={data.sicp} onChange={set("sicp")} unit="бар" />
                <Row label="Прирост объёма приёмных ям" value={data.pitGain} onChange={set("pitGain")} unit="л" />
                <Row label="Расчётное давление пласта" value={data.formationPressure} onChange={set("formationPressure")} unit="бар" />
                <Row label="Макс. допустимое давление (MAASP)" value={data.maxAllowable} onChange={set("maxAllowable")} unit="бар" />

                <SectionHeader title="Расчёты глушения (Kill Calculations)" icon="Target" />
                <Row label="Плотность р-ра глушения (KMW)" value={data.killMudWeight} onChange={set("killMudWeight")} unit="кг/л" />
                <Row label="Нач. давление глушения (ICP)" value={data.icp} onChange={set("icp")} unit="бар" />
                <Row label="Кон. давление глушения (FCP)" value={data.fcp} onChange={set("fcp")} unit="бар" />
                <Row label="Ходы насоса по колонне" value={data.strokesDrillpipe} onChange={set("strokesDrillpipe")} unit="ходов" />
                <Row label="Ходы насоса по затрубу" value={data.strokesAnnulus} onChange={set("strokesAnnulus")} unit="ходов" />

                <SectionHeader title="Таблица снижения давления" icon="TrendingDown" />
                <tr>
                  <td colSpan={2} className="p-3">
                    <div className="grid grid-cols-4 gap-1 text-[11px]">
                      <div className="bg-muted/50 p-1.5 rounded text-center font-semibold text-muted-foreground">Ходы</div>
                      <div className="bg-muted/50 p-1.5 rounded text-center font-semibold text-muted-foreground">% ходов</div>
                      <div className="bg-muted/50 p-1.5 rounded text-center font-semibold text-muted-foreground">Давление (бар)</div>
                      <div className="bg-muted/50 p-1.5 rounded text-center font-semibold text-muted-foreground">Факт (бар)</div>
                      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(pct => {
                        const totalStrokes = parseFloat(data.strokesDrillpipe) || 0;
                        const icp = parseFloat(data.icp) || 0;
                        const fcp = parseFloat(data.fcp) || 0;
                        const strokes = Math.round(totalStrokes * pct / 100);
                        const pressure = icp > 0 ? (icp - (icp - fcp) * pct / 100).toFixed(1) : "—";
                        return (
                          <>
                            <div key={`s-${pct}`} className="font-mono p-1.5 rounded bg-muted/20 text-center text-[hsl(var(--iwcf-cyan))]">{strokes || "—"}</div>
                            <div key={`p-${pct}`} className="font-mono p-1.5 rounded bg-muted/20 text-center">{pct}%</div>
                            <div key={`pr-${pct}`} className="font-mono p-1.5 rounded bg-muted/20 text-center text-[hsl(var(--iwcf-amber))]">{pressure}</div>
                            <div key={`f-${pct}`} className="p-1.5 rounded border border-border/50 text-center"></div>
                          </>
                        );
                      })}
                    </div>
                  </td>
                </tr>

                <SectionHeader title="Примечания / Комментарии" icon="MessageSquare" />
                <tr>
                  <td colSpan={2} className="p-3">
                    <textarea
                      className="inp text-xs py-2 resize-none w-full"
                      rows={4}
                      value={data.comments}
                      onChange={e => set("comments")(e.target.value)}
                      placeholder="Дополнительные данные, наблюдения, особые условия..."
                    />
                  </td>
                </tr>

                <SectionHeader title="Подписи" icon="PenLine" />
                <Row label="Бурильщик / подпись" value="" onChange={() => {}} readOnly />
                <Row label="Инженер по буровым растворам" value="" onChange={() => {}} readOnly />
                <Row label="Супервайзер / OIM" value="" onChange={() => {}} readOnly />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
