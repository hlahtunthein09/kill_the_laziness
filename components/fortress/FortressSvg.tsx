import { cn } from "@/lib/utils";

interface FortressSvgProps {
  level: number;
  health: number;
  size?: number;
  className?: string;
}

export default function FortressSvg({
  level,
  health,
  size = 120,
  className,
}: FortressSvgProps) {
  const s = size;
  const towerCount = level >= 4 ? 3 : level >= 2 ? 2 : 1;
  const showFlag = level >= 4;
  const barColor = health < 50 ? "#f59e0b" : "#34d399";

  const towers = Array.from({ length: towerCount }, (_, i) => {
    const x = s * (0.15 + i * 0.35);
    return (
      <g key={i}>
        <rect x={x} y={s * 0.25} width={s * 0.2} height={s * 0.4} fill="#14b8a6" rx={2} />
        <rect x={x - s * 0.02} y={s * 0.2} width={s * 0.24} height={s * 0.08} fill="#0ea5e9" rx={2} />
        {showFlag && i === towerCount - 1 && (
          <g>
            <line x1={x + s * 0.1} y1={s * 0.2} x2={x + s * 0.1} y2={s * 0.05} stroke="#78716c" strokeWidth={2} />
            <polygon points={`${x + s * 0.1},${s * 0.05} ${x + s * 0.22},${s * 0.1} ${x + s * 0.1},${s * 0.15}`} fill="#fde68a" />
          </g>
        )}
      </g>
    );
  });

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
        <rect x={s * 0.1} y={s * 0.55} width={s * 0.8} height={s * 0.3} fill="#14b8a6" rx={3} />
        <rect x={s * 0.35} y={s * 0.65} width={s * 0.3} height={s * 0.2} fill="#0d9488" rx={2} />
        {towers}
        <rect x={s * 0.05} y={s * 0.82} width={s * 0.9} height={s * 0.06} fill="#e7e5e4" rx={2} />
        <rect x={s * 0.05} y={s * 0.82} width={s * 0.9 * (health / 100)} height={s * 0.06} fill={barColor} rx={2} />
      </svg>
      <span className="text-xs text-stone-500">
        အဆင့် {level} (Level {level})
      </span>
    </div>
  );
}
