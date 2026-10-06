'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Upload,
  FileText,
  LogOut,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/',            label: 'الرئيسية',       icon: LayoutDashboard },
  { href: '/visits',      label: 'الزيارات',       icon: ClipboardList },
  { href: '/visits/new',  label: 'زيارة جديدة',    icon: Stethoscope },
  { href: '/upload',      label: 'رفع ملف قديم',   icon: Upload },
  { href: '/reports',     label: 'التقارير',       icon: FileText },
  { href: '/counselors',  label: 'المدخلين',       icon: Users },
];

export function AppShell({
  userEmail,
  isAdmin,
  children,
}: {
  userEmail: string;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="md:hidden bg-primary-700 text-white flex items-center justify-between p-4 no-print">
        <div className="font-bold">نظام غرف المشورة</div>
        <button onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${open ? 'block' : 'hidden'} md:block w-full md:w-64 bg-primary-800 text-white md:min-h-screen p-4 no-print`}
      >
        <div className="hidden md:block mb-8">
          <h1 className="text-lg font-bold">نظام غرف المشورة</h1>
          <p className="text-xs text-primary-100 mt-1">وزارة الصحة والسكان</p>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  active
                    ? 'bg-white text-primary-800 font-semibold'
                    : 'text-primary-100 hover:bg-primary-700'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-primary-700">
          <div className="text-xs text-primary-100 mb-2">
            {userEmail}
            {isAdmin && <span className="block text-yellow-300 mt-1">مدير النظام</span>}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-primary-100 hover:bg-primary-700"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}