"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Post,
  Channel,
  Workspace,
  getStoredChannels,
  saveStoredChannels,
  getStoredPosts,
  saveStoredPosts,
  getStoredWorkspaces,
  saveStoredWorkspaces,
  getCurrentWorkspaceId,
  saveCurrentWorkspaceId,
  getApprovalFlowEnabled,
  setApprovalFlowEnabled as persistApprovalFlowEnabled,
  getHasUsedAi,
  setHasUsedAi as persistHasUsedAi,
  generateId,
} from "@/lib/store";

export type GhostPost = Post & { isGhost?: boolean; originalId?: string; ghostDate?: string };
export type Toast = { id: string; text: string; type: "success" | "error" | "info" };

interface PlanoContextValue {
  mounted: boolean;

  posts: Post[];
  expandedPosts: GhostPost[];
  updatePostsInStorage: (updated: Post[]) => void;
  handleDeletePost: (id: string) => void;
  handleSkipOccurrence: (originalId: string, dateStr: string) => void;
  handleRequestChanges: (postId: string, comment: string) => void;
  handleEditPost: (post: Post) => void;
  handleCreateOnDate: (dateStr: string) => void;

  channels: Channel[];
  updateChannelsInStorage: (updated: Channel[]) => void;
  handleToggleChannel: (id: string) => void;

  workspaces: Workspace[];
  currentWorkspaceId: string;
  handleSwitchWorkspace: (workspaceId: string) => void;
  handleCreateWorkspace: (name: string, color: string) => void;
  isWorkspaceDropdownOpen: boolean;
  setIsWorkspaceDropdownOpen: (open: boolean) => void;
  isNewWorkspaceModalOpen: boolean;
  setIsNewWorkspaceModalOpen: (open: boolean) => void;

  approvalFlowEnabled: boolean;
  toggleApprovalFlow: () => void;

  toasts: Toast[];
  triggerNotification: (text: string, type?: Toast["type"]) => void;

  hasUsedAi: boolean;
  markAiUsed: () => void;
}

const PlanoContext = createContext<PlanoContextValue | null>(null);

export function PlanoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>("elabram");
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);

  const [approvalFlowEnabled, setApprovalFlowEnabledState] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasUsedAi, setHasUsedAiState] = useState(false);

  const triggerNotification = useCallback((text: string, type: Toast["type"] = "success") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const markAiUsed = useCallback(() => {
    setHasUsedAiState(true);
    persistHasUsedAi();
  }, []);

  // Initialize and load data from LocalStorage (deferred one tick, same as
  // the original, to avoid a hydration mismatch on the first paint).
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);

      const storedWorkspaces = getStoredWorkspaces();
      setWorkspaces(storedWorkspaces);
      const activeWorkspaceId = getCurrentWorkspaceId();
      setCurrentWorkspaceId(activeWorkspaceId);

      setApprovalFlowEnabledState(getApprovalFlowEnabled(activeWorkspaceId));
      setPosts(getStoredPosts(activeWorkspaceId));
      setChannels(getStoredChannels(activeWorkspaceId));
      setHasUsedAiState(getHasUsedAi());
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const expandedPosts = useMemo<GhostPost[]>(() => {
    const result: GhostPost[] = [];
    for (const p of posts) {
      result.push(p);
      if (p.repeat && p.repeat !== "none" && p.scheduledAt) {
        const interval = parseInt(p.repeat, 10);
        if (!isNaN(interval)) {
          const startDate = new Date(p.scheduledAt);
          // generate for 90 days
          for (let i = 1; i * interval <= 90; i++) {
            const nextDate = new Date(startDate);
            nextDate.setDate(nextDate.getDate() + i * interval);
            const isoString = nextDate.toISOString();
            const dateStr = isoString.split("T")[0]; // YYYY-MM-DD
            if (!p.skippedOccurrences?.includes(dateStr)) {
              result.push({
                ...p,
                id: `${p.id}-ghost-${i}`,
                isGhost: true,
                originalId: p.id,
                scheduledAt: isoString.slice(0, 16),
                ghostDate: dateStr,
              });
            }
          }
        }
      }
    }
    return result;
  }, [posts]);

  const updatePostsInStorage = useCallback(
    (updated: Post[]) => {
      setPosts(updated);
      saveStoredPosts(updated, currentWorkspaceId);
    },
    [currentWorkspaceId]
  );

  const updateChannelsInStorage = useCallback(
    (updated: Channel[]) => {
      setChannels(updated);
      saveStoredChannels(updated, currentWorkspaceId);
    },
    [currentWorkspaceId]
  );

  const handleToggleChannel = useCallback(
    (id: string) => {
      const updated = channels.map((c) => {
        if (c.id === id) {
          const nextState = !c.connected;
          triggerNotification(
            `${c.name} is now ${nextState ? "connected" : "disconnected"}.`,
            nextState ? "success" : "info"
          );
          return { ...c, connected: nextState };
        }
        return c;
      });
      updateChannelsInStorage(updated);
    },
    [channels, updateChannelsInStorage, triggerNotification]
  );

  const handleDeletePost = useCallback(
    (id: string) => {
      const updated = posts.filter((p) => p.id !== id);
      updatePostsInStorage(updated);
      triggerNotification("Post deleted.", "info");
    },
    [posts, updatePostsInStorage, triggerNotification]
  );

  const handleSkipOccurrence = useCallback(
    (originalId: string, dateStr: string) => {
      const updated = posts.map((p) => {
        if (p.id === originalId) {
          return {
            ...p,
            skippedOccurrences: [...(p.skippedOccurrences || []), dateStr],
          };
        }
        return p;
      });
      updatePostsInStorage(updated);
      triggerNotification("Occurrence skipped.", "info");
    },
    [posts, updatePostsInStorage, triggerNotification]
  );

  const handleRequestChanges = useCallback(
    (postId: string, comment: string) => {
      if (!comment.trim()) return;
      const updated = posts.map((p) => {
        if (p.id === postId) {
          return { ...p, status: "draft" as const, approvalComment: comment.trim() };
        }
        return p;
      });
      updatePostsInStorage(updated);
      triggerNotification("Changes requested. Post returned to Drafts.", "info");
    },
    [posts, updatePostsInStorage, triggerNotification]
  );

  const handleEditPost = useCallback(
    (post: Post) => {
      router.push(`/compose?edit=${post.id}`);
      triggerNotification("Loaded post into composer.", "info");
    },
    [router, triggerNotification]
  );

  const handleCreateOnDate = useCallback(
    (dateStr: string) => {
      router.push(`/compose?date=${dateStr}`);
      triggerNotification(`Creating a post for ${dateStr}`, "info");
    },
    [router, triggerNotification]
  );

  const handleSwitchWorkspace = useCallback(
    (workspaceId: string) => {
      setCurrentWorkspaceId(workspaceId);
      saveCurrentWorkspaceId(workspaceId);

      setApprovalFlowEnabledState(getApprovalFlowEnabled(workspaceId));

      const loadedPosts = getStoredPosts(workspaceId);
      const loadedChannels = getStoredChannels(workspaceId);
      setPosts(loadedPosts);
      setChannels(loadedChannels);

      const wsName = workspaces.find((w) => w.id === workspaceId)?.name || workspaceId;
      triggerNotification(`Switched to workspace: ${wsName}`, "success");
    },
    [workspaces, triggerNotification]
  );

  const handleCreateWorkspace = useCallback(
    (name: string, color: string) => {
      if (!name.trim()) return;

      const id = "ws_" + generateId();
      const newWorkspace: Workspace = { id, name: name.trim(), color };

      const updatedWorkspaces = [...workspaces, newWorkspace];
      setWorkspaces(updatedWorkspaces);
      saveStoredWorkspaces(updatedWorkspaces);

      setCurrentWorkspaceId(id);
      saveCurrentWorkspaceId(id);
      setApprovalFlowEnabledState(false);
      persistApprovalFlowEnabled(id, false);

      const loadedPosts = getStoredPosts(id);
      const loadedChannels = getStoredChannels(id);
      setPosts(loadedPosts);
      setChannels(loadedChannels);

      setIsNewWorkspaceModalOpen(false);

      triggerNotification(`Workspace "${newWorkspace.name}" created successfully!`, "success");
    },
    [workspaces, triggerNotification]
  );

  const toggleApprovalFlow = useCallback(() => {
    const newVal = !approvalFlowEnabled;
    setApprovalFlowEnabledState(newVal);
    persistApprovalFlowEnabled(currentWorkspaceId, newVal);
    triggerNotification(newVal ? "Approval flow enabled!" : "Approval flow disabled.", "info");
  }, [approvalFlowEnabled, currentWorkspaceId, triggerNotification]);

  const value: PlanoContextValue = {
    mounted,
    posts,
    expandedPosts,
    updatePostsInStorage,
    handleDeletePost,
    handleSkipOccurrence,
    handleRequestChanges,
    handleEditPost,
    handleCreateOnDate,
    channels,
    updateChannelsInStorage,
    handleToggleChannel,
    workspaces,
    currentWorkspaceId,
    handleSwitchWorkspace,
    handleCreateWorkspace,
    isWorkspaceDropdownOpen,
    setIsWorkspaceDropdownOpen,
    isNewWorkspaceModalOpen,
    setIsNewWorkspaceModalOpen,
    approvalFlowEnabled,
    toggleApprovalFlow,
    toasts,
    triggerNotification,
    hasUsedAi,
    markAiUsed,
  };

  return <PlanoContext.Provider value={value}>{children}</PlanoContext.Provider>;
}

export function usePlano() {
  const ctx = useContext(PlanoContext);
  if (!ctx) throw new Error("usePlano must be used within a PlanoProvider");
  return ctx;
}
