import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@tanstack/react-router";

type BaseProps = { children: ReactNode; className?: string };

export function PrimaryButton({ children, className = "", ...props }: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md bg-charcoal px-5 py-2.5 text-sm font-normal text-primary-foreground transition-colors hover:bg-charcoal/90 ${className}`}
    >
      {children}
    </button>
  );
}

export function GoldOutlineButton({ children, className = "", ...props }: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md border border-gold bg-transparent px-5 py-2.5 text-sm font-normal text-charcoal transition-colors hover:bg-gold-soft ${className}`}
    >
      {children}
    </button>
  );
}

export function PrimaryLink({ to, children, className = "" }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center justify-center rounded-md bg-charcoal px-5 py-2.5 text-sm font-normal text-primary-foreground transition-colors hover:bg-charcoal/90 ${className}`}>
      {children}
    </Link>
  );
}

export function GoldOutlineLink({ to, children, className = "" }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center justify-center rounded-md border border-gold bg-transparent px-5 py-2.5 text-sm font-normal text-charcoal transition-colors hover:bg-gold-soft ${className}`}>
      {children}
    </Link>
  );
}
