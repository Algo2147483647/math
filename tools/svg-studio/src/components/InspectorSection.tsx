import type { ReactNode } from 'react';

export function Section({
  title,
  children,
  extra,
}: {
  title: string;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <section className="inspector-section">
      <div className="section-title">
        <h3>{title}</h3>
        {extra}
      </div>
      {children}
    </section>
  );
}
