import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, CalendarDays, Folder, Menu, History, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { format, parseISO } from 'date-fns';
import { getCategories, createCategory } from '@/services/categoryService';
import { getTaskLists, saveTaskList } from '@/services/taskListService';

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface ListSummary {
  id: string;
  name: string;
  hasLeftover: boolean;
  created_at: string;
}

interface DayLists {
  date: string; // YYYY-MM-DD
  lists: ListSummary[];
}

interface SidebarV2Props {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onSelectCategory: (id: string) => void;
  selectedCategoryId: string | null;
  days: DayLists[];
  onSelectList: (listId: string) => void;
  collapsed: boolean;
  onCollapse: () => void;
  onOpenHistory: () => void;
  today: string; // YYYY-MM-DD
}

export const SidebarV2: React.FC<SidebarV2Props> = ({
  categories: initialCategories,
  onAddCategory,
  onSelectCategory,
  selectedCategoryId,
  days: initialDays,
  onSelectList,
  collapsed,
  onCollapse,
  onOpenHistory,
  today,
}) => {
  const [showCategories, setShowCategories] = useState(true);
  const [showDays, setShowDays] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [days, setDays] = useState<DayLists[]>(initialDays);
  const [loading, setLoading] = useState(false);

  // Fetch categories and lists on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const cats = await getCategories();
      setCategories(cats);
      const lists = await getTaskLists();
      // Group lists by day
      const grouped: Record<string, ListSummary[]> = {};
      lists.forEach((list: any) => {
        const date = list.created_at.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({
          id: list.id,
          name: list.name,
          hasLeftover: false, // TODO: logic for leftover
          created_at: list.created_at,
        });
      });
      const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
      setDays(sortedDays.map(date => ({ date, lists: grouped[date] })));
      setLoading(false);
    }
    fetchData();
  }, []);

  // Get current date/time
  const now = new Date();
  const dayString = now.toLocaleDateString(undefined, { weekday: 'long', month: 'numeric', day: 'numeric', year: 'numeric' });
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const cat = await createCategory(newCategory.trim());
    setCategories(prev => [...prev, cat]);
    setNewCategory('');
    onAddCategory(cat.name);
  };

  // Responsive: show hamburger only on mobile
  const Hamburger = (
    <div className="md:hidden flex items-center p-2">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open sidebar">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent>
            {renderSidebarContent()}
          </SidebarContent>
        </SheetContent>
      </Sheet>
    </div>
  );

  function renderSidebarContent() {
    return (
      <>
        {/* Date/Time */}
        <SidebarHeader>
          <div className="font-bold underline text-lg text-zinc-900 dark:text-zinc-100">{dayString}</div>
          <div className="text-zinc-700 dark:text-zinc-300 text-sm font-mono">{timeString}</div>
        </SidebarHeader>
        {/* Categories */}
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-100">Categories</span>
              <Button variant="ghost" size="icon" onClick={() => setShowCategories(v => !v)}>
                {showCategories ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </SidebarGroupLabel>
          {showCategories && (
            <div className="mb-2">
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                  placeholder="New category"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
                <Button
                  className="p-1"
                  variant="ghost"
                  size="icon"
                  onClick={handleAddCategory}
                  aria-label="Add category"
                >
                  <Plus size={18} />
                </Button>
              </div>
              <SidebarMenu>
                {categories.map(cat => (
                  <SidebarMenuItem key={cat.id}>
                    <SidebarMenuButton
                      isActive={selectedCategoryId === cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      size="sm"
                    >
                      <Folder className="mr-2" size={16} /> {cat.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          )}
        </SidebarGroup>
        {/* Lists by day */}
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-100">Your Lists</span>
              <Button variant="ghost" size="icon" onClick={() => setShowDays(v => !v)}>
                {showDays ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </SidebarGroupLabel>
          {showDays && (
            <SidebarMenu>
              {days.map(day => (
                <Accordion key={day.date} type="single" collapsible defaultValue={today === day.date ? day.date : undefined}>
                  <AccordionItem value={day.date}>
                    <AccordionTrigger className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      {format(parseISO(day.date), 'EEEE, MMM d')}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul>
                        {day.lists.map(list => (
                          <li key={list.id}>
                            <SidebarMenuButton
                              isActive={false}
                              onClick={() => onSelectList(list.id)}
                              size="sm"
                            >
                              <CalendarDays className="mr-2" size={16} /> {list.name}
                              {list.hasLeftover && <Badge className="ml-2" variant="secondary">leftover</Badge>}
                            </SidebarMenuButton>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
        <SidebarFooter>
          <Button variant="outline" className="flex-1" onClick={onOpenHistory}>
            <History className="mr-2" size={18} /> History
          </Button>
          <Button variant="ghost" size="icon" onClick={onCollapse} aria-label="Collapse sidebar">
            <ChevronDown />
          </Button>
        </SidebarFooter>
      </>
    );
  }

  // Collapsed state for sidebar (desktop)
  if (collapsed) {
    return (
      <aside className="w-20 bg-zinc-100 dark:bg-zinc-950 h-full p-2 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
        <Button variant="ghost" size="icon" className="mb-2" onClick={onCollapse} aria-label="Expand sidebar">
          <ChevronDown />
        </Button>
        {/* Add icons with tooltips for categories, lists, history, etc. */}
      </aside>
    );
  }

  return (
    <SidebarProvider>
      {/* Hamburger for mobile only */}
      {Hamburger}
      {/* Sidebar for desktop */}
      <div className="hidden md:flex h-full">
        <Sidebar collapsible="offcanvas" className="h-full">
          <SidebarContent>
            {renderSidebarContent()}
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
};
