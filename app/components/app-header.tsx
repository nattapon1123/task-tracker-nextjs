   import Link from "next/link";

   import { signOut } from "@/app/auth";

   type AppHeaderProps = {
     userName: string;
     current?: "tasks" | "subjects";
   };

   const links = [
     { key: "tasks", href: "/tasks", label: "งานของฉัน" },
     { key: "subjects", href: "/subjects", label: "วิชา" },
   ] as const;

   export default function AppHeader({ userName, current }: AppHeaderProps) {
     return (
       <header className="border-b border-line bg-sheet">
         <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
           <div className="flex items-center gap-5 sm:gap-8">
             <Link href="/tasks" className="flex items-center gap-2 font-semibold">
               <span
                 aria-hidden="true"
                 className="grid h-7 w-7 place-items-center rounded-md bg-ink text-sheet"
               >
                 <svg
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth={2.5}
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   className="h-4 w-4"
                 >
                   <path d="M5 12.5l4.5 4.5L19 7.5" />
                 </svg>
               </span>
               Task Tracker
             </Link>

             <nav aria-label="เมนูหลัก" className="flex gap-4">
               {links.map((link) => (
                 <Link
                   key={link.key}
                   href={link.href}
                   aria-current={current === link.key ? "page" : undefined}
                   className={`px-0.5 text-sm font-medium ${
                     current === link.key
                       ? "bg-[linear-gradient(transparent_60%,var(--color-mark)_60%)]"
                       : "text-ink-soft hover:text-ink"
                   }`}
                 >
                   {link.label}
                 </Link>
               ))}
             </nav>
           </div>

           <div className="flex items-center gap-3">
             <span className="hidden max-w-48 truncate text-sm text-ink-soft sm:block">
               {userName}
             </span>

             <form
               action={async () => {
                 "use server";
                 await signOut({ redirectTo: "/login" });
               }}
             >
               <button
                 type="submit"
                 className="rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:bg-paper"
               >
                 ออกจากระบบ
               </button>
             </form>
           </div>
         </div>
       </header>
     );
   }