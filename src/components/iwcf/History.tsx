import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface HistoryEntry {
  savedAt: string;
  type: "killsheet" | "calculation";
  wellName?: string;
  depth?: string;
  mudWeight?: string;
  killMudWeight?: string;
  icp?: string;
  fcp?: string;
  sidpp?: string;
  sicp?: string;
  pitGain?: string;
  date?: string;
  operator?: string;
  comments?: string;
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [filter, setFilter] = useState<"all" | "killsheet" | "calculation">("all");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("iwcf_history") || "[]");
    setEntries(data);
  }, []);

  const filtered = entries.filter(e => filter === "all" || e.type === filter);

  const handleDelete = (idx: number) => {
    const updated = entries.filter((_, i) => i !== idx);
    setEntries(updated);
    localStorage.setItem("iwcf_history", JSON.stringify(updated));
    if (selected === entries[idx]) setSelected(null);
  };

  const handleClearAll = () => {
    if (window.confirm("Очистить всю историю?")) {
      setEntries([]);
      setSelected(null);
      localStorage.removeItem("iwcf_history");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  const exportEntry = (entry: HistoryEntry) => {
    const rows = Object.entries(entry).map(([k, v]) => `${k};${v}`).join("\n");
    const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IWCF_${entry.wellName || "расчёт"}_${entry.date || entry.savedAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Icon name="History" size={16} className="text-[hsl(var(--iwcf-purple))]" />
            История проектов
          </h2>
          <p className="text-xs text-muted-foreground">{entries.length} записей сохранено локально</p>
        </div>
        <div className="flex gap-1 bg-muted/30 rounded p-0.5">
          {(["all", "killsheet", "calculation"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                filter === f ? "bg-[hsl(var(--iwcf-cyan))] text-[hsl(210,20%,6%)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Все" : f === "killsheet" ? "Листы глушения" : "Расчёты"}
            </button>
          ))}
        </div>
        {entries.length > 0 && (
          <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-[hsl(var(--iwcf-red))]" onClick={handleClearAll}>
            <Icon name="Trash2" size={13} />
            Очистить
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-3 overflow-hidden">
        <div className="w-80 shrink-0 overflow-y-auto scrollbar-thin space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3 text-muted-foreground">
              <Icon name="FolderOpen" size={32} className="opacity-30" />
              <div>
                <p className="text-sm">История пуста</p>
                <p className="text-xs mt-1">Сохраните лист глушения или расчёт</p>
              </div>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <div
                key={i}
                onClick={() => setSelected(entry)}
                className={`panel p-3 cursor-pointer transition-all hover:border-[hsl(var(--iwcf-cyan)/0.5)] ${
                  selected === entry ? "border-[hsl(var(--iwcf-cyan))] bg-[hsl(var(--iwcf-cyan)/0.05)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`tag text-[10px] ${
                        entry.type === "killsheet"
                          ? "bg-[hsl(var(--iwcf-amber)/0.15)] text-[hsl(var(--iwcf-amber))]"
                          : "tag-cyan"
                      }`}>
                        {entry.type === "killsheet" ? "Лист глушения" : "Расчёт"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate text-foreground">
                      {entry.wellName || "Без названия"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.savedAt)}</p>
                    {entry.depth && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          Гл.: <span className="font-mono text-foreground">{entry.depth} м</span>
                        </span>
                        {entry.mudWeight && (
                          <span className="text-xs text-muted-foreground">
                            MW: <span className="font-mono text-[hsl(var(--iwcf-cyan))]">{entry.mudWeight} кг/л</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(i); }}
                    className="text-muted-foreground/50 hover:text-[hsl(var(--iwcf-red))] transition-colors p-1 rounded"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {selected ? (
            <div className="panel h-full flex flex-col animate-fade-in">
              <div className="panel-header justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="FileText" size={14} className="text-[hsl(var(--iwcf-amber))]" />
                  <span className="text-sm font-semibold">{selected.wellName || "Без названия"}</span>
                  <span className="tag-cyan text-[10px]">{formatDate(selected.savedAt)}</span>
                </div>
                <button
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  onClick={() => exportEntry(selected)}
                >
                  <Icon name="Download" size={13} />
                  Экспорт CSV
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selected)
                    .filter(([k]) => !["savedAt", "type"].includes(k))
                    .filter(([, v]) => v !== "" && v !== undefined)
                    .map(([key, value]) => {
                      const labels: Record<string, string> = {
                        wellName: "Скважина", wellNumber: "Номер", date: "Дата",
                        operator: "Оператор", driller: "Бурильщик", depth: "Глубина (м)",
                        mudWeight: "Плотность р-ра (кг/л)", killMudWeight: "Плотность глушения (кг/л)",
                        icp: "ICP (бар)", fcp: "FCP (бар)", sidpp: "SIDPP (бар)",
                        sicp: "SICP (бар)", pitGain: "Прирост объёма (л)",
                        formationPressure: "Давление пласта (бар)", comments: "Комментарии",
                        holeDiameter: "Диаметр долота (мм)", casingOD: "OD обсадной (мм)",
                        pumpOutput: "Выход насоса (л/ход)", scrPressure: "SCR (бар)",
                        strokesDrillpipe: "Ходы по колонне", strokesAnnulus: "Ходы по затрубу",
                      };
                      return (
                        <div key={key} className="data-row">
                          <span className="label-text text-xs">{labels[key] || key}</span>
                          <span className="value-display text-xs">{String(value)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <Icon name="MousePointerClick" size={24} className="opacity-30" />
              </div>
              <div>
                <p className="text-sm">Выберите запись для просмотра</p>
                <p className="text-xs mt-1">Нажмите на элемент в списке слева</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
