import React, { useState, useMemo } from 'react';
import { Search, Globe, X, Check, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES, LANGUAGE_REGIONS, LanguageItem, getLanguageInfo } from '../data/languages';
import { getTranslation } from '../utils/translations';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const t = getTranslation(currentLang);
  const activeLangInfo = getLanguageInfo(currentLang);

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter((item) => {
      const matchesRegion =
        selectedRegion === 'All' || item.region === selectedRegion;
      if (!matchesRegion) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.englishName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedRegion]);

  if (!isOpen) return null;

  const handleSelect = (code: Language) => {
    onSelectLang(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden z-10 transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-6 shrink-0 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/20 rounded-xl backdrop-blur-xs flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                50 Languages • ៥០ ភាសា • 50개 언어
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              ជ្រើសរើសភាសា (Select Language / 언어 선택)
            </h3>
            <p className="text-xs sm:text-sm text-blue-100">
              គាំទ្រ ៥០ ភាសា សម្រាប់ជនបរទេសគ្រប់ប្រទេសដែលរស់នៅនិងធ្វើការក្នុងប្រទេសកូរ៉េ
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Region Filter Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះភាសា ឬប្រទេស (Search language or country: Khmer, Vietnam, Nepal, Russia...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Region Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
            {LANGUAGE_REGIONS.map((region) => {
              const isActive = selectedRegion === region;
              const count =
                region === 'All'
                  ? SUPPORTED_LANGUAGES.length
                  : SUPPORTED_LANGUAGES.filter((l) => l.region === region).length;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {region} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Language Pill */}
        <div className="px-5 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700">ភាសាកំពុងប្រើ (Current):</span>
            <span className="inline-flex items-center gap-1.5 font-bold bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
              <span className="text-base">{activeLangInfo.flag}</span>
              <span>{activeLangInfo.name}</span>
              <span className="text-slate-500 text-[11px]">({activeLangInfo.englishName})</span>
            </span>
          </div>
          <span className="text-[11px] text-blue-700 hidden sm:inline">
            ចុចលើភាសាណាមួយដើម្បីប្តូរភ្លាមៗ
          </span>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Globe className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium">មិនឃើញភាសាដែលអ្នកស្វែងរកទេ (No language found)</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRegion('All');
                }}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                បង្ហាញភាសាទាំងអស់ឡើងវិញ (Show all 50 languages)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredLanguages.map((item) => {
                const isSelected = item.code === currentLang;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelect(item.code)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/80 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        {item.flag}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.englishName}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="p-1 bg-blue-600 text-white rounded-full shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {item.code}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>ភាសាទាំងអស់នឹងត្រូវផ្លាស់ប្តូរដោយស្វ័យប្រវត្តលើទម្រង់ និងឯកសារ</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
