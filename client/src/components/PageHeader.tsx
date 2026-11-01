export default function PageHeader({
  title,
  subtitle,
  pattern,
}: {
  title: string;
  subtitle: string;
  pattern?: "dots" | "waves" | "sparkles";
}) {
  return (
    <div className={`rounded-3xl border border-mist-200 bg-white px-6 py-7 shadow-card md:px-8 ${pattern ? `pattern-${pattern}` : ""}`}>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-mist-500">{subtitle}</p>
    </div>
  );
}