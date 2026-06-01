import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, FileText, Bell, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Item = { to: string; label: string; icon: any; exact?: boolean };

const items: Item[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard", label: "Companies", icon: Building2 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

function getInitials(email?: string) {
  if (!email) return "U";
  return email.slice(0, 2).toUpperCase();
}

function getDisplayName(email?: string) {
  if (!email) return "User";
  return email.split("@")[0];
}

export function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const email = user?.email ?? "";
  const displayName = getDisplayName(user?.email);
  const initials = getInitials(user?.email);
  const activeIndex = (() => {
    // priority: deeper path > Companies (on /dashboard/companies/*) > Dashboard (exact /dashboard)
    if (pathname.startsWith("/dashboard/companies")) return 1;
    if (pathname === "/dashboard") return 0;
    if (pathname.startsWith("/reports")) return 2;
    if (pathname.startsWith("/alerts")) return 3;
    if (pathname.startsWith("/settings")) return 4;
    return -1;
  })();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <>
      <header className="border-b border-border bg-sidebar md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="text-lg font-medium tracking-tight text-charcoal">
            Track<span className="text-gold">Flow</span>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {items.map((item, i) => {
            const active = i === activeIndex;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-gold-soft text-charcoal" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="px-6 py-6">
          <Link to="/dashboard" className="text-lg font-medium tracking-tight text-charcoal">
            Track<span className="text-gold">Flow</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {items.map((item, i) => {
            const active = i === activeIndex;
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.to} className="relative block">
                <motion.div
                  initial={false}
                  animate={{ backgroundColor: active ? "var(--gold-soft)" : "rgba(0,0,0,0)" }}
                  transition={{ duration: 0.2 }}
                  className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                    active ? "text-charcoal" : "text-muted-foreground hover:text-charcoal"
                  }`}
                >
                  {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-gold" />}
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-4 border-t border-border flex items-center gap-3 text-left">
              <div className="h-8 w-8 rounded-full bg-charcoal text-primary-foreground grid place-items-center text-xs font-medium">{initials}</div>
              <div className="min-w-0 text-sm">
                <div className="truncate text-charcoal leading-tight">{displayName}</div>
                <div className="truncate text-muted-foreground text-xs">{email}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleSignOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
    </>
  );
}
