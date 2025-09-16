import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const base = 'inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-navy-900';

const variants = {
  primary: 'bg-brand-red text-white hover:bg-brand-red/90 shadow-lg',
  secondary: 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg',
  ghost: 'bg-white/10 text-white hover:bg-white/20',
};

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({ variant='primary', size='md', className, ...props }: Props) {
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />
}
