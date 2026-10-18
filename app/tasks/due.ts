export const DAY = 24 * 60 * 60 * 1000;

// เวลาไทยเร็วกว่า UTC 7 ชั่วโมง
const BANGKOK_OFFSET = 7 * 60 * 60 * 1000;

// เหลือเวลาไม่เกินกี่วัน ถึงจะนับว่า "ใกล้ครบกำหนด" (เปลี่ยนตัวเลขนี้ได้)
export const NEAR_DAYS = 3;

export type DueState = "done" | "overdue" | "soon" | "normal";

// เวลาสิ้นสุดของวันกำหนดส่ง (เที่ยงคืนตามเวลาไทย)
function dueEnd(dueDate: Date) {
  return dueDate.getTime() + DAY - BANGKOK_OFFSET;
}

export function getDueState(
  dueDate: Date,
  status: string,
  now: number,
): DueState {
  if (status === "DONE") return "done";

  const end = dueEnd(dueDate);

  if (end < now) return "overdue";
  if (end - now <= NEAR_DAYS * DAY) return "soon";

  return "normal";
}

// ใช้ในการค้นหา: งานที่ dueDate น้อยกว่าค่านี้ คือเลยกำหนดแล้ว
export function overdueBefore(now: number) {
  return new Date(now - DAY + BANGKOK_OFFSET);
}

// ใช้ในการค้นหา: งานที่ dueDate น้อยกว่าหรือเท่ากับค่านี้ และยังไม่เลยกำหนด คือ "ใกล้ครบกำหนด"
export function soonUntil(now: number) {
  return new Date(now + NEAR_DAYS * DAY - DAY + BANGKOK_OFFSET);
}

// จำนวนวันจากวันนี้ (เวลาไทย) ถึงวันกำหนดส่ง
// 0 = ส่งวันนี้, 1 = พรุ่งนี้, ติดลบ = เลยกำหนดมาแล้ว
export function daysUntilDue(dueDate: Date, now: number) {
  const todayStart = Math.floor((now + BANGKOK_OFFSET) / DAY) * DAY;

  return Math.round((dueDate.getTime() - todayStart) / DAY);
}
