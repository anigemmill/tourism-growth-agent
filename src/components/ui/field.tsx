import { cn } from "@/lib/utils";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";

export function Field({
  label,
  name,
  placeholder,
  required,
  textarea,
  hint,
  type = "text",
  defaultValue,
  rows = 3,
  className,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  hint?: string;
  type?: string;
  defaultValue?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {hint && <span className="text-xs text-foreground-subtle -mt-1">{hint}</span>}
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={rows}
          defaultValue={defaultValue}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          className={inputClass}
        />
      )}
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
  hint,
  className,
}: {
  label: string;
  name: string;
  options: readonly string[] | { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
  hint?: string;
  className?: string;
}) {
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {hint && <span className="text-xs text-foreground-subtle -mt-1">{hint}</span>}
      <select name={name} required={required} defaultValue={defaultValue} className={inputClass}>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RangeField({
  label,
  name,
  defaultValue = 50,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="text-xs text-foreground-subtle -mt-1">{hint}</span>}
      <input type="range" name={name} min={0} max={100} step={5} defaultValue={defaultValue} className="accent-brand" />
    </label>
  );
}

export function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-xl border border-border bg-surface">
      <summary className="cursor-pointer px-5 py-3 text-sm font-semibold select-none">{title}</summary>
      <div className="px-5 pb-5 pt-1 flex flex-col gap-4">{children}</div>
    </details>
  );
}
