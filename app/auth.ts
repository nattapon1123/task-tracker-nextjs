   import NextAuth from "next-auth";
   import Credentials from "next-auth/providers/credentials";
   import Google from "next-auth/providers/google";
   import bcrypt from "bcryptjs";

   import prisma from "@/app/lib/prisma";

   export const { handlers, signIn, signOut, auth } = NextAuth({
     providers: [
       Credentials({
         credentials: {
           email: {},
           password: {},
         },

         async authorize(credentials) {
           if (!credentials?.email || !credentials?.password) {
             return null;
           }

           const email = credentials.email as string;
           const password = credentials.password as string;

           const user = await prisma.user.findUnique({
             where: {
               email,
             },
           });

           // บัญชีที่สมัครผ่าน Google ไม่มีรหัสผ่าน จึง Login ด้วยรหัสผ่านไม่ได้
           if (!user || !user.passwordHash) {
             return null;
           }

           const passwordValid = await bcrypt.compare(password, user.passwordHash);

           if (!passwordValid) {
             return null;
           }

           return {
             id: user.id,
             name: user.name,
             email: user.email,
             role: user.role,
           };
         },
       }),

       // อ่านค่า AUTH_GOOGLE_ID และ AUTH_GOOGLE_SECRET จาก .env ให้เอง
       Google,
     ],

     callbacks: {
       async signIn({ account, profile }) {
         if (account?.provider !== "google") {
           return true;
         }

         const email = profile?.email?.toLowerCase();

         // รับเฉพาะอีเมลที่ Google ยืนยันแล้ว
         if (!email || profile?.email_verified !== true) {
           return false;
         }

         const existing = await prisma.user.findUnique({
           where: { email },
         });

         // อีเมลนี้เคยสมัครด้วยรหัสผ่านไว้ ไม่ผูกบัญชีให้อัตโนมัติ
         if (existing?.passwordHash) {
           return "/login?error=password";
         }

         if (!existing) {
           await prisma.user.create({
             data: {
               email,
               name: profile?.name ?? null,
               role: "USER",
             },
           });
         }

         return true;
       },

       async jwt({ token, user, account }) {
         if (account?.provider === "google") {
           // ใช้ id และ role จากฐานข้อมูลของเรา ไม่ใช่ id ของ Google
           const dbUser = await prisma.user.findUnique({
             where: { email: (token.email ?? "").toLowerCase() },
           });

           if (dbUser) {
             token.id = dbUser.id;
             token.role = dbUser.role;
           }
         } else if (user) {
           token.id = user.id;
           token.role = user.role ?? "USER";
         }

         return token;
       },

       async session({ session, token }) {
         if (session.user) {
           session.user.id = token.id as string;
           session.user.role = (token.role as string) || "USER";
         }

         return session;
       },
     },

     pages: {
       signIn: "/login",
     },

     session: {
       strategy: "jwt",
     },
   });