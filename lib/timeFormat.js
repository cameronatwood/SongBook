export function formatMinutesAsHrsMins(totalMinutes) {
  const minutes = Math.max(0, Math.floor(totalMinutes || 0));
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatTotalSecondsAsHrsMins(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  if (seconds < 60) return "<1m";
  const minutes = Math.floor(seconds / 60);
  return formatMinutesAsHrsMins(minutes);
}

export function formatSessionDuration(secondsTotal) {
  const seconds = Math.max(0, Math.floor(secondsTotal || 0));
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}m${secs > 0 ? ` ${secs}s` : ""}`;
  return `${secs}s`;
}

