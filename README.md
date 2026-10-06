# نظام إدخال بيانات غرف المشورة

تطبيق ويب لإدخال بيانات عيادات المشورة في وزارة الصحة والسكان، يحل محل ملفات Excel ويسمح بالبحث التلقائي وتعبئة بيانات الزيارات السابقة.

## المميزات

- ✅ **بحث ذكي** بالاسم أو الرقم القومي (عند فتح زيارة جديدة، تظهر بيانات الزيارات السابقة تلقائياً)
- ✅ **4 أنواع مشورة** بنفس بنية ملف Excel الأصلي:
  - مشورة ما قبل الزواج
  - سجل مشورة الأطفال
  - المشورة الأسرية للحامل
  - المشورة الأسرية لتنظيم الأسرة
- ✅ **رفع ملفات Excel القديمة** لاستيراد الزيارات الموجودة إلى قاعدة البيانات
- ✅ **لوحة تحكم** بإحصائيات (عدد الزيارات، أعلى المدخلين، الزيارات الشهرية)
- ✅ **تقارير قابلة للتصدير** بصيغة PDF و Excel (بالأعمدة الأصلية للملف)
- ✅ **إدارة المدخلين** (الاسم، الرقم القومي، الكود، التخصص، أيام العمل، التدريبات)
- ✅ **صلاحيات** (مدير النظام / مدخل)
- ✅ **واجهة عربية بالكامل** مع RTL

---

## التقنيات المستخدمة

- **Next.js 14** (App Router) + TypeScript
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS** + Cairo font
- **SheetJS (xlsx)** لاستيراد وتصدير Excel
- **jsPDF + jspdf-autotable** لتصدير PDF
- **Recharts** للرسوم البيانية
- **Lucide React** للأيقونات

---

## خطوات التشغيل على Vercel

### 1) تجهيز قاعدة البيانات Supabase

1. افتح [supabase.com](https://supabase.com) وأنشئ مشروع جديد (لو لسه ما عملتش).
2. من القائمة الجانبية اذهب إلى **SQL Editor** > **New query**.
3. انسخ محتوى الملف `sql/001_schema.sql` والصقه وشغّله.
4. (اختياري) شغّل `sql/002_seed_admin.sql` لاحقاً بعد إنشاء أول مستخدم.

### 2) إنشاء أول مستخدم (مدير النظام)

1. من Supabase اذهب إلى **Authentication** > **Users** > **Add user** > **Create new user**.
2. أدخل البريد الإلكتروني وكلمة مرور.
3. بعد إنشاء المستخدم، انسخ الـ **User UID**.
4. افتح SQL Editor مرة أخرى وشغّل:
   ```sql
   insert into public.counselors (
     user_id, full_name, national_id, phone, email, employee_code,
     specialty, is_active, is_admin
   ) values (
     'PASTE-USER-UID-HERE',
     'مدير النظام',
     '00000000000000',
     '01000000000',
     'admin@example.com',
     'ADMIN-001',
     'مدير',
     true,
     true
   );
   ```

### 3) النشر على Vercel

#### الطريقة الأولى: من خلال الواجهة
1. ارفع المشروع على GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-repo/counseling-app.git
   git push -u origin main
   ```
2. اذهب إلى [vercel.com](https://vercel.com) > **New Project** > اختر الـ repo.
3. في **Environment Variables** أضف:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://YOUR-PROJECT.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = الـ anon key من Supabase
4. اضغط **Deploy**.

#### الطريقة الثانية: من خلال Vercel CLI
```bash
npm install -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod
```

### 4) (اختياري) الإعدادات المحلية للتطوير

```bash
# استنساخ المشروع
npm install

# إنشاء ملف البيئة
cp .env.example .env.local
# عدّل القيم في .env.local

# تشغيل في وضع التطوير
npm run dev
```

---

## بنية قاعدة البيانات

| الجدول | الوصف |
|--------|------|
| `counselors` | مقدمو المشورة (المدخلون) |
| `clients` | بيانات العميل الأساسية (الاسم، الرقم القومي) - مربوط بنوع المشورة |
| `visits` | الزيارات الفردية (بما فيها بيانات الجلسة + JSON للبيانات النوعية) |

### Row Level Security

- **الزوار بدون تسجيل دخول**: لا يستطيعون رؤية أي شيء
- **المدخلون (counselors)**: قراءة وكتابة على كل البيانات
- **المديرون (is_admin=true)**: بالإضافة إلى تعديل قائمة المدخلين

---

## سير العمل الموصى به

1. **مدير النظام** يسجل الدخول، يضيف المدخلين (الاسم، الكود، التخصص، أيام العمل، التدريبات) ويربط كل واحد بحساب Supabase Auth
2. **المدخل** يسجل الدخول
3. يضغط **زيارة جديدة** > يختار نوع المشورة > يبحث بالاسم أو الرقم القومي
4. لو العميل موجود، **تظهر بياناته الأساسية تلقائياً** (الاسم، الرقم القومي، الموبايل، إلخ)
5. المدخل فقط يضيف بيانات الجلسة (رقم اللقاء، الموضوعات، التاريخ، الملاحظات)
6. **زر حفظ** يحفظ في قاعدة البيانات
7. من صفحة **التقارير** يمكن فلترة الزيارات حسب التاريخ/النوع/المدخل وتصدير PDF أو Excel
8. من صفحة **رفع ملف قديم** يمكن استيراد ملفات Excel القديمة دفعة واحدة

---

## الترخيص

هذا التطبيق مخصص لوزارة الصحة والسكان - مصر.
