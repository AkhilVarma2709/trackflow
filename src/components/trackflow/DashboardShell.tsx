import type { ReactNode } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(email?: string) {
  if (!email) return "U";
  return email.slice(0, 2).toUpperCase();
}

export function DashboardShell({ children, title, subtitle, actions }: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const initials = getInitials(user?.email);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, navigate, user]);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background md:flex-row">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 border-b border-border bg-background px-4 py-3 sm:px-6 lg:px-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-charcoal">
                <div className="h-8 w-8 rounded-full bg-charcoal text-primary-foreground grid place-items-center text-xs font-medium">{initials}</div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleSignOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
        >
          {(title || actions) && (
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {title && <h1 className="text-2xl font-medium text-charcoal sm:text-3xl">{title}</h1>}
                {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
              </div>
              {actions && <div className="shrink-0">{actions}</div>}
            </div>
          )}
          {children}
        </motion.div>
      </main>
    </div>
  );
}
