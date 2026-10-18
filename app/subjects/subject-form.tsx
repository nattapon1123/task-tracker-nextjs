   "use client";

   import { useActionState } from "react";

   import { createSubject, type SubjectFormState } from "./actions";

   const initialState: SubjectFormState = { success: false };

   export default function SubjectForm() {
     const [state, formAction, pending] = useActionState(
       createSubject,
       initialState,
     );

     return (
       <form action={formAction} className="mb-6">
         <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
           ชื่อวิชา
         </label>

         <div className="flex gap-2">
           <input
             id="name"
             name="name"
             type="text"
             placeholder="เช่น Web Programming"
             disabled={pending}
             aria-invalid={Boolean(state.error)}
             className={`w-full rounded-md border bg-sheet px-3 py-2 disabled:bg-paper ${
               state.error ? "border-late" : "border-line"
             }`}
           />

           <button
             type="submit"
             disabled={pending}
             className="whitespace-nowrap rounded-md bg-ink px-5 py-2 text-sm font-medium text-sheet hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
           >
             {pending ? "กำลังเพิ่ม..." : "เพิ่มวิชา"}
           </button>
         </div>

         {state.error && (
           <p className="mt-1.5 text-sm text-late">{state.error}</p>
         )}
       </form>
     );
   }