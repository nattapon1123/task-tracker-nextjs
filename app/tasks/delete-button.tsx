   "use client";

   import { TrashIcon } from "@/app/components/icons";
   import { deleteTask } from "./actions";

   export default function DeleteButton({ id }: { id: number }) {
     async function handleDelete() {
       const confirmed = window.confirm("คุณต้องการลบงานนี้ใช่หรือไม่?");

       if (!confirmed) {
         return;
       }

       await deleteTask(id);
     }

     return (
       <button
         type="button"
         onClick={handleDelete}
         aria-label="ลบงาน"
         title="ลบ"
         className="rounded-md p-2 text-ink-soft hover:bg-late-soft hover:text-late"
       >
         <TrashIcon className="h-5 w-5" />
       </button>
     );
   }