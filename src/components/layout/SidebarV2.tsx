import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, CalendarDays, Folder, Menu, History, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface ListSummary {
  id: string;
  name: string;
  hasLeftover: boolean;
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
  categories,
  onAddCategory,
  onSelectCategory,
  selectedCategoryId,
  days,
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

  if (collapsed) {
    return (
      <div className="fixed top-0 left-0 h-full bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center py-4 border-r border-zinc-200 dark:border-zinc-800 z-40">
        <Button variant="ghost" size="icon" className="mb-2" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
          <Menu />
        </Button>
        <Button variant="ghost" size="icon" className="mb-2" onClick={onOpenHistory} aria-label="History">
          <History />
        </Button>
        <Button variant="ghost" size="icon" className="mb-2" onClick={onCollapse} aria-label="Expand sidebar">
          <ChevronDown />
        </Button>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarV2
              {...{ categories, onAddCategory, onSelectCategory, selectedCategoryId, days, onSelectList, collapsed: false, onCollapse, onOpenHistory, today }}
            />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-zinc-100 dark:bg-zinc-950 h-full p-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1">
          <Folder size={18} /> Categories
        </span>
        <Button variant="ghost" size="icon" onClick={() => setShowCategories(v => !v)} aria-label="Toggle categories">
          {showCategories ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>
      {showCategories && (
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
              placeholder="New category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                if (newCategory.trim()) {
                  onAddCategory(newCategory.trim());
                  setNewCategory('');
                }
              }}
              aria-label="Add category"
            >
              <Plus size={18} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Badge
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "secondary"}
                className={`cursor-pointer px-3 py-1 ${selectedCategoryId === cat.id ? 'bg-purple-600 text-white' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
                style={cat.color ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1">
          <CalendarDays size={18} /> Your Lists
        </span>
        <Button variant="ghost" size="icon" onClick={() => setShowDays(v => !v)} aria-label="Toggle days">
          {showDays ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>
      {showDays && (
        <div className="flex-1 overflow-y-auto">
          <Accordion type="multiple" className="w-full">
            {days.map(day => (
              <AccordionItem value={day.date} key={day.date}>
                <AccordionTrigger className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {format(parseISO(day.date), 'EEE, MMM d')}
                    {day.date === today && <span className="ml-2 px-2 py-0.5 rounded bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100 text-xs">Today</span>}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul>
                    {day.lists.map(list => (
                      <li key={list.id}>
                        <Button
                          variant={list.hasLeftover ? "destructive" : "ghost"}
                          className={`w-full justify-start px-2 py-1 rounded text-left mb-1 ${list.hasLeftover ? 'bg-yellow-200 dark:bg-yellow-900' : ''}`}
                          onClick={() => onSelectList(list.id)}
                        >
                          {list.name}
                          {list.hasLeftover && <span className="ml-2 text-xs text-yellow-800 dark:text-yellow-200">(leftover)</span>}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={onOpenHistory}>
          <History className="mr-2" size={18} /> History
        </Button>
        <Button variant="ghost" size="icon" onClick={onCollapse} aria-label="Collapse sidebar">
          <ChevronDown />
        </Button>
      </div>
    </aside>
  );
};
