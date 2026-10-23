import React, { useState } from "react";
import { Shield, Lock, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Language } from "../types";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang?: Language;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang = "km",
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Accepted PINs: 1234, admin, admin123, or user email
    const trimmed = pin.trim().toLowerCase();
    if (trimmed === "1234" || trimmed === "admin" || trimmed === "admin123" || trimmed === "zeekhmerads@gmail.com" || trimmed === "zeekhmerads") {
      localStorage.setItem("kiip_admin_mode", "true");
      onSuccess();
      onClose();
      setPin("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100003] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {lang === "km" ? "ផ្ទៀងផ្ទាត់សិទ្ធិ Admin" : "관리자(Admin) 인증"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === "km" ? "សម្រាប់គ្រប់គ្រង និងទាញយក PC App" : "PC 앱 관리 및 다운로드"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === "km" ? "បញ្ចូលលេខកូដសម្ងាត់ Admin (PIN)" : "관리자 비밀번호 (PIN)"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="1234 ឬ admin"
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === "km" ? "លេខសម្ងាត់មិនត្រឹមត្រូវ! (សាកល្បង: 1234)" : "비밀번호가 올바르지 않습니다."}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {lang === "km" ? "បោះបង់" : "취소"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {lang === "km" ? "ដោះសោ Admin" : "관리자 로그인"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
