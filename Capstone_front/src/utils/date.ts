// 날짜는 서버(LocalDate)와 같은 "YYYY-MM-DD" 문자열로 주고받는다.
// toISOString()은 UTC 기준이라 한국 시간 새벽에는 하루 전 날짜가 나오므로 쓰지 않는다.

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date → "YYYY-MM-DD" (기기 현지 시간 기준) */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 오늘부터 days일 뒤 날짜 ("YYYY-MM-DD") */
export function addDaysFromToday(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

/** "YYYY-MM-DD" → 현지 시간 자정 Date */
export function parseDateString(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** 오늘부터 해당 날짜까지 남은 일수 (오늘이면 0, 지났으면 음수) */
export function daysUntil(value: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = parseDateString(value).getTime() - today.getTime();
  return Math.round(diff / (24 * 60 * 60 * 1000));
}

/** "2026-10-20" → "화" */
export function weekdayOf(value: string): string {
  return WEEKDAYS[parseDateString(value).getDay()];
}

/** "2026-10-20" → "10월 20일 (화)" */
export function formatKoreanDate(value: string): string {
  const date = parseDateString(value);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

/** 남은 일수 → "D-3" / "D-DAY" / "D+1" */
export function formatDDay(days: number): string {
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}
