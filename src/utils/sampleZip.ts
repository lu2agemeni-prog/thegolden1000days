import JSZip from 'jszip';

export async function generateSampleZip(): Promise<Blob> {
  const zip = new JSZip();

  // 1. Readme
  const readmeContent = `# مرحباً بك في مستعرض الملفات المضغوطة (Zip Studio)! 🚀
Welcome to Zip Studio - Your Modern In-Browser Zip Manager.

هذا ملف تجريبي لاختبار إمكانيات التطبيق:
1. **استعراض وتصفح المجلدات والملفات** بشكل شجري أو كجدول أو شبكة.
2. **معاينة الأكواد والنصوص والصور والملفات** مباشرة داخل المتصفح.
3. **تعديل الملفات النصية** وإعادة حفظها داخل الأرشيف.
4. **إضافة ملفات جديدة** أو إنشاء مجلدات وملفات من داخل التطبيق.
5. **استخراج أو تحميل** أي ملف أو كل الملفات دفعة واحدة بأعلى سرعة وخصوصية تامة 100%.

---
مع تحيات فريق العمل!
`;
  zip.file('README.md', readmeContent);

  // 2. config/settings.json
  const configContent = JSON.stringify({
    appName: "Zip Studio",
    version: "2.4.0",
    theme: "dark",
    features: {
      clientSideExtraction: true,
      instantPreview: true,
      dragAndDrop: true,
      bilingualSupport: ["ar", "en"],
      recompression: true
    },
    system: {
      platform: "Web Browser",
      maxSizeMB: 500,
      safeMode: true
    }
  }, null, 2);
  zip.file('config/settings.json', configContent);

  // 3. src/index.ts
  const tsContent = `// TypeScript Sample File
interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  lastActive: Date;
}

export function greetUser(user: UserProfile): string {
  return \`أهلاً بك يا \${user.name}! رتبتك هي: \${user.role}\`;
}

const sampleUser: UserProfile = {
  id: 'usr_102',
  name: 'أحمد محمود',
  role: 'admin',
  lastActive: new Date()
};

console.log(greetUser(sampleUser));
`;
  zip.file('src/index.ts', tsContent);

  // 4. src/styles.css
  const cssContent = `/* Modern Design Variables */
:root {
  --primary-accent: #6366f1;
  --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  --card-blur: blur(16px);
  --border-glow: rgba(99, 102, 241, 0.2);
}

.hero-box {
  background: var(--bg-gradient);
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease;
}

.hero-box:hover {
  transform: translateY(-2px);
}
`;
  zip.file('src/styles.css', cssContent);

  // 5. assets/logo.svg
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#grad)" />
  <circle cx="100" cy="100" r="60" fill="white" opacity="0.15" />
  <path d="M70 60h60a10 10 0 0 1 10 10v60a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V70a10 10 0 0 1 10-10z" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M100 60v80M85 80h30M85 100h30M85 120h30" stroke="white" stroke-width="6" stroke-linecap="round"/>
</svg>`;
  zip.file('assets/logo.svg', svgContent);

  // 6. notes/arabic_notes.txt
  const notesContent = `ملاحظات هامة:
- هذا الأرشيف يوضح إمكانية حفظ مجلدات فرعية متداخلة.
- يمكنك إضافة أي ملف جديد بالضغط على زر "إضافة ملف" في الشريط العلوي.
- يمكنك أيضاً تعديل هذا الملف وكتابة ما تشاء ثم الضغط على "حفظ التعديلات".
- سرعة فك الضغط فورية لأنها تتم بالكامل عبر معالج جهازك دون انتظار أي رفع لشبكة الإنترنت.
`;
  zip.file('notes/notes.txt', notesContent);

  return await zip.generateAsync({ type: 'blob' });
}
