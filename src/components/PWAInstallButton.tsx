import React, { useState } from "react";
import { Monitor, CheckCircle2, ShieldCheck } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { PCAppInstallModal } from "./PCAppInstallModal";
import { Language } from "../types";

interface PWAInstallButtonProps {
  lang?: Language;
  isAdmin?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = "km",
  isAdmin = false,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CRITICAL REQUIREMENT: If not Admin, hide this button completely from public users!
  if (!isAdmin) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (isInstalled) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
          title="Admin: កម្មវិធី PC App កំពុងដំណើរការ"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
            ADMIN
          </span>
          <span className="hidden sm:inline">
            {lang === "km" ? "PC App បានដំឡើង" : "PC App 설치됨"}
          </span>
          <span className="sm:hidden">App ✓</span>
        </button>
        <PCAppInstallModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          lang={lang}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer border border-blue-400/40"
        title="Admin: ដំឡើងជា App លើ PC ឬទាញយក Source Code (.ZIP)"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
        <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
          ADMIN
        </span>
        <span className="hidden sm:inline">
          {lang === "km" ? "ដំឡើង App លើ PC" : "PC 앱 설치"}
        </span>
        <span className="sm:hidden">PC App</span>
      </button>
      <PCAppInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lang={lang}
      />
    </>
  );
};
