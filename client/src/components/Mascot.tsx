type Props = { size?: number; happy?: boolean; float?: boolean };

export default function Mascot({ size = 96, happy = true, float = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={float ? "animate-float" : ""}
      aria-label="CalPal heart mascot"
    >
      <path
        d="M50 88 C20 66 8 48 8 32 C8 18 19 9 31 9 C40 9 47 14 50 21 C53 14 60 9 69 9 C81 9 92 18 92 32 C92 48 80 66 50 88 Z"
        fill="#f76b98"
      />
      <path d="M22 26 C24 20 30 17 35 18" stroke="#ffd1df" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="38" cy="42" r="5" fill="#26262e" />
      <circle cx="62" cy="42" r="5" fill="#26262e" />
      <circle cx="40" cy="40" r="1.8" fill="white" />
      <circle cx="64" cy="40" r="1.8" fill="white" />
      <ellipse cx="29" cy="53" rx="6" ry="4" fill="#ffb3c9" />
      <ellipse cx="71" cy="53" rx="6" ry="4" fill="#ffb3c9" />
      {happy ? (
        <path d="M43 52 Q50 61 57 52" stroke="#26262e" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M44 58 Q50 52 56 58" stroke="#26262e" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}