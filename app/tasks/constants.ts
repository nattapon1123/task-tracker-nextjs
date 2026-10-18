   export const STATUSES = ["TODO", "DONE"] as const;

   export const STATUS_LABELS: Record<(typeof STATUSES)[number], string> = {
     TODO: "ยังไม่เสร็จ",
     DONE: "เสร็จแล้ว",
   };

   export type TaskFormState = {
     success: boolean;
     errors?: Partial<
       Record<"title" | "subjectId" | "description" | "dueDate", string[]>
     >;
     message?: string;
     values?: Record<string, string>;
   };