
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import {
  Users,
  Store,
  Tag,
  Home,
  Settings,
  ScrollText
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
      active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

interface SidebarProps {
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isAdmin = role === 'admin';
  const basePath = isAdmin ? '/admin' : '/merchant';

  // Define navigation items based on user role
  const navItems = isAdmin
    ? [
        { to: `${basePath}`, icon: <Home className="h-4 w-4" />, label: "Dashboard" },
        { to: `${basePath}/merchants`, icon: <Store className="h-4 w-4" />, label: "Merchants" },
        { to: `${basePath}/offers`, icon: <Tag className="h-4 w-4" />, label: "Offers" },
        { to: `${basePath}/settings`, icon: <Settings className="h-4 w-4" />, label: "Settings" },
      ]
    : [
        { to: `${basePath}`, icon: <Home className="h-4 w-4" />, label: "Dashboard" },
        { to: `${basePath}/offers`, icon: <Tag className="h-4 w-4" />, label: "My Offers" },
        { to: `${basePath}/profile`, icon: <Users className="h-4 w-4" />, label: "Profile" },
        { to: `${basePath}/settings`, icon: <Settings className="h-4 w-4" />, label: "Settings" },
      ];

  return (
    <div className="hidden border-r bg-card px-4 py-6 md:block md:w-64">
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={
              item.to === basePath 
                ? pathname === basePath 
                : pathname.startsWith(item.to)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
