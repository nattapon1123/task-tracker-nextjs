   import { NextResponse } from "next/server";

   import prisma from "@/app/lib/prisma";
   import { STATUSES } from "@/app/tasks/constants";
   import { overdueBefore, soonUntil } from "@/app/tasks/due";
   import {
     apiTaskSchema,
     invalidJson,
     readJson,
     requireUser,
     serverError,
     toTaskInput,
     unauthorized,
     validationError,
   } from "./helpers";

   const include = { subject: { select: { id: true, name: true } } };

   // GET /api/tasks?search=&subjectId=&status=&due=
   export async function GET(request: Request) {
     const userId = await requireUser();

     if (!userId) {
       return unauthorized();
     }

     const { searchParams } = new URL(request.url);

     const search = (searchParams.get("search") ?? "").trim();
     const subjectParam = searchParams.get("subjectId") ?? "";
     const subjectId = /^\d+$/.test(subjectParam) ? Number(subjectParam) : null;
     const status = STATUSES.find((s) => s === searchParams.get("status"));
     const due = searchParams.get("due");

     const now = Date.now();

     const tasks = await prisma.task.findMany({
       where: {
         userId,
         AND: [
           search
             ? {
                 OR: [
                   { title: { contains: search } },
                   { subject: { name: { contains: search } } },
                 ],
               }
             : {},
           subjectId ? { subjectId } : {},
           status ? { status } : {},
           due === "overdue"
             ? {
                 status: { not: "DONE" },
                 dueDate: { lt: overdueBefore(now) },
               }
             : {},
           due === "soon"
             ? {
                 status: { not: "DONE" },
                 dueDate: {
                   gte: overdueBefore(now),
                   lte: soonUntil(now),
                 },
               }
             : {},
         ],
       },
       include,
       orderBy: [{ dueDate: "asc" }, { id: "asc" }],
     });

     return NextResponse.json(tasks);
   }

   // POST /api/tasks
   export async function POST(request: Request) {
     const userId = await requireUser();

     if (!userId) {
       return unauthorized();
     }

     const body = await readJson(request);

     if (!body) {
       return invalidJson();
     }

     const result = apiTaskSchema.safeParse(toTaskInput(body));

     if (!result.success) {
       return validationError(result.error.flatten().fieldErrors);
     }

     // วิชาที่เลือกต้องเป็นของผู้ใช้คนนี้จริง
     const subject = await prisma.subject.findFirst({
       where: { id: Number(result.data.subjectId), userId },
       select: { id: true },
     });

     if (!subject) {
       return validationError({ subjectId: ["วิชาที่เลือกไม่ถูกต้อง"] });
     }

     try {
       const task = await prisma.task.create({
         data: {
           title: result.data.title,
           description: result.data.description || null,
           dueDate: new Date(`${result.data.dueDate}T00:00:00.000Z`),
           subjectId: subject.id,
           userId,
         },
         include,
       });

       return NextResponse.json(task, { status: 201 });
     } catch {
       return serverError("ไม่สามารถสร้างงานได้");
     }
   }