import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...rest }: Props) {
  const cls = `btn btn-${variant}${size !== 'md' ? ` btn-${size}` : ''} ${className}`;
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
      {children}
    </button>
  );
}
