"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Plus, Trash2, CheckCircle, Circle, Search, ArrowLeft, ArrowRight, Edit2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [user, setUser] = useState<{ name: string } | null>(null);
  
  // NEW: Search, Filter, Pagination States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (storedUser) setUser(JSON.parse(storedUser));
    
    fetchTasks();
  }, [router, page, search, statusFilter]); // Re-fetch when these change

  const fetchTasks = async () => {
    try {
      // Pass params to backend
      const { data } = await api.get(`/tasks?page=${page}&limit=5&search=${search}&status=${statusFilter}`);
      setTasks(data.tasks);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await api.post("/tasks", { title: newTask });
      setNewTask("");
      fetchTasks();
      toast.success("Task created");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // NEW: Handle Editing
  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editingId) return;
    try {
      await api.patch(`/tasks/${editingId}`, { title: editTitle });
      setEditingId(null);
      fetchTasks();
      toast.success("Task updated");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hello, {user?.name || "User"} 👋</h1>
        <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Create Task */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateTask} className="flex gap-4">
              <Input placeholder="Add a new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
              <Button type="submit"><Plus className="mr-2 h-4 w-4" /> Add</Button>
            </form>
          </CardContent>
        </Card>

        {/* NEW: Filters & Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-8" 
              placeholder="Search tasks..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
          <select 
            className="border rounded-md px-3 text-sm bg-background"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Task List */}
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="transition-all hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => handleToggle(task)}>
                    {task.status === "COMPLETED" ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-gray-300 hover:text-gray-500" />}
                  </button>
                  
                  {/* Edit Mode Logic */}
                  {editingId === task.id ? (
                    <div className="flex gap-2 flex-1">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                ) : (
                  <div className="flex flex-col gap-1 text-left">
                    <span className={task.status === "COMPLETED" ? "line-through text-gray-500" : "font-medium"}>
                      {task.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit font-bold ${
                      task.status === "COMPLETED" 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                   {!editingId && (
                     <Button variant="ghost" size="icon" onClick={() => startEditing(task)}>
                       <Edit2 className="h-4 w-4 text-blue-500" />
                     </Button>
                   )}
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                     <Trash2 className="h-4 w-4 text-red-500" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* NEW: Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages || 1}</span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
