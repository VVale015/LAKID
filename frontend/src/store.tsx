// store.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Assignment, Role, Student } from "./types";
import { students as initialStudents, initialAssignments, activityLibrary } from "./data";
import { todayISO } from "./utils/assignments";

interface AppContextValue {
  role: Role | null;
  setRole: (r: Role | null) => void;
  currentUser: string;
  setCurrentUser: (u: string) => void;
  currentStudent: Student | null;
  setCurrentStudentId: (id: string) => void;
  allStudents: Student[];
  assignments: Assignment[];
  assignActivity: (studentId: string, activityId: string, dueDate: string | null) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  completeActivity: (studentId: string, area: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "lakid-state";

interface StoredState {
  role: Role | null;
  currentUser: string;
  currentStudentId: string | null;
  students: Student[];
  assignments: Assignment[];
}

const DEFAULT_STATE: StoredState = {
  role: null,
  currentUser: "",
  currentStudentId: null,
  students: initialStudents,
  assignments: initialAssignments,
};

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<StoredState>) };
  } catch {
    // ignore
  }
  return DEFAULT_STATE;
}

function markOldestPendingAssignment(assignments: Assignment[], studentId: string, area: string): Assignment[] {
  const target = assignments.find(
    (a) =>
      a.studentId === studentId &&
      !a.completedAt &&
      activityLibrary.find((act) => act.id === a.activityId)?.area === area,
  );
  if (!target) return assignments;
  return assignments.map((a) => (a === target ? { ...a, completedAt: todayISO() } : a));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const currentStudent = state.currentStudentId
    ? state.students.find((s) => s.id === state.currentStudentId) ?? null
    : null;

  const setRole = (r: Role | null) => setState((p) => ({ ...p, role: r }));
  const setCurrentUser = (u: string) => setState((p) => ({ ...p, currentUser: u }));
  const setCurrentStudentId = (id: string) => setState((p) => ({ ...p, currentStudentId: id }));

  const updateStudent = (id: string, updates: Partial<Student>) =>
    setState((p) => ({
      ...p,
      students: p.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));

  const assignActivity = (studentId: string, activityId: string, dueDate: string | null) =>
    setState((p) => ({
      ...p,
      assignments: [
        ...p.assignments,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          studentId,
          activityId,
          assignedAt: todayISO(),
          dueDate,
          completedAt: null,
        },
      ],
    }));

  const completeActivity = (studentId: string, area: string) =>
    setState((p) => ({
      ...p,
      assignments: markOldestPendingAssignment(p.assignments, studentId, area),
      students: p.students.map((s) => {
        if (s.id !== studentId) return s;
        const areaProgress = { ...s.areaProgress };
        const areaActivities = { ...s.areaActivities };
        if (area in areaProgress) {
          areaProgress[area as keyof typeof areaProgress] = Math.min(100, areaProgress[area as keyof typeof areaProgress] + 10);
          areaActivities[area as keyof typeof areaActivities] += 1;
        }
        const total = Object.values(areaProgress).reduce((a, b) => a + b, 0);
        const newProgress = Math.round(total / 4);
        return {
          ...s,
          areaProgress,
          areaActivities,
          activitiesCompleted: s.activitiesCompleted + 1,
          progress: newProgress,
        };
      }),
    }));

  return (
    <AppContext.Provider
      value={{
        role: state.role,
        setRole,
        currentUser: state.currentUser,
        setCurrentUser,
        currentStudent,
        setCurrentStudentId,
        allStudents: state.students,
        assignments: state.assignments,
        assignActivity,
        updateStudent,
        completeActivity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
