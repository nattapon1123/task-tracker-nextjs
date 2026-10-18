   import { NextResponse } from "next/server";

   import prisma from "@/app/lib/prisma";
   import { STATUSES } from "@/app/tasks/constants";
   import {
     apiTaskSchema,
     badId,
     invalidJson,
     notFoundTask,
     parseId,
     readJson,
     requireUser,
     serverError,
     toTaskInput,
     unauthorized,
     validationError,
   } from "../helpers";

   type RouteContext = {
     params: Promise<{
       id: string;
     }>;
   };

   const include = { subject: { select: { id: true, name: true } } };

   // GET /api/tasks/1
   export async function GET(request: Request, { params }: RouteContext) {
     const userId = await requireUser();

     if (!userId) {
       return unauthorized();
     }

     const taskId = parseId((await params).id);

     if (!taskId) {
       return badId();
     }

     const task = await prisma.task.findFirst({
       where: { id: taskId, userId },
       include,
     });

     if (!task) {
       return notFoundTask();
     }

     return NextResponse.json(task);
   }

   // PUT /api/tasks/1  (ส่ง status เพิ่มได้ เป็น TODO หรือ DONE)
   export async function PUT(request: Request, { params }: RouteContext) {
     const userId = await requireUser();

     if (!userId) {
       return unauthorized();
     }

     const taskId = parseId((await params).id);

     if (!taskId) {
       return badId();
     }

     const body = await readJson(request);

     if (!body) {
       return invalidJson();
     }

     const result = apiTaskSchema.safeParse(toTaskInput(body));

     if (!result.success) {
       return validationError(result.error.flatten().fieldErrors);
     }

     // status ไม่บังคับ ถ้าไม่ส่งมาจะไม่เปลี่ยนสถานะเดิม
     let status: (typeof STATUSES)[number] | undefined;

     if (body.status !== undefined) {
       status = STATUSES.find((s) => s === body.status);

       if (!status) {
         return validationError({
           status: ["สถานะต้องเป็น TODO หรือ DONE"],
         });
       }
     }

     const subject = await prisma.subject.findFirst({
       where: { id: Number(result.data.subjectId), userId },
       select: { id: true },
     });

     if (!subject) {
       return validationError({ subjectId: ["วิชาที่เลือกไม่ถูกต้อง"] });
     }

     try {
       const updated = await prisma.task.updateMany({
         where: { id: taskId, userId },
         data: {
           title: result.data.title,
           description: result.data.description || null,
           dueDate: new Date(`${result.data.dueDate}T00:00:00.000Z`),
           subjectId: subject.id,
           ...(status ? { status } : {}),
         },
       });

       if (updated.count === 0) {
         return notFoundTask();
       }

       const task = await prisma.task.findFirst({
         where: { id: taskId, userId },
         include,
       });

       return NextResponse.json(task);
     } catch {
       return serverError("ไม่สามารถแก้ไขงานได้");
     }
   }

   // DELETE /api/tasks/1
   export async function DELETE(request: Request, { params }: RouteContext) {
     const userId = await requireUser();

     if (!userId) {
       return unauthorized();
     }

     const taskId = parseId((await params).id);

     if (!taskId) {
       return badId();
     }

     try {
       const deleted = await prisma.task.deleteMany({
         where: { id: taskId, userId },
       });

       if (deleted.count === 0) {
         return notFoundTask();
       }

       return NextResponse.json({ message: "ลบงานเรียบร้อยแล้ว" });
     } catch {
       return serverError("ไม่สามารถลบงานได้");
     }
   }