"use client";

import type { StateCreator } from "zustand";
import type { Project, SubPiece, PieceStatus } from "@/lib/types";
import type { FocusState } from "../useFocusStore";
import { generateId } from "@/lib/utils";
import { XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE, LEVEL_THRESHOLDS, getLevelFromXp } from "@/lib/constants";

function getFortressLevelFromXp(xp: number): number {
  return getLevelFromXp(xp);
}

function getFortressHealthFromXp(xp: number): number {
  const level = getFortressLevelFromXp(xp);
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const current = LEVEL_THRESHOLDS[level - 1];
  const next = LEVEL_THRESHOLDS[level];
  return Math.round(((xp - current) / (next - current)) * 100);
}

export interface ProjectSlice {
  projects: Project[];
  activeProjectId: string | null;
  activeSubPieceId: string | null;
  projectOnlyFocus: boolean;

  addProject: (
    project: Omit<
      Project,
      | "id"
      | "createdAt"
      | "totalTimeSeconds"
      | "fortressLevel"
      | "fortressHealth"
      | "xp"
      | "subPieces"
      | "status"
    >
  ) => Project;
  updateProject: (id: string, updates: Partial<Omit<Project, "id" | "subPieces">>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  setActiveSubPiece: (projectId: string, subPieceId: string | null) => void;

  addSubPiece: (subPiece: Omit<SubPiece, "id" | "elapsedSeconds" | "status">) => SubPiece;
  updateSubPiece: (
    projectId: string,
    subPieceId: string,
    updates: Partial<Omit<SubPiece, "id" | "projectId">>
  ) => void;
  deleteSubPiece: (projectId: string, subPieceId: string) => void;
  reorderSubPieces: (projectId: string, orderedIds: string[]) => void;
  updateSubPieceStatus: (projectId: string, subPieceId: string, status: PieceStatus) => void;

  incrementProjectTime: (projectId: string, seconds: number) => void;
  incrementSubPieceTime: (projectId: string, subPieceId: string, seconds: number) => void;
  decrementProjectTime: (projectId: string, seconds: number) => void;
  decrementSubPieceTime: (projectId: string, subPieceId: string, seconds: number) => void;
  completeSubPiece: (projectId: string, subPieceId: string) => void;

  refocusSubPiece: (projectId: string, subPieceId: string, allocatedMinutes?: number) => void;

  resetSubPieceTime: (projectId: string, subPieceId: string) => void;

  getActiveProject: () => Project | undefined;
  getProjectById: (id: string) => Project | undefined;
  getSubPieceById: (projectId: string, subPieceId: string) => SubPiece | undefined;
  getCompletedSubPiecesCount: (projectId: string) => number;
  getTotalAllocatedMinutes: (projectId: string) => number;
  getProjectProgress: (projectId: string) => number;
}

export const createProjectSlice: StateCreator<FocusState, [], [], ProjectSlice> = (set, get) => ({
  projects: [],
  activeProjectId: null,
  activeSubPieceId: null,
  projectOnlyFocus: false,

  addProject: (project) => {
    const newProject: Project = {
      id: generateId(),
      name: project.name,
      description: project.description,
      color: project.color,
      createdAt: Date.now(),
      totalTimeSeconds: 0,
      targetTimeSeconds: project.targetTimeSeconds,
      status: "idle",
      fortressLevel: 1,
      fortressHealth: 100,
      xp: 0,
      subPieces: [],
    };
    set((state) => ({
      projects: [...state.projects, newProject],
      activeProjectId: state.activeProjectId ?? newProject.id,
    }));
    return newProject;
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId:
        state.activeProjectId === id
          ? state.projects.find((p) => p.id !== id)?.id ?? null
          : state.activeProjectId,
    }));
  },

  setActiveProject: (id) => {
    set((state) => ({
      activeProjectId: id,
      activeSubPieceId: null,
      projectOnlyFocus: true,
      projects: state.projects.map((p) => {
        if (p.id === id) return { ...p, status: "running" as PieceStatus };
        if (p.status === "running") return { ...p, status: "idle" as PieceStatus };
        return p;
      }),
    }));
  },

  setActiveSubPiece: (projectId, subPieceId) => {
    if (subPieceId === null) {
      set({ activeSubPieceId: null, projectOnlyFocus: false });
      return;
    }
    const project = get().projects.find((p) => p.id === projectId);
    const found = project?.subPieces.find((sp) => sp.id === subPieceId);
    if (found) {
      set({ activeSubPieceId: subPieceId, projectOnlyFocus: false });
    }
  },

  addSubPiece: (subPiece) => {
    const newSubPiece: SubPiece = {
      id: generateId(),
      projectId: subPiece.projectId,
      name: subPiece.name,
      allocatedMinutes: subPiece.allocatedMinutes,
      elapsedSeconds: 0,
      status: "idle",
      order: subPiece.order,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === subPiece.projectId ? { ...p, subPieces: [...p.subPieces, newSubPiece] } : p
      ),
    }));
    return newSubPiece;
  },

  updateSubPiece: (projectId, subPieceId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subPieces: p.subPieces.map((sp) =>
                sp.id === subPieceId ? { ...sp, ...updates } : sp
              ),
            }
          : p
      ),
    }));
  },

  deleteSubPiece: (projectId, subPieceId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, subPieces: p.subPieces.filter((sp) => sp.id !== subPieceId) }
          : p
      ),
    }));
  },

  reorderSubPieces: (projectId, orderedIds) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const idToIndex = new Map(orderedIds.map((id, idx) => [id, idx]));
        const sorted = [...p.subPieces].sort(
          (a, b) => (idToIndex.get(a.id) ?? a.order) - (idToIndex.get(b.id) ?? b.order)
        );
        return {
          ...p,
          subPieces: sorted.map((sp, idx) => ({ ...sp, order: idx })),
        };
      }),
    }));
  },

  updateSubPieceStatus: (projectId, subPieceId, status) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subPieces: p.subPieces.map((sp) =>
                sp.id === subPieceId ? { ...sp, status } : sp
              ),
            }
          : p
      ),
    }));
  },

  incrementProjectTime: (projectId, seconds) => {
    const xpToAdd = Math.floor(seconds / 60) * XP_PER_MINUTE;
    const today = new Date().toISOString().slice(0, 10);
    set((state) => {
      const lastDate = state.settings.lastFocusDate;
      const newTodayFocus =
        lastDate !== today ? seconds : state.settings.todayFocusSeconds + seconds;

      // Streak logic
      const goalSeconds = state.settings.dailyFocusGoalMinutes * 60;
      let { currentStreak, longestStreak, lastStreakDate } = state.settings;
      if (newTodayFocus >= goalSeconds && lastStreakDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        if (lastStreakDate === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        longestStreak = Math.max(longestStreak, currentStreak);
        lastStreakDate = today;
      }

      return {
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          const newXp = p.xp + xpToAdd;
          return {
            ...p,
            totalTimeSeconds: p.totalTimeSeconds + seconds,
            xp: newXp,
            fortressLevel: getFortressLevelFromXp(newXp),
            fortressHealth: getFortressHealthFromXp(newXp),
          };
        }),
        settings: {
          ...state.settings,
          todayFocusSeconds: newTodayFocus,
          lastFocusDate: today,
          currentStreak,
          longestStreak,
          lastStreakDate,
        },
      };
    });
  },

  incrementSubPieceTime: (projectId, subPieceId, seconds) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subPieces: p.subPieces.map((sp) =>
                sp.id === subPieceId ? { ...sp, elapsedSeconds: sp.elapsedSeconds + seconds } : sp
              ),
            }
          : p
      ),
    }));
  },

  decrementProjectTime: (projectId, seconds) => {
    const xpToSubtract = Math.floor(seconds / 60) * XP_PER_MINUTE;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const newXp = Math.max(0, p.xp - xpToSubtract);
        return {
          ...p,
          totalTimeSeconds: Math.max(0, p.totalTimeSeconds - seconds),
          xp: newXp,
          fortressLevel: getFortressLevelFromXp(newXp),
          fortressHealth: getFortressHealthFromXp(newXp),
        };
      }),
      settings: {
        ...state.settings,
        todayFocusSeconds: Math.max(0, state.settings.todayFocusSeconds - seconds),
      },
    }));
  },

  decrementSubPieceTime: (projectId, subPieceId, seconds) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subPieces: p.subPieces.map((sp) =>
                sp.id === subPieceId
                  ? { ...sp, elapsedSeconds: Math.max(0, sp.elapsedSeconds - seconds) }
                  : sp
              ),
            }
          : p
      ),
    }));
  },

  completeSubPiece: (projectId, subPieceId) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedSubPieces = p.subPieces.map((sp) =>
          sp.id === subPieceId ? { ...sp, status: "completed" as PieceStatus } : sp
        );
        const allCompleted = updatedSubPieces.length > 0 && updatedSubPieces.every((sp) => sp.status === "completed");
        const newXp = p.xp + XP_SUB_PIECE_COMPLETE;
        return {
          ...p,
          xp: newXp,
          fortressLevel: getFortressLevelFromXp(newXp),
          fortressHealth: getFortressHealthFromXp(newXp),
          status: allCompleted ? ("completed" as PieceStatus) : p.status,
          subPieces: updatedSubPieces,
        };
      }),
    }));
  },

  refocusSubPiece: (projectId, subPieceId, allocatedMinutes) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedSubPieces = p.subPieces.map((sp) => {
          if (sp.id !== subPieceId) return sp;
          return {
            ...sp,
            status: "idle" as PieceStatus,
            elapsedSeconds: 0,
            allocatedMinutes:
              allocatedMinutes !== undefined && allocatedMinutes > 0
                ? allocatedMinutes
                : sp.allocatedMinutes,
          };
        });
        const allCompleted = updatedSubPieces.length > 0 && updatedSubPieces.every((sp) => sp.status === "completed");
        return {
          ...p,
          status: allCompleted ? ("completed" as PieceStatus) : "idle" as PieceStatus,
          subPieces: updatedSubPieces,
        };
      }),
    }));
  },

  resetSubPieceTime: (projectId, subPieceId) => {
    set((state) => {
      const project = state.projects.find((p) => p.id === projectId);
      const subPiece = project?.subPieces.find((sp) => sp.id === subPieceId);
      if (!project || !subPiece) return state;

      const elapsedSeconds = subPiece.elapsedSeconds;
      const xpToSubtract = Math.floor(elapsedSeconds / 60) * XP_PER_MINUTE;
      const newXp = Math.max(0, project.xp - xpToSubtract);

      const updatedSubPieces = project.subPieces.map((sp) =>
        sp.id === subPieceId ? { ...sp, elapsedSeconds: 0, status: "idle" as PieceStatus } : sp
      );
      const allCompleted = updatedSubPieces.length > 0 && updatedSubPieces.every((sp) => sp.status === "completed");

      return {
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            subPieces: updatedSubPieces,
            totalTimeSeconds: Math.max(0, p.totalTimeSeconds - elapsedSeconds),
            xp: newXp,
            fortressLevel: getFortressLevelFromXp(newXp),
            fortressHealth: getFortressHealthFromXp(newXp),
            status: allCompleted ? ("completed" as PieceStatus) : "idle" as PieceStatus,
          };
        }),
        settings: {
          ...state.settings,
          todayFocusSeconds: Math.max(0, state.settings.todayFocusSeconds - elapsedSeconds),
        },
      };
    });
  },

  getActiveProject: () => {
    const { projects, activeProjectId } = get();
    return projects.find((p) => p.id === activeProjectId);
  },

  getProjectById: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  getSubPieceById: (projectId, subPieceId) => {
    const project = get().projects.find((p) => p.id === projectId);
    return project?.subPieces.find((sp) => sp.id === subPieceId);
  },

  getCompletedSubPiecesCount: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    return project?.subPieces.filter((sp) => sp.status === "completed").length ?? 0;
  },

  getTotalAllocatedMinutes: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    return project?.subPieces.reduce((sum, sp) => sum + sp.allocatedMinutes, 0) ?? 0;
  },

  getProjectProgress: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project || project.subPieces.length === 0) return 0;
    const completed = project.subPieces.filter((sp) => sp.status === "completed").length;
    return Math.round((completed / project.subPieces.length) * 100);
  },
});
