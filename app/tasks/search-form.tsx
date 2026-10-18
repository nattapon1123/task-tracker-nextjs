   import Link from "next/link";

   import { STATUSES, STATUS_LABELS } from "./constants";

   type SearchFormProps = {
     search: string;
     subjectId: string;
     status: string;
     due: string;
     subjects: { id: number; name: string }[];
   };

   const inputClass =
     "w-full rounded-md border border-line bg-sheet px-3 py-2 text-sm";
   const labelClass = "mb-1 block text-xs font-medium text-ink-soft";

   export default function SearchForm({
     search,
     subjectId,
     status,
     due,
     subjects,
   }: SearchFormProps) {
     return (
       <form
         method="GET"
         action="/tasks"
         className="mb-4 rounded-lg border border-line bg-sheet p-4"
       >
         <div className="grid gap-3 md:grid-cols-4">
           <div className="md:col-span-4">
             <label htmlFor="search" className={labelClass}>
               ค้นหา
             </label>
             <input
               id="search"
               name="search"
               type="text"
               defaultValue={search}
               placeholder="ค้นหาจากวิชาหรือชื่องาน"
               className={inputClass}
             />
           </div>

           <div>
             <label htmlFor="subjectId" className={labelClass}>
               วิชา
             </label>
             <select
               id="subjectId"
               name="subjectId"
               defaultValue={subjectId}
               className={inputClass}
             >
               <option value="">ทุกวิชา</option>
               {subjects.map((s) => (
                 <option key={s.id} value={s.id}>
                   {s.name}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label htmlFor="status" className={labelClass}>
               สถานะ
             </label>
             <select
               id="status"
               name="status"
               defaultValue={status}
               className={inputClass}
             >
               <option value="">ทั้งหมด</option>
               {STATUSES.map((s) => (
                 <option key={s} value={s}>
                   {STATUS_LABELS[s]}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label htmlFor="due" className={labelClass}>
               กำหนดส่ง
             </label>
             <select
               id="due"
               name="due"
               defaultValue={due}
               className={inputClass}
             >
               <option value="">ทั้งหมด</option>
               <option value="soon">ใกล้ครบกำหนด</option>
               <option value="overdue">เลยกำหนด</option>
             </select>
           </div>

           <div className="flex items-end gap-2">
             <button
               type="submit"
               className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-sheet hover:bg-ink/90"
             >
               ค้นหา
             </button>

             <Link
               href="/tasks"
               className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
             >
               ล้าง
             </Link>
           </div>
         </div>
       </form>
     );
   }