   import Link from "next/link";
   import { redirect } from "next/navigation";

   import { auth } from "@/app/auth";
   import AppHeader from "@/app/components/app-header";
   import { PencilIcon } from "@/app/components/icons";
   import prisma from "@/app/lib/prisma";
   import { markTaskDone } from "./actions";
   import { STATUSES, STATUS_LABELS } from "./constants";
   import DeleteButton from "./delete-button";
   import {
     daysUntilDue,
     getDueState,
     overdueBefore,
     soonUntil,
     type DueState,
   } from "./due";
   import SearchForm from "./search-form";
   import { sortTasks } from "./sort";

   const STRIPE: Record<DueState, string> = {
     done: "border-done",
     overdue: "border-late",
     soon: "border-mark",
     normal: "border-transparent",
   };

   const HIGHLIGHT = "bg-[linear-gradient(transparent_55%,var(--color-mark)_55%)]";

   type TasksPageProps = {
     searchParams: Promise<Record<string, string | string[] | undefined>>;
   };

   // อ่านค่าจาก URL เป็นข้อความ (ถ้าไม่มีหรือส่งมาซ้ำหลายค่า ให้เป็นค่าว่าง)
   const pick = (value: string | string[] | undefined) =>
     typeof value === "string" ? value : "";

   function dueLabel(days: number) {
     if (days < 0) return `เลยมา ${-days} วัน`;
     if (days === 0) return "ส่งวันนี้";
     if (days === 1) return "ส่งพรุ่งนี้";

     return `อีก ${days} วัน`;
   }

   function Stat({
     value,
     label,
     tone,
   }: {
     value: number;
     label: string;
     tone?: "soon" | "late";
   }) {
     return (
       <div className="bg-sheet px-4 py-3">
         <p
           className={`text-2xl font-semibold tabular-nums ${
             tone === "late" && value > 0 ? "text-late" : ""
           }`}
         >
           <span className={tone === "soon" && value > 0 ? HIGHLIGHT : ""}>
             {value}
           </span>
         </p>

         <p className="text-sm text-ink-soft">{label}</p>
       </div>
     );
   }

   export default async function TasksPage({ searchParams }: TasksPageProps) {
     const session = await auth();

     if (!session?.user?.id) {
       redirect("/login");
     }

     const userId = session.user.id;
     const params = await searchParams;

     const search = pick(params.search).trim();
     const subjectParam = pick(params.subjectId);
     const subjectId = /^\d+$/.test(subjectParam) ? Number(subjectParam) : null;

     // ยอมรับเฉพาะค่าที่อยู่ในรายการ กันคนพิมพ์ค่าแปลก ๆ ใน URL
     const status = STATUSES.find((s) => s === pick(params.status));
     const dueParam = pick(params.due);
     const due = dueParam === "soon" || dueParam === "overdue" ? dueParam : "";

     // eslint-disable-next-line react-hooks/purity
     const now = Date.now();

     const [foundTasks, subjects, total, doneCount, soonCount, overdueCount] =
       await Promise.all([
         prisma.task.findMany({
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
           include: { subject: { select: { name: true } } },
           orderBy: [{ dueDate: "asc" }, { id: "asc" }],
         }),

         prisma.subject.findMany({
           where: { userId },
           select: { id: true, name: true },
           orderBy: { name: "asc" },
         }),

         prisma.task.count({ where: { userId } }),

         prisma.task.count({ where: { userId, status: "DONE" } }),

         prisma.task.count({
           where: {
             userId,
             status: { not: "DONE" },
             dueDate: { gte: overdueBefore(now), lte: soonUntil(now) },
           },
         }),

         prisma.task.count({
           where: {
             userId,
             status: { not: "DONE" },
             dueDate: { lt: overdueBefore(now) },
           },
         }),
       ]);

     const tasks = sortTasks(foundTasks);

     const hasFilter = Boolean(search || subjectId || status || due);

     return (
       <>
         <AppHeader
           userName={session.user.name ?? session.user.email ?? ""}
           current="tasks"
         />

         <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
           <div className="mb-6 flex items-center justify-between gap-4">
             <h1 className="text-2xl font-semibold">งานของฉัน</h1>

             <Link
               href="/tasks/create"
               className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-sheet hover:bg-ink/90"
             >
               เพิ่มงาน
             </Link>
           </div>

           <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
             <Stat value={total} label="งานทั้งหมด" />
             <Stat value={doneCount} label="เสร็จแล้ว" />
             <Stat value={soonCount} label="ใกล้ครบกำหนด" tone="soon" />
             <Stat value={overdueCount} label="เลยกำหนด" tone="late" />
           </div>

           <SearchForm
             search={search}
             subjectId={subjectId ? String(subjectId) : ""}
             status={status ?? ""}
             due={due}
             subjects={subjects}
           />

           {hasFilter && (
             <p className="mb-3 text-sm text-ink-soft">
               พบ {tasks.length} จาก {total} งาน
             </p>
           )}

           <div className="overflow-x-auto rounded-lg border border-line bg-sheet">
             <table className="w-full min-w-[56rem] text-left text-sm">
               <thead>
                 <tr className="border-b border-line text-ink-soft">
                   <th className="px-4 py-3 font-medium">วิชา</th>
                   <th className="px-4 py-3 font-medium">ชื่องาน</th>
                   <th className="px-4 py-3 font-medium">กำหนดส่ง</th>
                   <th className="px-4 py-3 font-medium">รายละเอียด</th>
                   <th className="px-4 py-3 font-medium">สถานะ</th>
                   <th className="px-4 py-3 font-medium">จัดการ</th>
                 </tr>
               </thead>

               <tbody className="divide-y divide-line">
                 {tasks.map((task) => {
                   const dueState = getDueState(task.dueDate, task.status, now);
                   const days = daysUntilDue(task.dueDate, now);
                   const isDone = task.status === "DONE";

                   return (
                     <tr key={task.id} className="align-top">
                       <td
                         className={`border-l-4 px-4 py-3 font-medium ${STRIPE[dueState]}`}
                       >
                         {task.subject.name}
                       </td>

                       <td
                         className={`px-4 py-3 ${
                           isDone ? "text-ink-soft line-through" : ""
                         }`}
                       >
                         {task.title}
                       </td>

                       <td className="px-4 py-3">
                         <p className="tabular-nums">
                           {task.dueDate.toLocaleDateString("th-TH", {
                             year: "numeric",
                             month: "short",
                             day: "numeric",
                             timeZone: "UTC",
                           })}
                         </p>

                         {dueState === "soon" && (
                           <p className="mt-1 flex items-center gap-2 text-xs">
                             <span className="rounded bg-mark px-1.5 py-0.5 font-medium">
                               ใกล้ครบกำหนด
                             </span>
                             <span className="text-ink-soft">{dueLabel(days)}</span>
                           </p>
                         )}

                         {dueState === "overdue" && (
                           <p className="mt-1 flex items-center gap-2 text-xs">
                             <span className="rounded bg-late-soft px-1.5 py-0.5 font-medium text-late">
                               เลยกำหนด
                             </span>
                             <span className="text-ink-soft">{dueLabel(days)}</span>
                           </p>
                         )}
                       </td>

                       <td className="max-w-xs px-4 py-3">
                         {task.description ? (
                           <details>
                             <summary className="cursor-pointer text-focus hover:underline">
                               ดูรายละเอียด
                             </summary>

                             <p className="mt-2 whitespace-pre-wrap break-words text-ink-soft">
                               {task.description}
                             </p>
                           </details>
                         ) : (
                           <span className="text-ink-soft">-</span>
                         )}
                       </td>

                       <td className="px-4 py-3">
                         <span
                           className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                             isDone
                               ? "bg-done-soft text-done"
                               : "bg-paper text-ink-soft"
                           }`}
                         >
                           {STATUS_LABELS[task.status]}
                         </span>
                       </td>

                       <td className="px-4 py-3">
                         <div className="flex flex-wrap items-center gap-1">
                           {!isDone && (
                             <form action={markTaskDone.bind(null, task.id)}>
                               <button
                                 type="submit"
                                 className="rounded-md border border-done px-3 py-1.5 text-sm font-medium text-done hover:bg-done-soft"
                               >
                                 เสร็จแล้ว
                               </button>
                             </form>
                           )}

                           <Link
                             href={`/tasks/${task.id}/edit`}
                             aria-label="แก้ไขงาน"
                             title="แก้ไข"
                             className="rounded-md p-2 text-ink-soft hover:bg-paper hover:text-ink"
                           >
                             <PencilIcon className="h-5 w-5" />
                           </Link>

                           <DeleteButton id={task.id} />
                         </div>
                       </td>
                     </tr>
                   );
                 })}

                 {tasks.length === 0 && (
                   <tr>
                     <td
                       colSpan={6}
                       className="px-4 py-10 text-center text-ink-soft"
                     >
                       {hasFilter ? (
                         "ไม่พบงานที่ตรงกับเงื่อนไขที่ค้นหา ลองเปลี่ยนคำค้นหรือกด “ล้าง”"
                       ) : subjects.length === 0 ? (
                         <>
                           เริ่มจากเพิ่มวิชาของเทอมนี้ที่{" "}
                           <Link
                             href="/subjects"
                             className="font-medium text-focus hover:underline"
                           >
                             หน้าวิชา
                           </Link>{" "}
                           แล้วค่อยเพิ่มงาน
                         </>
                       ) : (
                         "ยังไม่มีงาน กด “เพิ่มงาน” เพื่อเริ่มต้น"
                       )}
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         </main>
       </>
     );
   }