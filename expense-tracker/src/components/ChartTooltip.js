import { useApp } from "../AppContext";
import { fmt } from "../constants";

export default function ChartTooltip({ active, payload, label }) {
  const { T } = useApp();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 12, padding: "10px 14px", fontSize: 12, boxShadow: T.glow }}>
      <div style={{ color: T.text3, marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || T.text1, fontWeight: 600 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  );
}
