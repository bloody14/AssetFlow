import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLayout } from '@/components/providers/LayoutProvider';
import { navigationRegistry } from '@/config/navigation';
import { Package2 } from 'lucide-react';

export const Sidebar = ({ className }: { className?: string }) => {
  const { isSidebarCollapsed } = useLayout();

  const sortedNav = [...navigationRegistry]
    .filter(nav => nav.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <aside
      className={cn(
        "hidden border-r border-border bg-card transition-all duration-300 ease-in-out md:flex md:flex-col",
        isSidebarCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4 font-semibold">
        <Package2 className="mr-2 h-6 w-6 text-primary" />
        {!isSidebarCollapsed && <span className="truncate">AssetFlow ERP</span>}
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {sortedNav.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
                  isActive ? "bg-accent text-primary" : "",
                  isSidebarCollapsed ? "justify-center px-0" : ""
                )
              }
              title={isSidebarCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5" />
              {!isSidebarCollapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.title}</span>
                  {item.badgeCount && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {item.badgeCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
