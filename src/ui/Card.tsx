import clsx from 'clsx';

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('relative rounded-xl border border-white/10 bg-navy-800/60 p-4 shadow-lg', className)}>
      <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-red/10 opacity-40" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
