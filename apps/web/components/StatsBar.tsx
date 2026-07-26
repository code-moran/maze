import type { StatItem } from "@/data/types";

export default function StatsBar({ stats }: { stats: StatItem[] }) {
  return (
    <div className="stats-bar">
      <div className="container">
        <div className="row g-4 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="col-6 col-md-3 stat-item">
              <div className="stat-num">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
