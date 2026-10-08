import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, className = "", id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full text-start">
        {label && (
          <label htmlFor={selectId} className="block text-base font-bold text-ink-900 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-2xl border-2 px-4 py-3.5 pe-10 text-base text-ink-900 bg-white shadow-soft transition duration-150 focus:outline-none focus:ring-4 cursor-pointer ${
              error
                ? "border-rose-400 focus:border-rose-600 focus:ring-rose-100"
                : "border-ink-900/15 focus:border-brand-600 focus:ring-brand-100"
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-ink-500">
            <svg
              className="size-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-ink-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
