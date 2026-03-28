import { useState } from "react";
import Icon from "@/components/ui/icon";
import Calculator from "@/components/iwcf/Calculator";
import KillSheet from "@/components/iwcf/KillSheet";
import Reference from "@/components/iwcf/Reference";
import History from "@/components/iwcf/History";
import Charts from "@/components/iwcf/Charts";

type Tab = "calculator" | "killsheet" | "reference" | "history" | "charts";

const TABS: { id: Tab; label: string; icon: string; color: string; desc: string }[] = [
  { id: "calculator", label: "Расчёты", icon: "Calculator", color: "cyan", desc: "Формулы IWCF" },
  { id: "killsheet", label: "Лист глушения", icon: "FileText", color: "amber", desc: "Kill Sheet" },
  { id: "charts", label: "Графики", icon: "BarChart2", color: "cyan", desc: "Давление / Temp" },
  { id: "reference", label: "Справочник", icon: "BookOpen", color: "green", desc: "Константы / Формулы" },
  { id: "history", label: "История", icon: "History", color: "purple", desc: "Проекты / Расчёты" },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-0 px-4 h-12">
          <div className="flex items-center gap-2.5 pr-5 border-r border-border mr-4">
            <div className="w-7 h-7 rounded bg-[hsl(var(--iwcf-cyan)/0.15)] border border-[hsl(var(--iwcf-cyan)/0.3)] flex items-center justify-center">
              <Icon name="Drill" size={14} className="text-[hsl(var(--iwcf-cyan))]" fallback="Settings" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground leading-none">IWCF WellControl</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Metric Edition</p>
            </div>
          </div>

          <nav className="flex gap-0.5 flex-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
              >
                <Icon name={tab.icon as "Calculator"} size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--iwcf-green))] animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-mono">ONLINE</span>
            </div>
            <div className="hidden md:flex items-center gap-1 tag-cyan">
              <Icon name="Shield" size={10} />
              <span className="text-[10px]">IWCF v2.0</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card/40 px-4 py-2 flex items-center gap-3">
          {TABS.filter(t => t.id === activeTab).map(tab => (
            <div key={tab.id} className="flex items-center gap-2">
              <Icon name={tab.icon as "Calculator"} size={13} className={`text-[hsl(var(--iwcf-${tab.color}))]`} />
              <span className="text-sm font-semibold text-foreground">{tab.label}</span>
              <span className="text-muted-foreground text-xs">/ {tab.desc}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span>{new Date().toLocaleDateString("ru-RU")}</span>
            <span className="text-border">|</span>
            <span>Метрическая СИ</span>
          </div>
        </div>

        <main className="flex-1 overflow-hidden p-4">
          {activeTab === "calculator" && <Calculator />}
          {activeTab === "killsheet" && <KillSheet />}
          {activeTab === "charts" && <Charts />}
          {activeTab === "reference" && <Reference />}
          {activeTab === "history" && <History />}
        </main>
      </div>

      <footer className="border-t border-border px-4 py-2 bg-card/60 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
          <span>IWCF Well Control Formulae</span>
          <span className="text-border">·</span>
          <span>Metric System</span>
          <span className="text-border">·</span>
          <span>Driller's Method & Engineer's Method</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Icon name="AlertTriangle" size={10} className="text-[hsl(var(--iwcf-amber))]" />
          <span>Для профессионального использования. Верифицируйте данные по стандартам IWCF.</span>
        </div>
      </footer>
    </div>
  );
}
