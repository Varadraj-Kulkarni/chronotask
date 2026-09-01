import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  MonthStatusResponse,
  AnalyticsSummaryResponse,
  AnalyticsPeriod,
  Category,
  EditScope,
  StandardError,
  PriorityLevel,
} from "./types";
import { INITIAL_TASKS, INITIAL_CATEGORIES, getMockAnalytics } from "./mockData";
import { computeDayStatus, toCalendarDateString } from "./dateUtils";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:3000/api");

// In-memory fallback state for standalone dev / Specmatic offline mode
let localTasks: Task[] = [...INITIAL_TASKS];
let localCategories: Category[] = [...INITIAL_CATEGORIES];

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      });

      if (!res.ok) {
        let errorData: StandardError;
        try {
          errorData = await res.json();
        } catch {
          errorData = {
            code: `HTTP_${res.status}`,
            message: res.statusText || "An error occurred",
            timestamp: new Date().toISOString(),
            path: endpoint,
          };
        }
        throw errorData;
      }

      if (res.status === 204) {
        return undefined as unknown as T;
      }

      return (await res.json()) as T;
    } catch (err: any) {
      // If network error (e.g. server offline during standalone frontend dev), use fallback
      if (err instanceof TypeError && err.message.includes("fetch")) {
        console.warn(`[ChronoTask API] Live server unreachable at ${url}, using in-memory state.`);
        return this.handleFallback<T>(endpoint, options);
      }
      throw err;
    }
  }

  private handleFallback<T>(endpoint: string, options: RequestInit): T {
    const method = (options.method || "GET").toUpperCase();
    const urlObj = new URL(endpoint, "http://localhost");
    const pathname = urlObj.pathname;

    // GET /calendar/month?year=...&month=...
    if (pathname === "/calendar/month" && method === "GET") {
      const year = parseInt(urlObj.searchParams.get("year") || "2026", 10);
      const month = parseInt(urlObj.searchParams.get("month") || "9", 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      const days = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayTasks = localTasks.filter((t) => t.date === dateStr);
        const total = dayTasks.length;
        const completed = dayTasks.filter((t) => t.completed).length;
        const statusMeta = computeDayStatus(total, completed);
        days.push({
          date: dateStr,
          totalTasks: total,
          completedTasks: completed,
          status: statusMeta.status,
          colorCode: statusMeta.colorCode,
        });
      }

      return { year, month, days } as unknown as T;
    }

    // GET /tasks
    if (pathname === "/tasks" && method === "GET") {
      const date = urlObj.searchParams.get("date");
      const priority = urlObj.searchParams.get("priority");
      const completed = urlObj.searchParams.get("completed");

      let filtered = [...localTasks];
      if (date) filtered = filtered.filter((t) => t.date === date);
      if (priority) filtered = filtered.filter((t) => t.priority === priority);
      if (completed !== null && completed !== undefined) {
        const isComp = completed === "true";
        filtered = filtered.filter((t) => t.completed === isComp);
      }
      return filtered as unknown as T;
    }

    // POST /tasks
    if (pathname === "/tasks" && method === "POST") {
      const body: CreateTaskRequest = JSON.parse(options.body as string);
      const newTask: Task = {
        id: `task-${Date.now()}`,
        userId: "user-default",
        title: body.title,
        description: body.description || null,
        date: body.date,
        dueTime: body.dueTime || null,
        completed: false,
        completedAt: null,
        priority: body.priority || "MEDIUM",
        categoryId: body.categoryId || null,
        recurrenceId: body.recurrenceConfig ? `rec-${Date.now()}` : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localTasks.push(newTask);
      return newTask as unknown as T;
    }

    // POST /tasks/{id}/complete
    if (pathname.includes("/complete") && method === "POST") {
      const id = pathname.split("/")[2];
      const task = localTasks.find((t) => t.id === id);
      if (!task) throw { code: "NOT_FOUND", message: "Task not found", path: endpoint, timestamp: new Date().toISOString() };
      if (task.completed) {
        throw {
          code: "TASK_ALREADY_COMPLETED",
          message: `Task '${task.title}' is already completed.`,
          path: endpoint,
          timestamp: new Date().toISOString(),
          details: { completedAt: task.completedAt },
        };
      }
      task.completed = true;
      task.completedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();
      return task as unknown as T;
    }

    // POST /tasks/{id}/uncomplete
    if (pathname.includes("/uncomplete") && method === "POST") {
      const id = pathname.split("/")[2];
      const task = localTasks.find((t) => t.id === id);
      if (!task) throw { code: "NOT_FOUND", message: "Task not found", path: endpoint, timestamp: new Date().toISOString() };
      task.completed = false;
      task.completedAt = null;
      task.updatedAt = new Date().toISOString();
      return task as unknown as T;
    }

    // PATCH /tasks/{id}
    if (pathname.startsWith("/tasks/") && method === "PATCH") {
      const id = pathname.split("/")[2];
      const patch: UpdateTaskRequest = JSON.parse(options.body as string);
      const task = localTasks.find((t) => t.id === id);
      if (!task) throw { code: "NOT_FOUND", message: "Task not found", path: endpoint, timestamp: new Date().toISOString() };
      Object.assign(task, patch, { updatedAt: new Date().toISOString() });
      return task as unknown as T;
    }

    // DELETE /tasks/{id}
    if (pathname.startsWith("/tasks/") && method === "DELETE") {
      const id = pathname.split("/")[2];
      localTasks = localTasks.filter((t) => t.id !== id);
      return undefined as unknown as T;
    }

    // GET /analytics/summary
    if (pathname === "/analytics/summary" && method === "GET") {
      const period = urlObj.searchParams.get("period") || "weekly";
      const date = urlObj.searchParams.get("date") || toCalendarDateString(new Date());
      return getMockAnalytics(period, date) as unknown as T;
    }

    // GET /categories
    if (pathname === "/categories" && method === "GET") {
      return localCategories as unknown as T;
    }

    // POST /categories
    if (pathname === "/categories" && method === "POST") {
      const body = JSON.parse(options.body as string);
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        userId: "user-default",
        name: body.name,
        color: body.color || "#475569",
      };
      localCategories.push(newCat);
      return newCat as unknown as T;
    }

    return null as unknown as T;
  }

  // Contract Methods:
  async getMonthStatus(year: number, month: number): Promise<MonthStatusResponse> {
    return this.request<MonthStatusResponse>(`/calendar/month?year=${year}&month=${month}`);
  }

  async getTasks(params?: {
    date?: string;
    completed?: boolean;
    priority?: PriorityLevel;
  }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set("date", params.date);
    if (params?.completed !== undefined) query.set("completed", String(params.completed));
    if (params?.priority) query.set("priority", params.priority);
    const queryString = query.toString();
    return this.request<Task[]>(`/tasks${queryString ? `?${queryString}` : ""}`);
  }

  async getTaskById(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(payload: CreateTaskRequest): Promise<Task> {
    return this.request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateTask(
    id: string,
    patch: UpdateTaskRequest,
    editScope: EditScope = "single"
  ): Promise<Task> {
    return this.request<Task>(`/tasks/${id}?editScope=${editScope}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }

  async deleteTask(id: string, scope: EditScope = "single"): Promise<void> {
    return this.request<void>(`/tasks/${id}?scope=${scope}`, {
      method: "DELETE",
    });
  }

  async completeTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/complete`, {
      method: "POST",
    });
  }

  async uncompleteTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/uncomplete`, {
      method: "POST",
    });
  }

  async getAnalyticsSummary(
    period: AnalyticsPeriod,
    date: string
  ): Promise<AnalyticsSummaryResponse> {
    return this.request<AnalyticsSummaryResponse>(
      `/analytics/summary?period=${period}&date=${date}`
    );
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories");
  }

  async createCategory(payload: { name: string; color?: string }): Promise<Category> {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();
