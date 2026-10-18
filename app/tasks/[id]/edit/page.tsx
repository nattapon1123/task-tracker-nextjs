   import Link from "next/link";
   import { notFound, redirect } from "next/navigation";

   import { auth } from "@/app/auth";
   import AppHeader from "@/app/components/app-header";
   import prisma from "@/app/lib/prisma";
   import { updateTask } from "../../actions";
   import TaskForm from "../../task-form";

   type EditTaskPageProps = {
     params: Promise<{
       id: string;
     }>;
   };

   export default async function EditTaskPage({ params }: EditTaskPageProps) {
     const session = await auth();

     if (!session?.user?.id) {
       redirect("/login");
     }

     const userId = session.user.id;
     const { id } = await params;
     const taskId = Number(id);

     if (!Number.isInteger(taskId)) {
       notFound();
     }

     const [task, subjects] = await Promise.all([
       prisma.task.findFirst({
         where: { id: taskId, userId },
       }),
       prisma.subject.findMany({
         where: { userId },
         select: { id: true, name: true },
         orderBy: { name: "asc" },
       }),
     ]);

     if (!task) {
       notFound();
     }

     return (
       <>
         <AppHeader
           userName={session.user.name ?? session.user.email ?? ""}
           current="tasks"
         />

         <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
           <Link href="/tasks" className="text-sm text-ink-soft hover:text-ink">
             กลับไปงานของฉัน
           </Link>

           <h1 className="mb-6 mt-2 text-2xl font-semibold">แก้ไขงาน</h1>

           <TaskForm
             action={updateTask.bind(null, task.id)}
             subjects={subjects}
             submitLabel="บันทึกการแก้ไข"
             defaultValues={{
               title: task.title,
               subjectId: String(task.subjectId),
               description: task.description ?? "",
               dueDate: task.dueDate.toISOString().slice(0, 10),
             }}
           />
         </main>
       </>
     );
   }