import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { POST as createTask } from "@/app/api/tasks/route";
import { POST as rescheduleTask } from "@/app/api/tasks/[id]/reschedule/route";
import { POST as completeTask } from "@/app/api/tasks/[id]/complete/route";
import { toCalendarDateString } from "@/lib/dateUtils";
import { addDays } from "@/lib/recurrence";

describe("Reschedule & Completion Endpoints Integration Tests", () => {
  let userId: string;
  const todayStr = toCalendarDateString(new Date());

  beforeEach(async () => {
    await db.task.deleteMany({});
    await db.user.deleteMany({});

    const user = await db.user.create({
      data: {
        id: "user-default",
        email: "test@chronotask.internal",
        name: "Test User",
      },
    });
    userId = user.id;
  });

  it("POST /api/tasks/[id]/reschedule (POSTPONE): moves to future date and tracks history", async () => {
    const task = await db.task.create({
      data: {
        userId,
        title: "Submit Taxes",
        date: "2026-09-10",
        completed: false,
        priority: "HIGH",
        dueTime: "15:00",
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/tasks/${task.id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({
        newDate: "2026-09-15",
        actionType: "POSTPONE",
      }),
    });

    const res = await rescheduleTask(req, { params: { id: task.id } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.date).toBe("2026-09-15");
    expect(json.rescheduledFrom).toBe("2026-09-10");
    expect(json.originalDate).toBe("2026-09-10");
    expect(json.rescheduleType).toBe("POSTPONED");
    expect(json.rescheduleCount).toBe(1);
    expect(json.dueTime).toBe("15:00"); // Preserves dueTime
  });

  it("POST /api/tasks/[id]/reschedule (POSTPONE): rejects same or past destination date", async () => {
    const task = await db.task.create({
      data: {
        userId,
        title: "Gym Workout",
        date: "2026-09-10",
        completed: false,
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/tasks/${task.id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({
        newDate: "2026-09-10", // Same date -> invalid for postpone!
        actionType: "POSTPONE",
      }),
    });

    const res = await rescheduleTask(req, { params: { id: task.id } });
    expect(res.status).toBe(422);

    const json = await res.json();
    expect(json.message).toContain("A postponed task must be moved to a future date.");
  });

  it("POST /api/tasks/[id]/reschedule (PREPONE): prepones future task down to today", async () => {
    const futureDate = addDays(todayStr, 5);
    const task = await db.task.create({
      data: {
        userId,
        title: "Dentist Visit",
        date: futureDate,
        completed: false,
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/tasks/${task.id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({
        newDate: todayStr,
        actionType: "PREPONE",
      }),
    });

    const res = await rescheduleTask(req, { params: { id: task.id } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.date).toBe(todayStr);
    expect(json.rescheduledFrom).toBe(futureDate);
    expect(json.rescheduleType).toBe("PREPONED");
  });

  it("POST /api/tasks/[id]/reschedule (PREPONE): rejects destination date that has already passed", async () => {
    const futureDate = addDays(todayStr, 5);
    const pastDate = addDays(todayStr, -2);
    const task = await db.task.create({
      data: {
        userId,
        title: "Future Deliverable",
        date: futureDate,
        completed: false,
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/tasks/${task.id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({
        newDate: pastDate, // Past date -> strictly forbidden!
        actionType: "PREPONE",
      }),
    });

    const res = await rescheduleTask(req, { params: { id: task.id } });
    expect(res.status).toBe(422);

    const json = await res.json();
    expect(json.message).toContain("A task cannot be preponed to a date that has already passed.");
  });

  it("POST /api/tasks (Duplicate Detection): warns if task with same name exists on same date", async () => {
    // 1. Create initial task
    const req1 = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "Study",
        date: todayStr,
      }),
    });
    const res1 = await createTask(req1);
    expect(res1.status).toBe(201);

    // 2. Attempt duplicate without allowDuplicate
    const req2 = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "Study",
        date: todayStr,
      }),
    });
    const res2 = await createTask(req2);
    expect(res2.status).toBe(409);
    const json2 = await res2.json();
    expect(json2.code).toBe("DUPLICATE_TASK_WARNING");

    // 3. User overrides with allowDuplicate: true
    const req3 = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "Study",
        date: todayStr,
        allowDuplicate: true,
      }),
    });
    const res3 = await createTask(req3);
    expect(res3.status).toBe(201);
  });

  it("POST /api/tasks/[id]/complete (Overdue Task): complete & postpone to today", async () => {
    const overdueDate = addDays(todayStr, -4);
    const oldTask = await db.task.create({
      data: {
        userId,
        title: "Clean Garage",
        date: overdueDate,
        completed: false,
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/tasks/${oldTask.id}/complete`, {
      method: "POST",
      body: JSON.stringify({
        postponeToToday: true,
      }),
    });

    const res = await completeTask(req, { params: { id: oldTask.id } });
    expect(res.status).toBe(200);

    const json = await res.json();
    // 1. Old task marked complete for historical accuracy
    expect(json.completed).toBe(true);
    expect(json.date).toBe(overdueDate);

    // 2. Today's linked occurrence created
    expect(json.todayOccurrence).toBeDefined();
    expect(json.todayOccurrence.date).toBe(todayStr);
    expect(json.todayOccurrence.rescheduledFrom).toBe(overdueDate);

    // Verify in database
    const todayDbTask = await db.task.findUnique({
      where: { id: json.todayOccurrence.id },
    });
    expect(todayDbTask).toBeDefined();
    expect(todayDbTask?.completed).toBe(true);
    expect(todayDbTask?.rescheduleType).toBe("OVERDUE_COMPLETED");
  });
});
