import React from "react";

interface OfficialApprovedSealProps {
  className?: string;
  size?: number;
}

export const OfficialApprovedSeal: React.FC<OfficialApprovedSealProps> = ({
  className = "",
  size = 72,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none transform -rotate-6 ${className}`}
      style={{ width: size, height: size }}
      title="사회통합프로그램 접수·승인인 (KIIP Official Approved Seal)"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="text-red-700 drop-shadow-xs"
      >
        {/* Outer Circular Ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeDasharray="40 1 20 1 40 1"
          opacity="0.9"
        />
        {/* Inner Thin Circular Ring */}
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.85"
        />

        {/* Circular text along path */}
        <path
          id="sealCirclePath"
          d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
          fill="none"
        />
        <text
          fontSize="9.5"
          fontWeight="900"
          fontFamily="serif"
          fill="currentColor"
          letterSpacing="2.5"
          opacity="0.95"
        >
          <textPath href="#sealCirclePath" startOffset="50%" textAnchor="middle">
            법무부 출입국 · 외국인정책본부
          </textPath>
        </text>

        {/* Center Inner Square Box */}
        <rect
          x="28"
          y="28"
          width="44"
          height="44"
          rx="4"
          fill="#fef2f2"
          fillOpacity="0.85"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        {/* Center Hanja / Hangul Seal Characters (사회 통합 / 승인 접수) */}
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="900"
          fontFamily="serif"
          fill="currentColor"
          letterSpacing="1"
        >
          사회통합
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fontFamily="serif"
          fill="currentColor"
          letterSpacing="2"
        >
          승인인
        </text>

        {/* Small decorative stars / dots */}
        <circle cx="16" cy="50" r="1.5" fill="currentColor" />
        <circle cx="84" cy="50" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
};
