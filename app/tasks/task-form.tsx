   "use client";

   import { useActionState } from "react";
   import Link from "next/link";

   import type { TaskFormState } from "./constants";

   type TaskFormProps = {
     action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
     subjects: { id: number; name: string }[];
     defaultValues?: Record<string, string>;
     submitLabel: string;
   };

   type FieldName = keyof NonNullable<TaskFormState["errors"]>;

   const labelClass = "mb-1.5 block text-sm font-medium";

   export default function TaskForm({
     action,
     subjects,
     defaultValues = {},
     submitLabel,
   }: TaskFormProps) {
     const [state, formAction, pending] = useActionState(action, {
       success: false,
     });

     // ถ้าตรวจไม่ผ่าน ให้ใช้ค่าที่ผู้ใช้เพิ่งกรอก ไม่งั้นใช้ค่าเริ่มต้น
     const values = state.values ?? defaultValues;

     const invalid = (name: FieldName) => Boolean(state.errors?.[name]?.length);

     const fieldClass = (name: FieldName) =>
       `w-full rounded-md border bg-sheet px-3 py-2 disabled:bg-paper ${
         invalid(name) ? "border-late" : "border-line"
       }`;

     const error = (name: FieldName) => {
       const message = state.errors?.[name]?.[0];

       return message ? (
         <p className="mt-1 text-sm text-late">{message}</p>
       ) : null;
     };

     if (subjects.length === 0) {
       return (
         <div className="rounded-lg border border-mark bg-mark-soft p-6">
           <p className="mb-4">
             ยังไม่มีวิชา เพิ่มวิชาของเทอมนี้ก่อน จึงจะเพิ่มงานได้
           </p>

           <Link
             href="/subjects"
             className="inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-sheet hover:bg-ink/90"
           >
             ไปเพิ่มวิชา
           </Link>
         </div>
       );
     }

     return (
       <form
         action={formAction}
         className="space-y-5 rounded-lg border border-line bg-sheet p-6"
       >
         {state.message && (
           <div className="rounded-md bg-late-soft p-3 text-sm text-late">
             {state.message}
           </div>
         )}

         <div>
           <label htmlFor="subjectId" className={labelClass}>
             วิชา
           </label>
           <select
             id="subjectId"
             name="subjectId"
             defaultValue={values.subjectId ?? ""}
             disabled={pending}
             aria-invalid={invalid("subjectId")}
             className={fieldClass("subjectId")}
           >
             <option value="">เลือกวิชา</option>
             {subjects.map((subject) => (
               <option key={subject.id} value={subject.id}>
                 {subject.name}
               </option>
             ))}
           </select>
           {error("subjectId")}

           <p className="mt-1.5 text-sm text-ink-soft">
             ไม่มีวิชาที่ต้องการ?{" "}
             <Link href="/subjects" className="text-focus hover:underline">
               จัดการวิชา
             </Link>
           </p>
         </div>

         <div>
           <label htmlFor="title" className={labelClass}>
             ชื่องาน
           </label>
           <input
             id="title"
             name="title"
             type="text"
             defaultValue={values.title ?? ""}
             disabled={pending}
             aria-invalid={invalid("title")}
             className={fieldClass("title")}
           />
           {error("title")}
         </div>

         <div>
           <label htmlFor="description" className={labelClass}>
             รายละเอียด (ไม่บังคับ)
           </label>
           <textarea
             id="description"
             name="description"
             rows={4}
             defaultValue={values.description ?? ""}
             disabled={pending}
             aria-invalid={invalid("description")}
             className={fieldClass("description")}
           />
           {error("description")}
         </div>

         <div>
           <label htmlFor="dueDate" className={labelClass}>
             กำหนดส่ง
           </label>
           <input
             id="dueDate"
             name="dueDate"
             type="date"
             defaultValue={values.dueDate ?? ""}
             disabled={pending}
             aria-invalid={invalid("dueDate")}
             className={fieldClass("dueDate")}
           />
           {error("dueDate")}
         </div>

         <div className="flex gap-3 pt-2">
           <button
             type="submit"
             disabled={pending}
             className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-sheet hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
           >
             {pending ? "กำลังบันทึก..." : submitLabel}
           </button>

           <Link
             href="/tasks"
             className="rounded-md border border-line px-5 py-2 text-sm font-medium hover:bg-paper"
           >
             ยกเลิก
           </Link>
         </div>
       </form>
     );
   }