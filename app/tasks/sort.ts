type Sortable = {
  id: number;
  status: string;
  dueDate: Date;
  updatedAt: Date;
};

// เรียงงาน: ยังไม่เสร็จอยู่บน (ตามกำหนดส่ง) งานที่เสร็จแล้วลงล่าง (ตามเวลาที่กดล่าสุด)
export function sortTasks<T extends Sortable>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === "DONE";
    const bDone = b.status === "DONE";

    if (aDone !== bDone) {
      return aDone ? 1 : -1;
    }

    if (aDone) {
      return b.updatedAt.getTime() - a.updatedAt.getTime() || a.id - b.id;
    }

    return a.dueDate.getTime() - b.dueDate.getTime() || a.id - b.id;
  });
}