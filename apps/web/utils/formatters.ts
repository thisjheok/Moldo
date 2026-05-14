type DurationFormatOptions = {
  padMinutes?: boolean;
};

export function formatDateTime(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatScore(score: number) {
  return `${score}점`;
}

export function formatDuration(seconds: number, options: DurationFormatOptions = {}) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const minuteLabel = options.padMinutes ? String(minutes).padStart(2, "0") : String(minutes);

  return `${minuteLabel}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatEstimatedMinutes(minutes: number) {
  return `약 ${minutes}분`;
}
