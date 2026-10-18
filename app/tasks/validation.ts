   import { z } from "zod";

   export const taskSchema = z.object({
     title: z
       .string()
       .trim()
       .min(1, "กรุณากรอกชื่องาน")
       .max(100, "ชื่องานต้องไม่เกิน 100 ตัวอักษร"),

     subjectId: z.string().regex(/^\d+$/, "กรุณาเลือกวิชา"),

     description: z
       .string()
       .trim()
       .max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร"),

     dueDate: z
       .string()
       .min(1, "กรุณาเลือกกำหนดส่ง")
       .refine(
         (value) => !Number.isNaN(Date.parse(value)),
         "รูปแบบวันที่ไม่ถูกต้อง",
       ),
   });

   // อ่านค่าจากฟอร์มเป็นข้อความล้วน (ใช้ทั้งตอนตรวจและตอนส่งกลับไปแสดงในฟอร์ม)
   export function readTaskForm(formData: FormData): Record<string, string> {
     const fields = ["title", "subjectId", "description", "dueDate"];

     return Object.fromEntries(
       fields.map((name) => [name, String(formData.get(name) ?? "")]),
     );
   }