import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { navigationRegistry } from '@/config/navigation';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredNav = navigationRegistry.filter((nav) =>
    nav.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setIsOpen(false);
    navigate(path);
    setQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="overflow-hidden p-0 [&>button]:hidden">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules or type a command..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
          {filteredNav.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          ) : (
            <div className="px-2 py-2">
              <h4 className="mb-2 px-2 text-xs font-medium text-muted-foreground">Navigation</h4>
              {filteredNav.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => handleSelect(nav.path)}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <nav.icon className="mr-2 h-4 w-4" />
                  {nav.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
