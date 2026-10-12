'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/form-controls';
import { CheckCircle2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || 'Bệnh nhân');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b pb-6">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'Tài khoản'}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-600"
          />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{currentUser?.name || 'Khách vãng lai'}</h1>
            <p className="text-xs text-muted-foreground">{currentUser?.email || 'Chưa đăng nhập'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
              Vai trò: {currentUser?.role || 'Khách'}
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Cập nhật thông tin thành công!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Họ và tên</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Số điện thoại liên hệ</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987 654 321"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email (Cố định)</label>
            <Input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="bg-zinc-100 dark:bg-zinc-800 opacity-70"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
      </div>
    </ProtectedRoute>
  );
}
