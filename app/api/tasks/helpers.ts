   import { NextResponse } from "next/server";
   import { z } from "zod";

   import { auth } from "@/app/auth";
   import { taskSchema } from "@/app/tasks/validation";

   // เหมือน taskSchema แต่บังคับรูปแบบวันที่เป็น YYYY-MM-DD
   export const apiTaskSchema = taskSchema.extend({
     dueDate: z
       .string()
       .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD")
       .refine((value) => {
         const date = new Date(`${value}T00:00:00.000Z`);

         // วันที่ที่ไม่มีจริง เช่น 2026-13-01 จะได้ Invalid Date
         return (
           !Number.isNaN(date.getTime()) &&
           date.toISOString().slice(0, 10) === value
         );
       }, "วันที่ไม่ถูกต้อง"),
   });

   // คืน id ของผู้ใช้ที่ Login อยู่ (ถ้ายังไม่ได้ Login คืน null)
   export async function requireUser() {
     const session = await auth();
     return session?.user?.id ?? null;
   }

   export function unauthorized() {
     return NextResponse.json(
       { message: "กรุณาเข้าสู่ระบบก่อน" },
       { status: 401 },
     );
   }

   export function invalidJson() {
     return NextResponse.json(
       { message: "ข้อมูลที่ส่งมาไม่ใช่ JSON ที่ถูกต้อง" },
       { status: 400 },
     );
   }

   export function badId() {
     return NextResponse.json(
       { message: "รหัสงานไม่ถูกต้อง" },
       { status: 400 },
     );
   }

   export function notFoundTask() {
     return NextResponse.json(
       { message: "ไม่พบงานนี้" },
       { status: 404 },
     );
   }

   export function validationError(errors: unknown) {
     return NextResponse.json(
       { message: "ข้อมูลไม่ถูกต้อง", errors },
       { status: 400 },
     );
   }

   export function serverError(message: string) {
     return NextResponse.json({ message }, { status: 500 });
   }

   // อ่าน body เป็น JSON (ถ้าอ่านไม่ได้ หรือไม่ใช่ object คืน null)
   export async function readJson(
     request: Request,
   ): Promise<Record<string, unknown> | null> {
     try {
       const body = await request.json();

       return body && typeof body === "object" && !Array.isArray(body)
         ? (body as Record<string, unknown>)
         : null;
     } catch {
       return null;
     }
   }

   const text = (value: unknown) =>
     typeof value === "string"
       ? value
       : typeof value === "number"
         ? String(value)
         : "";

   // แปลง body ให้เป็นรูปแบบเดียวกับที่ฟอร์มส่งมา (ข้อความล้วน)
   export function toTaskInput(body: Record<string, unknown>) {
     return {
       title: text(body.title),
       subjectId: text(body.subjectId),
       description: text(body.description),
       dueDate: text(body.dueDate),
     };
   }

   export function parseId(id: string) {
     const value = Number(id);
     return Number.isInteger(value) && value > 0 ? value : null;
   }