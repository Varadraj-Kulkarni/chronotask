/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TaskItem } from "@/components/tasks/TaskItem";
import { CompletionModal } from "@/components/tasks/CompletionModal";
import { toCalendarDateString } from "@/lib/dateUtils";

const todayStr = toCalendarDateString(new Date());

const mockTask: Task = {
  id: "task-102",
  userId: "user-default",
  title: "Deploy Gateway Update",
  description: "Verify canary deployments",
  date: todayStr,
  dueTime: null,
  completed: false,
  completedAt: null,
  priority: "URGENT",
  categoryId: "cat-2",
  recurrenceId: null,
  createdAt: "2026-08-30T09:15:00Z",
  updatedAt: "2026-08-30T09:15:00Z",
};

describe("Deliverable 3 & 8: Two-Step Completion Confirmation Workflow", () => {
  afterEach(() => {
    cleanup();
  });
  it("clicking task checkbox triggers confirmation handler instead of direct mutation", () => {
    const handleInitiateComplete = vi.fn();
    const handleUncomplete = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        onInitiateComplete={handleInitiateComplete}
        onUncomplete={handleUncomplete}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Non-negotiable interaction rule:
    // Checkbox click MUST NOT immediately uncomplete or bypass confirmation
    expect(handleInitiateComplete).toHaveBeenCalledTimes(1);
    expect(handleInitiateComplete).toHaveBeenCalledWith(mockTask);
    expect(handleUncomplete).not.toHaveBeenCalled();
  });

  it("renders CompletionModal with title, date, and accessible dialog attributes", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <CompletionModal
        task={mockTask}
        isOpen={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(screen.getByText("Complete Task?")).toBeDefined();
    expect(screen.getByText(/Deploy Gateway Update/i)).toBeDefined();

    // Clicking Cancel fires onCancel
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("triggers confirmation when Confirm button is clicked", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <CompletionModal
        task={mockTask}
        isOpen={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmBtn = screen.getByText(/Confirm/i);
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders overdue options when completing a past task", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    const overdueTask: Task = {
      ...mockTask,
      date: "2026-08-15",
    };

    render(
      <CompletionModal
        task={overdueTask}
        isOpen={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText("Complete Overdue Task?")).toBeDefined();

    const postponeBtn = screen.getByRole("button", {
      name: /Complete & Postpone to Today/i,
    });
    expect(postponeBtn).toBeDefined();
    fireEvent.click(postponeBtn);
    expect(handleConfirm).toHaveBeenCalledWith(true);
  });
});
