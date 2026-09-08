# 🚀 คู่มือการนำระบบ MindNote Student (MNS) ขึ้น Vercel (Deployment Guide)

คู่มือนี้จะแนะนำขั้นตอนการ Deploy ระบบ **MindNote Student** แบบ Full-Stack (React Frontend + Express Serverless Backend) ขึ้นสู่ **Vercel** ภายใน 3-5 นาที

---

## 📋 1. โครงสร้างไฟล์สำหรับ Vercel ที่เตรียมไว้ให้แล้ว
ในโปรเจกต์นี้ได้รับการตั้งค่าพร้อม Deploy ทันที:
1. `vercel.json` — กำหนด Routing ระหว่าง Frontend (React Vite) และ Backend (`/api`)
2. `api/index.js` — Serverless Function Entrypoint ที่เชื่อมต่อกับ Express และ SQLite WASM
3. `package.json` — สคริปต์ `vercel-build` ที่ build ทั้ง Client และเตรียม Serverless อัตโนมัติ

---

## 🛠️ 2. ขั้นตอนการ Deploy ผ่าน Vercel Dashboard (วิธีที่ง่ายที่สุด)

### ขั้นตอนที่ 1: Push โค้ดขึ้น GitHub
1. อัปโหลดโปรเจกต์นี้ขึ้น GitHub Repository ของคุณ (Public หรือ Private ก็ได้)
   ```bash
   git add .
   git commit -m "feat: Ready for Vercel deployment with Google OAuth"
   git push origin main
   ```

### ขั้นตอนที่ 2: Import โปรเจกต์ใน Vercel
1. ไปที่ [vercel.com](https://vercel.com) แล้วล็อกอิน
2. กดปุ่ม **"Add New..."** > **"Project"**
3. เลือก Repository `mindnote-student` จาก GitHub ของคุณ
4. กด **Import**

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables ใน Vercel
ในหน้า **Configure Project** ก่อนกด Deploy ให้เปิดหัวข้อ **Environment Variables** แล้วใส่ค่าดังนี้:

| Key | Value (ตัวอย่าง) | คำอธิบาย |
| :--- | :--- | :--- |
| `JWT_SECRET` | `mns_production_secure_token_key_2026` | คีย์สำหรับเข้ารหัส JWT Token |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | (ถ้ามี) สำหรับ Google Login ฝั่ง Backend |
| `VITE_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | (ถ้ามี) สำหรับ Google Login ฝั่ง Frontend |

*(หากยังไม่มี Google Client ID สามารถเว้นว่างไว้ก่อนได้ ระบบมี Google Sign-In Dialog ให้พร้อมใช้งานทันที)*

### ขั้นตอนที่ 4: กด Deploy! 🚀
* กดปุ่ม **"Deploy"**
* Vercel จะรันคำสั่ง `npm run vercel-build` และ Deploy ทั้งหน้าเว็บและ API ให้อัตโนมัติในเวลาประมาณ 1 นาที
* คุณจะได้รับ URL สำหรับเข้าใช้งานจริง เช่น `https://mindnote-student.vercel.app`

---

## 🔑 3. การตั้งค่า Google OAuth 2.0 (ถ้าต้องการใช้ Google Sign-In จริง)

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่ เช่น `MindNote School`
3. ไปที่ **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
4. เลือก Application type เป็น **Web application**
5. ในช่อง **Authorized JavaScript origins** ให้เพิ่ม:
   - `https://your-project.vercel.app` (URL บน Vercel ของคุณ)
   - `http://localhost:5173` (สำหรับทดสอบในเครื่อง)
6. คัดลอก **Client ID** ที่ได้ มาใส่ใน Environment Variables (`GOOGLE_CLIENT_ID` และ `VITE_GOOGLE_CLIENT_ID`) บน Vercel
