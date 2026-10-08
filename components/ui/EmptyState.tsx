import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed border-ink-900/10 bg-white/40">
      {icon && (
        <div className="grid place-items-center size-16 rounded-3xl bg-brand-50 text-brand-700 mb-5 shadow-soft">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-bold text-ink-900 mb-2">{title}</h3>
      <p className="max-w-md text-base text-ink-600 leading-relaxed mb-6">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
