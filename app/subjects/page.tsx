   import { redirect } from "next/navigation";

   import { auth } from "@/app/auth";
   import AppHeader from "@/app/components/app-header";
   import prisma from "@/app/lib/prisma";
   import DeleteSubjectButton from "./delete-subject-button";
   import SubjectForm from "./subject-form";

   export default async function SubjectsPage() {
     const session = await auth();

     if (!session?.user?.id) {
       redirect("/login");
     }

     const subjects = await prisma.subject.findMany({
       where: { userId: session.user.id },
       include: { _count: { select: { tasks: true } } },
       orderBy: { name: "asc" },
     });

     return (
       <>
         <AppHeader
           userName={session.user.name ?? session.user.email ?? ""}
           current="subjects"
         />

         <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
           <h1 className="text-2xl font-semibold">วิชาเทอมนี้</h1>

           <p className="mb-6 mt-1 text-ink-soft">
             เพิ่มวิชาไว้ก่อน แล้วเลือกจากรายการตอนเพิ่มงาน
           </p>

           <SubjectForm />

           <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-sheet">
             {subjects.map((subject) => (
               <li
                 key={subject.id}
                 className="flex items-center justify-between gap-4 px-4 py-3"
               >
                 <div>
                   <p className="font-medium">{subject.name}</p>

                   <p className="text-sm text-ink-soft">
                     {subject._count.tasks === 0
                       ? "ยังไม่มีงาน"
                       : `${subject._count.tasks} งาน`}
                   </p>
                 </div>

                 <DeleteSubjectButton id={subject.id} />
               </li>
             ))}

             {subjects.length === 0 && (
               <li className="px-4 py-10 text-center text-ink-soft">
                 ยังไม่มีวิชา พิมพ์ชื่อวิชาในช่องด้านบนแล้วกด “เพิ่มวิชา”
               </li>
             )}
           </ul>
         </main>
       </>
     );
   }