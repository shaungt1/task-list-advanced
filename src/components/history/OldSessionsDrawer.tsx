import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { Button } from "../ui/button";
import { format, parseISO } from "date-fns";
import { History, ArrowRight } from "lucide-react";

interface TaskSummary {
  id: string;
  content: string;
  completed: boolean;
}

interface ListSummary {
  id: string;
  name: string;
  tasks: TaskSummary[];
}

interface SessionSummary {
  date: string; // YYYY-MM-DD
  lists: ListSummary[];
}

interface OldSessionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: SessionSummary[];
  onImportTasksToToday: (taskIds: string[]) => void;
  onImportListsToToday: (listIds: string[]) => void;
  today: string; // YYYY-MM-DD
}

export const OldSessionsDrawer: React.FC<OldSessionsDrawerProps> = ({
  open,
  onOpenChange,
  sessions,
  onImportTasksToToday,
  onImportListsToToday,
  today,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([]);
  const [selectedListIds, setSelectedListIds] = React.useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };
  const toggleList = (listId: string) => {
    setSelectedListIds(prev => prev.includes(listId) ? prev.filter(id => id !== listId) : [...prev, listId]);
  };
  const clearSelections = () => {
    setSelectedTaskIds([]);
    setSelectedListIds([]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History /> Old Sessions
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <Accordion type="multiple" className="w-full">
            {sessions.filter(s => s.date !== today).map(session => (
              <AccordionItem value={session.date} key={session.date}>
                <AccordionTrigger>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {format(parseISO(session.date), 'EEE, MMM d, yyyy')}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {session.lists.map(list => (
                    <div key={list.id} className="mb-2 border-b pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          checked={selectedListIds.includes(list.id)}
                          onChange={() => toggleList(list.id)}
                          className="accent-purple-600"
                        />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-100">{list.name}</span>
                        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => onImportListsToToday([list.id])}>
                          <ArrowRight size={16} className="mr-1" /> Bring List
                        </Button>
                      </div>
                      <ul className="ml-6">
                        {list.tasks.map(task => (
                          <li key={task.id} className="flex items-center gap-2 mb-1">
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.includes(task.id)}
                              onChange={() => toggleTask(task.id)}
                              className="accent-purple-600"
                            />
                            <span className={`text-sm ${task.completed ? 'line-through text-zinc-400' : ''}`}>{task.content}</span>
                            <Button size="sm" variant="ghost" onClick={() => onImportTasksToToday([task.id])}>
                              <ArrowRight size={14} className="mr-1" /> Bring Task
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            variant="default"
            className="flex-1"
            disabled={selectedTaskIds.length === 0 && selectedListIds.length === 0}
            onClick={() => {
              if (selectedTaskIds.length) onImportTasksToToday(selectedTaskIds);
              if (selectedListIds.length) onImportListsToToday(selectedListIds);
              clearSelections();
            }}
          >
            Bring Selected
          </Button>
          <Button variant="outline" className="flex-1" onClick={clearSelections}>Clear</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
