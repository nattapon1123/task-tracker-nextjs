   "use server";

   import { redirect } from "next/navigation";
   import { revalidatePath } from "next/cache";
   import { z } from "zod";

   import { auth } from "@/app/auth";
   import prisma from "@/app/lib/prisma";

   export type SubjectFormState = {
     success: boolean;
     error?: string;
   };

   const subjectSchema = z.object({
     name: z
       .string()
       .trim()
       .min(1, "กรุณากรอกชื่อวิชา")
       .max(100, "ชื่อวิชาต้องไม่เกิน 100 ตัวอักษร"),
   });

   export async function createSubject(
     prevState: SubjectFormState,
     formData: FormData,
   ): Promise<SubjectFormState> {
     const session = await auth();

     if (!session?.user?.id) {
       redirect("/login");
     }

     const result = subjectSchema.safeParse({
       name: String(formData.get("name") ?? ""),
     });

     if (!result.success) {
       return {
         success: false,
         error: result.error.issues[0].message,
       };
     }

     try {
       await prisma.subject.create({
         data: {
           name: result.data.name,
           userId: session.user.id,
         },
       });
     } catch {
       return {
         success: false,
         error: "มีวิชานี้อยู่แล้ว หรือไม่สามารถบันทึกได้",
       };
     }

     revalidatePath("/subjects");

     return { success: true };
   }

   export async function deleteSubject(
     id: number,
   ): Promise<{ ok: boolean; message?: string }> {
     const session = await auth();

     if (!session?.user?.id || !Number.isInteger(id) || id <= 0) {
       return { ok: false, message: "ไม่สามารถลบวิชาได้" };
     }

     const userId = session.user.id;

     // ห้ามลบวิชาที่ยังมีงานอยู่
     const taskCount = await prisma.task.count({
       where: { subjectId: id, userId },
     });

     if (taskCount > 0) {
       return {
         ok: false,
         message: `ลบไม่ได้ เพราะวิชานี้ยังมีงานอยู่ ${taskCount} งาน กรุณาลบหรือย้ายงานก่อน`,
       };
     }

     await prisma.subject.deleteMany({
       where: { id, userId },
     });

     revalidatePath("/subjects");

     return { ok: true };
   }