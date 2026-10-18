   "use server";

   import { redirect } from "next/navigation";
   import { revalidatePath } from "next/cache";

   import { auth } from "@/app/auth";
   import prisma from "@/app/lib/prisma";
   import type { TaskFormState } from "./constants";
   import { readTaskForm, taskSchema } from "./validation";

   function isValidId(id: number) {
     return Number.isInteger(id) && id > 0;
   }

   export async function createTask(
     prevState: TaskFormState,
     formData: FormData,
   ): Promise<TaskFormState> {
     const session = await auth();

     if (!session?.user?.id) {
       redirect("/login");
     }

     const userId = session.user.id;
     const values = readTaskForm(formData);
     const result = taskSchema.safeParse(values);

     if (!result.success) {
       return {
         success: false,
         errors: result.error.flatten().fieldErrors,
         values,
       };
     }

     // วิชาที่เลือกต้องเป็นของผู้ใช้คนนี้จริง
     const subject = await prisma.subject.findFirst({
       where: { id: Number(result.data.subjectId), userId },
       select: { id: true },
     });

     if (!subject) {
       return {
         success: false,
         errors: { subjectId: ["วิชาที่เลือกไม่ถูกต้อง"] },
         values,
       };
     }

     try {
       await prisma.task.create({
         data: {
           title: result.data.title,
           description: result.data.description || null,
           dueDate: new Date(`${result.data.dueDate}T00:00:00.000Z`),
           subjectId: subject.id,
           userId,
         },
       });
     } catch {
       return {
         success: false,
         message: "ไม่สามารถบันทึกงานได้ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่",
         values,
       };
     }

     revalidatePath("/tasks");
     redirect("/tasks");
   }

   export async function updateTask(
     id: number,
     prevState: TaskFormState,
     formData: FormData,
   ): Promise<TaskFormState> {
     const session = await auth();

     if (!session?.user?.id) {
       redirect("/login");
     }

     const userId = session.user.id;

     if (!isValidId(id)) {
       return { success: false, message: "รหัสงานไม่ถูกต้อง" };
     }

     const values = readTaskForm(formData);
     const result = taskSchema.safeParse(values);

     if (!result.success) {
       return {
         success: false,
         errors: result.error.flatten().fieldErrors,
         values,
       };
     }

     const subject = await prisma.subject.findFirst({
       where: { id: Number(result.data.subjectId), userId },
       select: { id: true },
     });

     if (!subject) {
       return {
         success: false,
         errors: { subjectId: ["วิชาที่เลือกไม่ถูกต้อง"] },
         values,
       };
     }

     let updated = 0;

     try {
       const res = await prisma.task.updateMany({
         where: { id, userId },
         data: {
           title: result.data.title,
           description: result.data.description || null,
           dueDate: new Date(`${result.data.dueDate}T00:00:00.000Z`),
           subjectId: subject.id,
         },
       });

       updated = res.count;
     } catch {
       return {
         success: false,
         message: "ไม่สามารถแก้ไขงานได้",
         values,
       };
     }

     if (updated === 0) {
       return {
         success: false,
         message: "ไม่พบงานนี้ หรือคุณไม่มีสิทธิ์แก้ไข",
         values,
       };
     }

     revalidatePath("/tasks");
     redirect("/tasks");
   }

   export async function deleteTask(id: number) {
     const session = await auth();

     if (!session?.user?.id || !isValidId(id)) {
       return;
     }

     await prisma.task.deleteMany({
       where: { id, userId: session.user.id },
     });

     revalidatePath("/tasks");
   }

   export async function markTaskDone(id: number) {
     const session = await auth();

     if (!session?.user?.id || !isValidId(id)) {
       return;
     }

     await prisma.task.updateMany({
       where: { id, userId: session.user.id },
       data: { status: "DONE" },
     });

     revalidatePath("/tasks");
   }