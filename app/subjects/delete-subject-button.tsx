   "use client";

   import { TrashIcon } from "@/app/components/icons";
   import { deleteSubject } from "./actions";

   export default function DeleteSubjectButton({ id }: { id: number }) {
     async function handleDelete() {
       const confirmed = window.confirm("คุณต้องการลบวิชานี้ใช่หรือไม่?");

       if (!confirmed) {
         return;
       }

       const result = await deleteSubject(id);

       if (!result.ok && result.message) {
         window.alert(result.message);
       }
     }

     return (
       <button
         type="button"
         onClick={handleDelete}
         aria-label="ลบวิชา"
         title="ลบ"
         className="rounded-md p-2 text-ink-soft hover:bg-late-soft hover:text-late"
       >
         <TrashIcon className="h-5 w-5" />
       </button>
     );
   }