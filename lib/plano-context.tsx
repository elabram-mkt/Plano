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
  getApprovalFlowEnabled,
  setApprovalFlowEnabled as persistApprovalFlowEnabled,
  getHasUsedAi,
  setHasUsedAi as persistHasUsedAi,
  generateId,
} from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { deletePost, updatePost } from "@/lib/db/posts";

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
  // Real workspace UUID selected in components/workspace-switcher.tsx — null
  // until that component's Supabase fetch resolves and seeds a default.
  // This is the single source of truth for which workspace's posts/channels
  // are loaded; the mock `workspaces` list above is unrelated legacy state
  // still used by the (currently unreachable) NewWorkspaceModal.
  currentWorkspaceId: string | null;
  // Quiet switch: updates currentWorkspaceId and reloads posts/channels/
  // approval-flow for it, no toast. Used by WorkspaceSwitcher to seed the
  // initial default workspace once its fetch resolves.
  setCurrentWorkspaceId: (workspaceId: string) => void;
  // Same as setCurrentWorkspaceId, plus a "Switched to workspace" toast.
  // Used by WorkspaceSwitcher when the user explicitly picks a workspace.
  handleSwitchWorkspace: (workspaceId: string, workspaceName?: string) => void;
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
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null);
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
  // Posts/channels/approval-flow are NOT seeded here anymore — there's no
  // valid workspace id until WorkspaceSwitcher's Supabase fetch resolves and
  // calls setCurrentWorkspaceId below.
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);

      const storedWorkspaces = getStoredWorkspaces();
      setWorkspaces(storedWorkspaces);
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
      // Falls back to whichever workspace lib/store.ts's internal fallback
      // resolves if called with no workspace selected yet — shouldn't happen
      // in practice since post-editing UI implies a workspace is active.
      saveStoredPosts(updated, currentWorkspaceId ?? undefined);
    },
    [currentWorkspaceId]
  );

  const updateChannelsInStorage = useCallback(
    (updated: Channel[]) => {
      setChannels(updated);
      // Optimistic: local state updates immediately, the real
      // connect/disconnect write to social_accounts happens in the
      // background. Nothing to persist to if no workspace is selected yet.
      if (!currentWorkspaceId) return;
      saveStoredChannels(updated, currentWorkspaceId).catch((err) => {
        console.error("Failed to save channel changes:", err);
        triggerNotification("Failed to save channel changes.", "error");
      });
    },
    [currentWorkspaceId, triggerNotification]
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
    async (id: string) => {
      try {
        const supabase = createClient();
        await deletePost(supabase, id);
        setPosts((prev) => prev.filter((p) => p.id !== id));
        triggerNotification("Post deleted.", "info");
      } catch (err) {
        console.error("Failed to delete post:", err);
        triggerNotification("Failed to delete post.", "error");
      }
    },
    [triggerNotification]
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
    async (postId: string, comment: string) => {
      if (!comment.trim()) return;
      try {
        const supabase = createClient();
        const updated = await updatePost(supabase, postId, {
          status: "draft",
          approvalComment: comment.trim(),
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  status: updated.status as Post["status"],
                  approvalComment: updated.approval_comment ?? undefined,
                }
              : p
          )
        );
        triggerNotification("Changes requested. Post returned to Drafts.", "info");
      } catch (err) {
        console.error("Failed to request changes:", err);
        triggerNotification("Failed to request changes.", "error");
      }
    },
    [triggerNotification]
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

  const setCurrentWorkspaceId = useCallback((workspaceId: string) => {
    setCurrentWorkspaceIdState(workspaceId);
    setApprovalFlowEnabledState(getApprovalFlowEnabled(workspaceId));
    setPosts(getStoredPosts(workspaceId));
    getStoredChannels(workspaceId)
      .then(setChannels)
      .catch((err) => console.error("Failed to load channels:", err));
  }, []);

  const handleSwitchWorkspace = useCallback(
    (workspaceId: string, workspaceName?: string) => {
      setCurrentWorkspaceId(workspaceId);
      const wsName = workspaceName || workspaces.find((w) => w.id === workspaceId)?.name || workspaceId;
      triggerNotification(`Switched to workspace: ${wsName}`, "success");
    },
    [workspaces, setCurrentWorkspaceId, triggerNotification]
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
      setApprovalFlowEnabledState(false);
      persistApprovalFlowEnabled(id, false);

      // setCurrentWorkspaceId above already loads posts/channels for `id`.

      setIsNewWorkspaceModalOpen(false);

      triggerNotification(`Workspace "${newWorkspace.name}" created successfully!`, "success");
    },
    [workspaces, setCurrentWorkspaceId, triggerNotification]
  );

  const toggleApprovalFlow = useCallback(() => {
    if (!currentWorkspaceId) return;
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
    setCurrentWorkspaceId,
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
