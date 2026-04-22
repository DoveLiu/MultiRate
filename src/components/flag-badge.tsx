"use client";

interface FlagBadgeProps {
  code: string;
}

export function FlagBadge({ code }: FlagBadgeProps) {
  return (
    <div className="flex h-[2.9rem] w-[4rem] shrink-0 items-center justify-center overflow-hidden rounded-[0.45rem] bg-[#2b2b2b] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:h-[3.3rem] sm:w-[4.6rem]">
      {renderFlag(code)}
    </div>
  );
}

function renderFlag(code: string) {
  switch (code) {
    case "TWD":
      return (
        <svg viewBox="0 0 64 48" className="h-full w-full">
          <rect width="64" height="48" fill="#d62525" />
          <rect width="28" height="22" fill="#162b90" />
          <g transform="translate(14 11)">
            <circle r="5.4" fill="#fff" />
            <g fill="#fff">
              {Array.from({ length: 12 }).map((_, index) => (
                <path
                  key={index}
                  d="M0-10 1.8-4 0 0 -1.8-4Z"
                  transform={`rotate(${index * 30})`}
                />
              ))}
            </g>
          </g>
        </svg>
      );
    case "USD":
      return (
        <svg viewBox="0 0 64 48" className="h-full w-full">
          <rect width="64" height="48" fill="#fff" />
          {Array.from({ length: 7 }).map((_, index) => (
            <rect key={index} y={index * 7} width="64" height="3.5" fill="#b22234" />
          ))}
          <rect width="28" height="21" fill="#3c3b6e" />
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: row % 2 === 0 ? 6 : 5 }).map((__, column) => (
              <circle
                key={`${row}-${column}`}
                cx={4 + column * 4.5 + (row % 2 === 0 ? 0 : 2.2)}
                cy={4 + row * 3.6}
                r="0.9"
                fill="#fff"
              />
            ))
          )}
        </svg>
      );
    case "JPY":
      return (
        <svg viewBox="0 0 64 48" className="h-full w-full">
          <rect width="64" height="48" fill="#f4f4f4" />
          <circle cx="32" cy="24" r="12" fill="#bc002d" />
        </svg>
      );
    case "CNY":
      return (
        <svg viewBox="0 0 64 48" className="h-full w-full">
          <rect width="64" height="48" fill="#de2910" />
          <polygon points="13,8 15.2,14.2 21.9,14.2 16.4,18 18.5,24.2 13,20.4 7.5,24.2 9.6,18 4.1,14.2 10.8,14.2" fill="#ffde00" />
          <circle cx="24" cy="9" r="2.2" fill="#ffde00" />
          <circle cx="28" cy="14" r="2.2" fill="#ffde00" />
          <circle cx="27" cy="20" r="2.2" fill="#ffde00" />
          <circle cx="22" cy="24" r="2.2" fill="#ffde00" />
        </svg>
      );
    case "KRW":
      return (
        <svg viewBox="0 0 64 48" className="h-full w-full">
          <rect width="64" height="48" fill="#f6f6f6" />
          <g transform="translate(32 24)">
            <path d="M0-10a10 10 0 0 1 0 20A10 10 0 0 1 0-10" fill="#cd2e3a" />
            <path d="M0 10a10 10 0 0 1 0-20A10 10 0 0 1 0 10" fill="#0047a0" />
            <circle cy="-5" r="5" fill="#0047a0" />
            <circle cy="5" r="5" fill="#cd2e3a" />
          </g>
          <g fill="#222">
            <rect x="8" y="9" width="3" height="10" rx="1" transform="rotate(-28 8 9)" />
            <rect x="13" y="7" width="3" height="10" rx="1" transform="rotate(-28 13 7)" />
            <rect x="48" y="29" width="3" height="10" rx="1" transform="rotate(-28 48 29)" />
            <rect x="53" y="27" width="3" height="10" rx="1" transform="rotate(-28 53 27)" />
            <rect x="49" y="8" width="3" height="10" rx="1" transform="rotate(28 49 8)" />
            <rect x="54" y="10" width="3" height="10" rx="1" transform="rotate(28 54 10)" />
            <rect x="9" y="28" width="3" height="10" rx="1" transform="rotate(28 9 28)" />
            <rect x="14" y="30" width="3" height="10" rx="1" transform="rotate(28 14 30)" />
          </g>
        </svg>
      );
    case "EUR":
      return simpleFlag("#1c48a1", "€");
    case "HKD":
      return simpleFlag("#cf2027", "HK");
    case "GBP":
      return simpleFlag("#15318a", "UK");
    case "AUD":
      return simpleFlag("#15318a", "AU");
    case "CAD":
      return simpleFlag("#d52b1e", "CA");
    case "SGD":
      return simpleFlag("#ef3340", "SG");
    case "CHF":
      return simpleFlag("#d52b1e", "CH");
    case "ZAR":
      return simpleFlag("#007a4d", "ZA");
    case "SEK":
      return simpleFlag("#006aa7", "SE");
    case "NZD":
      return simpleFlag("#15318a", "NZ");
    case "THB":
      return simpleFlag("#241d4f", "TH");
    case "PHP":
      return simpleFlag("#0038a8", "PH");
    case "IDR":
      return simpleFlag("#ce1126", "ID");
    case "VND":
      return simpleFlag("#da251d", "VN");
    case "MYR":
      return simpleFlag("#010066", "MY");
    default:
      return simpleFlag("#2d3346", code.slice(0, 2));
  }
}

function simpleFlag(background: string, label: string) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background }}>
      <span className="text-sm font-semibold tracking-wide text-white">{label}</span>
    </div>
  );
}
