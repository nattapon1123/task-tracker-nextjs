   import Link from "next/link";
   import { redirect } from "next/navigation";

   import { auth } from "@/app/auth";
   import AppHeader from "@/app/components/app-header";
   import prisma from "@/app/lib/prisma";
   import { createTask } from "../actions";
   import TaskForm from "../task-form";

   export default async function CreateTaskPage() {
     const session = await auth();

     if (!session?.user?.id) {
       redirect("/login");
     }

     const subjects = await prisma.subject.findMany({
       where: { userId: session.user.id },
       select: { id: true, name: true },
       orderBy: { name: "asc" },
     });

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

           <h1 className="mb-6 mt-2 text-2xl font-semibold">เพิ่มงาน</h1>

           <TaskForm
             action={createTask}
             subjects={subjects}
             submitLabel="บันทึกงาน"
           />
         </main>
       </>
     );
   }