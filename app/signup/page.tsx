   "use client";

   import Link from "next/link";
   import { signIn } from "next-auth/react";
   import { useActionState, useEffect, useState } from "react";
   import { useRouter } from "next/navigation";

   import GoogleButton from "@/app/components/google-button";
   import { signUp, type SignUpState } from "@/app/signup/actions";

   const initialState: SignUpState = {};

   const labelClass = "mb-1.5 block text-sm font-medium";
   const inputClass =
     "w-full rounded-md border border-line bg-sheet px-3 py-2 disabled:bg-paper";

   export default function SignUpPage() {
     const router = useRouter();

     const [state, formAction, pending] = useActionState(signUp, initialState);
     const [googlePending, setGooglePending] = useState(false);

     useEffect(() => {
       if (state.success) {
         router.push("/login?registered=1");
       }
     }, [state.success, router]);

     async function googleSignIn() {
       setGooglePending(true);

       await signIn("google", {
         callbackUrl: "/tasks",
       });
     }

     return (
       <main className="flex min-h-screen items-center justify-center px-4 py-10">
         <div className="w-full max-w-md">
           <div className="mb-6 text-center">
             <p className="text-sm font-semibold tracking-wide">
               <span className="bg-linear-to-t from-mark from-40% to-transparent to-40% px-1">
                 Task Tracker
               </span>
             </p>

             <h1 className="mt-4 text-2xl font-semibold">สมัครสมาชิก</h1>

             <p className="mt-1 text-ink-soft">สร้างบัญชีเพื่อเริ่มจดงาน</p>
           </div>

           <div className="rounded-lg border border-line bg-sheet p-6 sm:p-8">
             <form action={formAction} className="space-y-4">
               <div>
                 <label htmlFor="name" className={labelClass}>
                   ชื่อ
                 </label>

                 <input
                   id="name"
                   name="name"
                   type="text"
                   placeholder="ชื่อของคุณ"
                   disabled={pending}
                   className={inputClass}
                   required
                 />
               </div>

               <div>
                 <label htmlFor="email" className={labelClass}>
                   Email
                 </label>

                 <input
                   id="email"
                   name="email"
                   type="email"
                   placeholder="you@example.com"
                   disabled={pending}
                   className={inputClass}
                   required
                 />
               </div>

               <div>
                 <label htmlFor="password" className={labelClass}>
                   Password
                 </label>

                 <input
                   id="password"
                   name="password"
                   type="password"
                   placeholder="อย่างน้อย 6 ตัวอักษร"
                   minLength={6}
                   disabled={pending}
                   className={inputClass}
                   required
                 />
               </div>

               <div>
                 <label htmlFor="confirmPassword" className={labelClass}>
                   Confirm Password
                 </label>

                 <input
                   id="confirmPassword"
                   name="confirmPassword"
                   type="password"
                   placeholder="กรอกรหัสผ่านอีกครั้ง"
                   minLength={6}
                   disabled={pending}
                   className={inputClass}
                   required
                 />
               </div>

               {state.error && (
                 <div
                   role="alert"
                   className="rounded-md bg-late-soft p-3 text-sm text-late"
                 >
                   {state.error}
                 </div>
               )}

               <button
                 type="submit"
                 disabled={pending || googlePending}
                 className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-sheet hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
               >
                 {pending ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
               </button>
             </form>

             <div className="my-5 flex items-center gap-3 text-sm text-ink-soft">
               <span className="h-px flex-1 bg-line" />
               หรือ
               <span className="h-px flex-1 bg-line" />
             </div>

             <GoogleButton
               label={googlePending ? "กำลังเชื่อมต่อ..." : "สมัครด้วย Google"}
               onClick={googleSignIn}
               disabled={googlePending || pending}
             />

             <p className="mt-3 text-center text-xs text-ink-soft">
               สมัครด้วย Google ไม่ต้องตั้งรหัสผ่าน ระบบสร้างบัญชีให้อัตโนมัติ
             </p>
           </div>

           <p className="mt-6 text-center text-sm text-ink-soft">
             มีบัญชีอยู่แล้ว?
             <Link
               href="/login"
               className="ml-1 font-medium text-focus hover:underline"
             >
               เข้าสู่ระบบ
             </Link>
           </p>
         </div>
       </main>
     );
   }