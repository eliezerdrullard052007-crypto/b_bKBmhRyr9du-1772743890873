export function formatTime(total: number) {
  if (!Number.isFinite(total) || total <= 0) return "0:00"
  const s = Math.floor(total)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, "0")}`
}
