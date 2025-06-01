import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarProps {
  categories: string[];
  onAddCategory: (name: string) => void;
  onSelectCategory: (name: string) => void;
  selectedCategory: string | null;
  days: { date: string; lists: { id: string; name: string; hasLeftover: boolean }[] }[];
  onSelectList: (listId: string) => void;
  collapsed: boolean;
  onCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  onAddCategory,
  onSelectCategory,
  selectedCategory,
  days,
  onSelectList,
  collapsed,
  onCollapse,
}) => {
  const [showCategories, setShowCategories] = useState(true);
  const [showDays, setShowDays] = useState(true);
  const [newCategory, setNewCategory] = useState('');

  if (collapsed) return null;

  return (
    <aside className="w-64 bg-zinc-100 dark:bg-zinc-950 h-full p-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-zinc-800 dark:text-zinc-100">Categories</span>
        <button onClick={() => setShowCategories(v => !v)}>{showCategories ? <ChevronUp /> : <ChevronDown />}</button>
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
            <button
              className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded"
              onClick={() => {
                if (newCategory.trim()) {
                  onAddCategory(newCategory.trim());
                  setNewCategory('');
                }
              }}
              aria-label="Add category"
            >
              <Plus size={18} />
            </button>
          </div>
          <ul>
            {categories.map(cat => (
              <li key={cat}>
                <button
                  className={`w-full text-left px-2 py-1 rounded ${selectedCategory === cat ? 'bg-zinc-300 dark:bg-zinc-800 font-bold' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                  onClick={() => onSelectCategory(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-zinc-800 dark:text-zinc-100">Your Lists</span>
        <button onClick={() => setShowDays(v => !v)}>{showDays ? <ChevronUp /> : <ChevronDown />}</button>
      </div>
      {showDays && (
        <div className="flex-1 overflow-y-auto">
          {days.map(day => (
            <div key={day.date} className="mb-2">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{day.date}</div>
              <ul>
                {day.lists.map(list => (
                  <li key={list.id}>
                    <button
                      className={`w-full text-left px-2 py-1 rounded ${list.hasLeftover ? 'bg-yellow-200 dark:bg-yellow-900' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                      onClick={() => onSelectList(list.id)}
                    >
                      {list.name}
                      {list.hasLeftover && <span className="ml-2 text-xs text-yellow-800 dark:text-yellow-200">(leftover)</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <button className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 underline" onClick={onCollapse}>Collapse Sidebar</button>
    </aside>
  );
};
