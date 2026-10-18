# Task Tracker (ระบบจัดการงานและการบ้าน)

เว็บสำหรับนักศึกษาใช้จดงานและการบ้านของทุกวิชาไว้ในที่เดียว ดูได้ว่างานไหนใกล้ครบกำหนดหรือเลยกำหนดแล้ว
สร้างด้วย Next.js, Prisma, SQLite และ Auth.js

ผู้จัดทำ: [ชื่อ-นามสกุล] รหัสนักศึกษา [รหัส] วิชา [ชื่อวิชา]

## ฟีเจอร์

- สมัครสมาชิก / เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน หรือด้วย Google
- CRUD งาน: เพิ่ม ดู แก้ไข ลบ และกด "เสร็จแล้ว"
- จัดการวิชาของตัวเอง แล้วเลือกวิชาจากรายการตอนเพิ่มงาน
- ตรวจสอบข้อมูล (Validation) ด้วย Zod ทั้งฝั่งเว็บและ API
- ค้นหา + กรองตามวิชา สถานะ และช่วงกำหนดส่ง
- ไฮไลต์งานที่ใกล้ครบกำหนด (ภายใน 3 วัน) และงานที่เลยกำหนด
- เรียงงานตามกำหนดส่ง โดยงานที่กด "เสร็จแล้ว" จะลงไปอยู่ล่างสุดของตาราง
- REST API: GET / POST / PUT / DELETE
- ผู้ใช้แต่ละคนเห็นและแก้ได้เฉพาะข้อมูลของตัวเอง

## เทคโนโลยีที่ใช้

- Node.js, Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Prisma 7.10 + SQLite (better-sqlite3)
- Auth.js (next-auth v5 beta): Credentials + Google
- Zod, bcryptjs

## วิธีการติดตั้ง

ต้องติดตั้ง [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน LTS) และ Git ก่อน

1. ดาวน์โหลดโปรเจกต์

```bash
   git clone [ลิงก์ repository ของคุณ]
   cd task-tracker
```

2. ติดตั้งแพ็กเกจ

```bash
   npm install
```

   หมายเหตุ: `better-sqlite3` ต้องคอมไพล์ตอนติดตั้ง บน Windows ถ้าขึ้น error ว่าหา Visual Studio ไม่เจอ
   ให้ติดตั้ง "Desktop development with C++" จาก Visual Studio Build Tools แล้วรัน `npm install` ใหม่

3. สร้างไฟล์ `.env` ที่โฟลเดอร์นอกสุด (ระดับเดียวกับ `package.json`)

```
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="ใส่ข้อความสุ่มยาว ๆ"
   AUTH_GOOGLE_ID="Client ID จาก Google"
   AUTH_GOOGLE_SECRET="Client secret จาก Google"
```

   สร้าง `AUTH_SECRET` ได้ด้วยคำสั่ง `npx auth secret` หรือ `openssl rand -base64 32`

4. ตั้งค่า Google Login

   - เข้า [Google Cloud Console](https://console.cloud.google.com/) สร้างโปรเจกต์
   - ไปที่ APIs & Services > OAuth consent screen ตั้งค่าให้เรียบร้อย
   - ไปที่ Credentials > Create credentials > OAuth client ID ชนิด Web application
   - ใส่ Authorized redirect URI เป็น `http://localhost:3000/api/auth/callback/google`
   - นำ Client ID และ Client secret ไปใส่ใน `.env`

   หมายเหตุ: ถ้าไม่ตั้งค่าส่วนนี้ ปุ่ม Google จะใช้ไม่ได้ แต่สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมลและรหัสผ่านได้ตามปกติ
   ถ้าแอปใน Google Cloud ยังอยู่ในโหมด Testing ต้องเพิ่มอีเมลที่จะใช้ทดสอบไว้ในรายการ "Test users" ก่อน

5. สร้างฐานข้อมูลและ Prisma Client

```bash
   npx prisma migrate dev
   npx prisma generate
```

6. เปิดเซิร์ฟเวอร์

```bash
   npm run dev
```

   เปิดเบราว์เซอร์ไปที่ http://localhost:3000

## วิธีการใช้งาน

| การทำงาน | วิธีใช้ |
| --- | --- |
| สมัครสมาชิก | ไปที่ `/signup` กรอกข้อมูล หรือกด "สมัครด้วย Google" |
| เข้าสู่ระบบ | ไปที่ `/login` |
| เพิ่มวิชา | เมนู "วิชา" พิมพ์ชื่อวิชาแล้วกด "เพิ่มวิชา" |
| เพิ่มงาน | หน้า "งานของฉัน" กด "เพิ่มงาน" เลือกวิชา ใส่ชื่องานและกำหนดส่ง |
| แก้ไข / ลบงาน | กดไอคอนปากกา / ถังขยะที่แถวของงาน |
| ทำเครื่องหมายเสร็จ | กดปุ่ม "เสร็จแล้ว" ที่แถวของงาน งานจะลงไปอยู่ล่างสุดของตาราง |
| ค้นหา / กรอง | ใช้แถบค้นหาด้านบนตาราง เลือกวิชา สถานะ หรือช่วงกำหนดส่ง |

หมายเหตุ: วิชาที่ยังมีงานอยู่จะลบไม่ได้ ต้องลบหรือย้ายงานก่อน

## API

ทุกเส้นทางต้องเข้าสู่ระบบก่อน (ใช้ session cookie เดียวกับหน้าเว็บ) ถ้าไม่ได้เข้าสู่ระบบจะได้ 401

| Method | Path | คำอธิบาย |
| --- | --- | --- |
| GET | `/api/tasks` | ดูรายการงานของตัวเอง รองรับ `?search=`, `?subjectId=`, `?status=TODO\|DONE`, `?due=overdue\|soon` |
| POST | `/api/tasks` | เพิ่มงาน |
| GET | `/api/tasks/:id` | ดูงานชิ้นเดียว |
| PUT | `/api/tasks/:id` | แก้ไขงาน (ส่ง `status` ได้ด้วย: `TODO` หรือ `DONE`) |
| DELETE | `/api/tasks/:id` | ลบงาน |

ตัวอย่าง body สำหรับ POST / PUT

```json
{
  "title": "ส่งรายงานบทที่ 1",
  "subjectId": 1,
  "description": "ไม่บังคับ",
  "dueDate": "2026-11-05"
}
```

- `subjectId` ต้องเป็น id ของวิชาของผู้ใช้ที่เข้าสู่ระบบอยู่
- `dueDate` ต้องเป็นรูปแบบ `YYYY-MM-DD` และเป็นวันที่ที่มีอยู่จริง
- สำเร็จ: 200 (ดู / แก้ / ลบ) และ 201 (เพิ่มงาน)
- ข้อมูลไม่ถูกต้อง: 400 / ยังไม่ได้เข้าสู่ระบบ: 401 / ไม่พบงาน (หรือไม่ใช่ของผู้ใช้นี้): 404

## โครงสร้างโปรเจกต์

```
task-tracker/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── tasks/ (route.ts, helpers.ts, [id]/route.ts)
│   ├── components/ (app-header, google-button, icons)
│   ├── lib/prisma.ts
│   ├── login/
│   ├── signup/
│   ├── subjects/
│   ├── tasks/ (หน้ารายการ, create, [id]/edit, actions, validation, due, sort)
│   ├── auth.ts
│   ├── globals.css
│   └── layout.tsx
├── prisma/ (schema.prisma, migrations/)
├── next-auth.d.ts
└── postcss.config.mjs
```