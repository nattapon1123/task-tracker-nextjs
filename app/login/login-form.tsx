   "use client";

   import Link from "next/link";
   import { signIn } from "next-auth/react";
   import { useState } from "react";
   import { useRouter } from "next/navigation";

   import GoogleButton from "@/app/components/google-button";

   type LoginFormProps = {
     registered: boolean;
     urlError: string;
   };

   function urlErrorMessage(code: string) {
     if (!code) return "";

     if (code === "password") {
       return "อีเมลนี้สมัครไว้ด้วยรหัสผ่านแล้ว กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน";
     }

     if (code === "AccessDenied") {
       return "ไม่สามารถเข้าสู่ระบบด้วย Google ได้ (อีเมลต้องผ่านการยืนยันกับ Google)";
     }

     return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
   }

   export default function LoginForm({ registered, urlError }: LoginFormProps) {
     const router = useRouter();

     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [error, setError] = useState("");
     const [pending, setPending] = useState(false);

     const shownError = error || urlErrorMessage(urlError);

     async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
       e.preventDefault();

       setError("");
       setPending(true);

       try {
         const result = await signIn("credentials", {
           // ตอนสมัครเราเก็บอีเมลเป็นตัวพิมพ์เล็ก จึงต้องแปลงตอน Login ด้วย
           email: email.trim().toLowerCase(),
           password,
           redirect: false,
         });

         if (result?.error) {
           setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
           return;
         }

         router.push("/tasks");
         router.refresh();
       } catch {
         setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
       } finally {
         setPending(false);
       }
     }

     async function googleSignIn() {
       setPending(true);

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

             <h1 className="mt-4 text-2xl font-semibold">เข้าสู่ระบบ</h1>

             <p className="mt-1 text-ink-soft">
               รวมงานและการบ้านทุกวิชาไว้ในที่เดียว
             </p>
           </div>

           <div className="rounded-lg border border-line bg-sheet p-6 sm:p-8">
             {registered && (
               <div className="mb-4 rounded-md bg-done-soft p-3 text-sm text-done">
                 สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ
               </div>
             )}

             {shownError && (
               <div
                 role="alert"
                 className="mb-4 rounded-md bg-late-soft p-3 text-sm text-late"
               >
                 {shownError}
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label
                   htmlFor="email"
                   className="mb-1.5 block text-sm font-medium"
                 >
                   Email
                 </label>

                 <input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={pending}
                   placeholder="you@example.com"
                   className="w-full rounded-md border border-line bg-sheet px-3 py-2 disabled:bg-paper"
                   required
                 />
               </div>

               <div>
                 <label
                   htmlFor="password"
                   className="mb-1.5 block text-sm font-medium"
                 >
                   Password
                 </label>

                 <input
                   id="password"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   disabled={pending}
                   className="w-full rounded-md border border-line bg-sheet px-3 py-2 disabled:bg-paper"
                   required
                 />
               </div>

               <button
                 type="submit"
                 disabled={pending}
                 className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-sheet hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
               >
                 {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
               </button>
             </form>

             <div className="my-5 flex items-center gap-3 text-sm text-ink-soft">
               <span className="h-px flex-1 bg-line" />
               หรือ
               <span className="h-px flex-1 bg-line" />
             </div>

             <GoogleButton
               label="เข้าสู่ระบบด้วย Google"
               onClick={googleSignIn}
               disabled={pending}
             />
           </div>

           <p className="mt-6 text-center text-sm text-ink-soft">
             ยังไม่มีบัญชี?
             <Link
               href="/signup"
               className="ml-1 font-medium text-focus hover:underline"
             >
               สมัครสมาชิก
             </Link>
           </p>
         </div>
       </main>
     );
   }