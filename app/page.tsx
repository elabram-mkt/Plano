"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  PlusSquare,
  Clock,
  Layers,
  BarChart3,
  Bot,
  Settings as SettingsIcon,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Video,
  Hash,
  Trash2,
  Edit3,
  Sparkles,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
  Globe,
  ChevronDown,
  Check,
  Briefcase,
  Plus,
  Clipboard,
  Palette,
  Scissors,
  Copy,
  ArrowRight,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Post,
  Channel,
  Workspace,
  ProductionBrief,
  PLATFORMS_CONFIG,
  getStoredChannels,
  saveStoredChannels,
  getStoredPosts,
  saveStoredPosts,
  getStoredWorkspaces,
  saveStoredWorkspaces,
  getCurrentWorkspaceId,
  saveCurrentWorkspaceId,
  resetToDefaults,
} from "@/lib/storage";

const ALL_PERFORMING_POSTS = [
  {
    platforms: ["instagram"],
    caption: "Consistency is key when growing an organic audience...",
    imp: "24.8K",
    clicks: "1.4K",
    eng: "5.1%",
  },
  {
    platforms: ["x", "linkedin"],
    caption: "Super excited to launch Plano! 🚀 The ultimate social media scheduler...",
    imp: "18.2K",
    clicks: "980",
    eng: "4.8%",
  },
  {
    platforms: ["linkedin"],
    caption: "5 tips to supercharge your social media workflow using Plano AI...",
    imp: "15.4K",
    clicks: "740",
    eng: "4.1%",
  },
  {
    platforms: ["instagram", "tiktok"],
    caption: "Behind the scenes at Plano: How we design interfaces that feel...",
    imp: "12.8K",
    clicks: "610",
    eng: "3.9%",
  },
  {
    platforms: ["x", "threads"],
    caption: "Creating high-converting hooks is easier than you think...",
    imp: "11.2K",
    clicks: "490",
    eng: "3.1%",
  },
  {
    platforms: ["facebook"],
    caption: "Plan, schedule, and analyze your social media. All in one dashboard.",
    imp: "8.4K",
    clicks: "310",
    eng: "2.8%",
  },
  {
    platforms: ["threads"],
    caption: "What features are you most excited to see in the next Plano update? 👇",
    imp: "5.1K",
    clicks: "240",
    eng: "2.5%",
  },
];

function getKPIs(days: number, platform: string) {
  const baseMultipliers: Record<string, { imp: number; eng: number; fol: number; posts: number }> = {
    all: { imp: 1, eng: 1, fol: 1, posts: 1 },
    instagram: { imp: 0.42, eng: 1.23, fol: 0.55, posts: 0.35 },
    x: { imp: 0.28, eng: 0.55, fol: 0.22, posts: 0.45 },
    linkedin: { imp: 0.18, eng: 1.05, fol: 0.15, posts: 0.15 },
    facebook: { imp: 0.08, eng: 0.38, fol: 0.05, posts: 0.05 },
    tiktok: { imp: 0.35, eng: 1.52, fol: 0.65, posts: 0.25 },
    threads: { imp: 0.05, eng: 0.65, fol: 0.03, posts: 0.10 },
  };

  const mult = baseMultipliers[platform] || baseMultipliers.all;
  const daysMult = days === 7 ? 0.23 : (days === 90 ? 3.12 : 1.0);

  const impressionsRaw = Math.round(142800 * mult.imp * daysMult);
  const impressionsVal = impressionsRaw >= 1000 ? `${(impressionsRaw / 1000).toFixed(1)}K` : `${impressionsRaw}`;

  const engagementRaw = 3.42 * mult.eng * (days === 7 ? 1.04 : (days === 90 ? 0.92 : 1.0));
  const engagementVal = `${engagementRaw.toFixed(2)}%`;

  const followersRaw = Math.round(1240 * mult.fol * daysMult * (platform === "tiktok" ? 1.4 : 1.0));
  const followersVal = followersRaw >= 1000 ? `+${(followersRaw / 1000).toFixed(1)}K` : `+${followersRaw}`;

  const postsRaw = Math.round(56 * mult.posts * (days === 7 ? 0.25 : (days === 90 ? 2.85 : 1.0)));
  const postsVal = `${postsRaw} posts`;

  const impDiff = (platform === "facebook" ? -2.4 : 12.4) * (days === 7 ? 0.8 : (days === 90 ? 1.4 : 1.0));
  const engDiff = (platform === "x" ? -0.3 : 0.8) * (days === 7 ? 1.2 : (days === 90 ? 0.6 : 1.0));
  const folDiff = (platform === "threads" ? -1.1 : 15.2) * (days === 7 ? 0.9 : (days === 90 ? 1.1 : 1.0));
  const postDiff = (platform === "linkedin" ? -1.5 : 5.4) * (days === 7 ? 0.5 : (days === 90 ? 1.2 : 1.0));

  return [
    {
      label: "Total Impressions",
      value: impressionsVal,
      diff: `${impDiff > 0 ? "+" : ""}${impDiff.toFixed(1)}%`,
      isUp: impDiff >= 0,
      desc: `vs prev ${days} days`,
    },
    {
      label: "Engagement Rate",
      value: engagementVal,
      diff: `${engDiff > 0 ? "+" : ""}${engDiff.toFixed(1)}%`,
      isUp: engDiff >= 0,
      desc: "average engagement index",
    },
    {
      label: "Followers Growth",
      value: followersVal,
      diff: `${folDiff > 0 ? "+" : ""}${folDiff.toFixed(1)}%`,
      isUp: folDiff >= 0,
      desc: "new net followers",
    },
    {
      label: "Posts Published",
      value: postsVal,
      diff: `${postDiff > 0 ? "+" : ""}${postDiff.toFixed(1)}%`,
      isUp: postDiff >= 0,
      desc: `within ${days}-day window`,
    },
  ];
}

function getLineChartData(days: number, platform: string) {
  let strokePath = "";
  let areaPath = "";
  let dots: { cx: number; cy: number; tooltip: string }[] = [];
  let peakText = "";

  const platFactors: Record<string, number> = {
    all: 1.0,
    instagram: 0.9,
    x: 1.15,
    linkedin: 0.8,
    facebook: 0.6,
    tiktok: 1.3,
    threads: 0.5,
  };
  const factor = platFactors[platform] || 1.0;

  if (days === 7) {
    strokePath = `M 10 ${100 - 30 * factor} C 60 ${100 - 80 * factor}, 110 ${100 - 15 * factor}, 150 ${100 - 65 * factor} S 240 ${100 - 90 * factor}, 290 ${100 - 40 * factor}`;
    areaPath = `${strokePath} L 290 120 L 10 120 Z`;
    dots = [
      { cx: 60, cy: Math.round(100 - 80 * factor), tooltip: `Peak: ${(8.5 * factor).toFixed(1)}K` },
      { cx: 150, cy: Math.round(100 - 65 * factor), tooltip: `Midweek: ${(6.2 * factor).toFixed(1)}K` },
      { cx: 290, cy: Math.round(100 - 40 * factor), tooltip: `Latest: ${(5.1 * factor).toFixed(1)}K` },
    ];
    peakText = `Peak Engagement: ${(8.5 * factor).toFixed(1)}K in 7-day window`;
  } else if (days === 90) {
    strokePath = `M 10 ${100 - 45 * factor} Q 40 ${100 - 10 * factor} 80 ${100 - 75 * factor} T 150 ${100 - 95 * factor} T 220 ${100 - 30 * factor} T 290 ${100 - 85 * factor}`;
    areaPath = `${strokePath} L 290 120 L 10 120 Z`;
    dots = [
      { cx: 80, cy: Math.round(100 - 75 * factor), tooltip: `Month 1: ${(32.4 * factor).toFixed(1)}K` },
      { cx: 150, cy: Math.round(100 - 95 * factor), tooltip: `Peak: ${(44.8 * factor).toFixed(1)}K` },
      { cx: 290, cy: Math.round(100 - 85 * factor), tooltip: `Month 3: ${(38.2 * factor).toFixed(1)}K` },
    ];
    peakText = `Peak Engagement: ${(44.8 * factor).toFixed(1)}K in 90-day window`;
  } else {
    strokePath = `M 10 ${100 - 35 * factor} Q 50 ${100 - 95 * factor} 100 ${100 - 50 * factor} T 180 ${100 - 90 * factor} T 250 ${100 - 35 * factor} T 290 ${100 - 100 * factor}`;
    areaPath = `${strokePath} L 290 120 L 10 120 Z`;
    dots = [
      { cx: 100, cy: Math.round(100 - 50 * factor), tooltip: `Week 2: ${(11.5 * factor).toFixed(1)}K` },
      { cx: 180, cy: Math.round(100 - 90 * factor), tooltip: `Peak: ${(14.2 * factor).toFixed(1)}K` },
      { cx: 290, cy: Math.round(100 - 100 * factor), tooltip: `Latest: ${(15.8 * factor).toFixed(1)}K` },
    ];
    peakText = `Peak Engagement: ${(14.2 * factor).toFixed(1)}K on July 11`;
  }

  return { strokePath, areaPath, dots, peakText };
}

function getBarChartData(days: number, selectedPlatform: string) {
  const baseRates = [
    { name: "Inst", id: "instagram", rate: 85, color: "#E1306C", text: "4.2" },
    { name: "X", id: "x", rate: 50, color: "#3A3F47", text: "1.8" },
    { name: "Lkd", id: "linkedin", rate: 75, color: "#0A66C2", text: "3.5" },
    { name: "FB", id: "facebook", rate: 35, color: "#1877F2", text: "1.2" },
    { name: "Tik", id: "tiktok", rate: 92, color: "#FE2C55", text: "5.1" },
    { name: "Thr", id: "threads", rate: 45, color: "#A855F7", text: "2.1" },
  ];

  const daysFactor = days === 7 ? 1.12 : (days === 90 ? 0.88 : 1.0);

  return baseRates.map((bar) => {
    const calculatedRate = bar.rate * daysFactor;
    const height = Math.min(Math.round(calculatedRate), 100);
    const textVal = (parseFloat(bar.text) * daysFactor).toFixed(2) + "%";

    const isHighlighted = selectedPlatform === "all" || selectedPlatform.toLowerCase() === bar.id;
    const opacity = isHighlighted ? 1.0 : 0.3;

    return {
      ...bar,
      height,
      textVal,
      opacity,
    };
  });
}

function generateId(): string {
  return String(Math.floor(Math.random() * 10000000) + Date.now());
}

export default function PlanoApp() {
  // Navigation & Hydration States
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<
    "calendar" | "create" | "queue" | "channels" | "assistant" | "analytics" | "settings"
  >("calendar");

  // Database States
  const [posts, setPosts] = useState<Post[]>([]);

  const expandedPosts = useMemo(() => {
    const result = [];
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

  const [channels, setChannels] = useState<Channel[]>([]);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 6, 14)); // Seed is set around July 2026

  // Post Composer state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [isCustomized, setIsCustomized] = useState(false);
  const [activeCaptionTab, setActiveCaptionTab] = useState<string | null>(null);
  const [media, setMedia] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("2026-07-14T12:00");
  const [composerStatus, setComposerStatus] = useState<"scheduled" | "draft">("scheduled");
  const [repeat, setRepeat] = useState<"none" | "7" | "14" | "30">("none");
  const [mediaDragging, setMediaDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<string | null>(null);
  const [isLinkedInCollapsed, setIsLinkedInCollapsed] = useState(true);

  const computedActivePreviewTab = activePreviewTab && selectedPlatforms.includes(activePreviewTab)
    ? activePreviewTab
    : (selectedPlatforms[0] || null);

  const computedActiveCaptionTab = activeCaptionTab && selectedPlatforms.includes(activeCaptionTab)
    ? activeCaptionTab
    : (selectedPlatforms[0] || null);

  // AI Assistant state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [assistantTab, setAssistantTab] = useState<"chat" | "plan">("chat");

  // Content Plan Generator State
  const [planBusinessDesc, setPlanBusinessDesc] = useState("");
  const [planAudience, setPlanAudience] = useState("");
  const [planFrequency, setPlanFrequency] = useState("3x/week");
  const [planLanguage, setPlanLanguage] = useState("English");
  const [planPlatforms, setPlanPlatforms] = useState<string[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any[]>([]);

  // AI Write Popover State
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLanguage, setAiLanguage] = useState("English");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // AI Hashtags State
  const [isHashtagsPopoverOpen, setIsHashtagsPopoverOpen] = useState(false);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  // AI Hook State
  const [isHookPopoverOpen, setIsHookPopoverOpen] = useState(false);
  const [hookBefore, setHookBefore] = useState("");
  const [hookAfter, setHookAfter] = useState("");
  const [isGeneratingHook, setIsGeneratingHook] = useState(false);

  // Queue View State
  const [queueTab, setQueueTab] = useState<"scheduled" | "draft" | "published" | "pending_review">("scheduled");

  // Analytics State
  const [analyticsDays, setAnalyticsDays] = useState<7 | 30 | 90>(30);
  const [analyticsPlatform, setAnalyticsPlatform] = useState<string>("all");
  const [aiInsights, setAiInsights] = useState<{
    insights: Array<{ title: string; description: string; platform: string; impact: string }>;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Alert Notification states
  const [toasts, setToasts] = useState<Array<{ id: string; text: string; type: "success" | "error" | "info" }>>([]);

  // Deletion state
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Production Brief State
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [briefRoles, setBriefRoles] = useState<string[]>(["Video Talent"]);
  const [briefLanguage, setBriefLanguage] = useState("English");
  const [briefFormat, setBriefFormat] = useState("Reels/TikTok Video");
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<ProductionBrief | null>(null);
  const [briefActiveTab, setBriefActiveTab] = useState<string>("");

  // AI use flag for onboarding checklist
  const [hasUsedAi, setHasUsedAi] = useState<boolean>(false);

  // Load onboarding state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("plano_has_used_ai") === "true";
      if (stored) {
        setTimeout(() => {
          setHasUsedAi(true);
        }, 0);
      }
    }
  }, []);

  const markAiUsed = () => {
    setHasUsedAi(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("plano_has_used_ai", "true");
    }
  };

  // Workspace Switcher State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>("elabram");
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceColor, setNewWorkspaceColor] = useState("#6366f1");

  const WORKSPACE_COLORS = [
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#f43f5e", // Rose
  ];

  const [approvalFlowEnabled, setApprovalFlowEnabled] = useState<boolean>(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [requestComment, setRequestComment] = useState("");

  const handleRequestChanges = (postId: string, comment: string) => {
    if (!comment.trim()) return;
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          status: "draft" as const,
          approvalComment: comment.trim()
        };
      }
      return p;
    });
    setPosts(updated);
    saveStoredPosts(updated, currentWorkspaceId);
    setCommentingPostId(null);
    setRequestComment("");
    triggerNotification("Changes requested. Post returned to Drafts.", "info");
  };

  const handleSwitchWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    saveCurrentWorkspaceId(workspaceId);
    
    // Load approval preference
    const isFlowEnabled = typeof window !== "undefined" && localStorage.getItem(`plano_approval_flow_enabled_${workspaceId}`) === "true";
    setApprovalFlowEnabled(isFlowEnabled);

    // Reload posts and channels
    const loadedPosts = getStoredPosts(workspaceId);
    const loadedChannels = getStoredChannels(workspaceId);
    setPosts(loadedPosts);
    setChannels(loadedChannels);

    // Default select first connected channel in composer
    const connected = loadedChannels.filter((c) => c.connected).map((c) => c.id);
    if (connected.length > 0) {
      setSelectedPlatforms([connected[0]]);
    } else {
      setSelectedPlatforms([]);
    }

    // Reset composer form states
    setEditingPostId(null);
    setCaption("");
    setCaptions({});
    setMedia(null);
    setIsCustomized(false);
    
    // Reset any analytical state
    setAiInsights(null);

    const wsName = workspaces.find(w => w.id === workspaceId)?.name || workspaceId;
    triggerNotification(`Switched to workspace: ${wsName}`, "success");
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const id = "ws_" + generateId();
    const newWorkspace: Workspace = {
      id,
      name: newWorkspaceName.trim(),
      color: newWorkspaceColor,
    };

    const updatedWorkspaces = [...workspaces, newWorkspace];
    setWorkspaces(updatedWorkspaces);
    saveStoredWorkspaces(updatedWorkspaces);

    // Switch workspace
    setCurrentWorkspaceId(id);
    saveCurrentWorkspaceId(id);
    setApprovalFlowEnabled(false); // default false for new workspace
    if (typeof window !== "undefined") {
      localStorage.setItem(`plano_approval_flow_enabled_${id}`, "false");
    }
    
    // Reload posts and channels
    const loadedPosts = getStoredPosts(id);
    const loadedChannels = getStoredChannels(id);
    setPosts(loadedPosts);
    setChannels(loadedChannels);

    // Default select first connected channel in composer
    const connected = loadedChannels.filter((c) => c.connected).map((c) => c.id);
    if (connected.length > 0) {
      setSelectedPlatforms([connected[0]]);
    } else {
      setSelectedPlatforms([]);
    }

    // Reset form states
    setEditingPostId(null);
    setCaption("");
    setCaptions({});
    setMedia(null);
    setIsCustomized(false);
    setAiInsights(null);

    setIsNewWorkspaceModalOpen(false);
    setNewWorkspaceName("");
    const nextColorIdx = (updatedWorkspaces.length) % WORKSPACE_COLORS.length;
    setNewWorkspaceColor(WORKSPACE_COLORS[nextColorIdx]);

    triggerNotification(`Workspace "${newWorkspace.name}" created successfully!`, "success");
  };

  // Auto-clear notification helper
  const triggerNotification = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const initDefaultChat = () => {
    const defaults = [
      {
        role: "assistant" as const,
        content: `Hi! I'm Plano AI, your social media assistant. 🚀\n\nI can help you:\n• Generate high-engagement captions with specific tones\n• Brainstorm hashtag combinations for your niche\n• Advise on post timing and optimal character structures\n\nTry one of the quick suggestions below or write your own question!`,
      },
    ];
    setChatMessages(defaults);
    localStorage.setItem("plano_chat_history", JSON.stringify(defaults));
  };

  // Initialize and load data from LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);

      const storedWorkspaces = getStoredWorkspaces();
      setWorkspaces(storedWorkspaces);
      const activeWorkspaceId = getCurrentWorkspaceId();
      setCurrentWorkspaceId(activeWorkspaceId);

      const isFlowEnabled = localStorage.getItem(`plano_approval_flow_enabled_${activeWorkspaceId}`) === "true";
      setApprovalFlowEnabled(isFlowEnabled);

      setPosts(getStoredPosts(activeWorkspaceId));
      const storedChannels = getStoredChannels(activeWorkspaceId);
      setChannels(storedChannels);

      // Default select first connected channel in composer
      const connected = storedChannels.filter((c) => c.connected).map((c) => c.id);
      if (connected.length > 0) {
        setSelectedPlatforms([connected[0]]);
      }

      // Set composer date to today (or near seed time)
      const localISO = "2026-07-14T12:00";
      setScheduledAt(localISO);

      // Set initial chat greeting
      const storedChat = localStorage.getItem("plano_chat_history");
      if (storedChat) {
        try {
          setChatMessages(JSON.parse(storedChat));
        } catch (e) {
          initDefaultChat();
        }
      } else {
        initDefaultChat();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes helper
  const updatePostsInStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    saveStoredPosts(updatedPosts, currentWorkspaceId);
  };

  const updateChannelsInStorage = (updatedChannels: Channel[]) => {
    setChannels(updatedChannels);
    saveStoredChannels(updatedChannels, currentWorkspaceId);
  };

  // Channel toggle connection
  const handleToggleChannel = (id: string) => {
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

    // Clean up selected platforms in composer if a channel disconnected
    const currentlyConnected = updated.filter((c) => c.connected).map((c) => c.id);
    setSelectedPlatforms((prev) => prev.filter((p) => currentlyConnected.includes(p)));
  };

  // Composer character limit calculations
  const connectedPlatforms = channels.filter((c) => c.connected);
  const getStrictestLimit = () => {
    if (selectedPlatforms.length === 0) return 2200; // default to Instagram
    let minLimit = Infinity;
    selectedPlatforms.forEach((pId) => {
      const config = PLATFORMS_CONFIG[pId];
      if (config && config.limit < minLimit) {
        minLimit = config.limit;
      }
    });
    return minLimit;
  };

  const strictestLimit = getStrictestLimit();
  const isOverLimit = caption.length > strictestLimit;

  // Handles base64 image upload
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      triggerNotification("Only image files are supported.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMedia(e.target.result as string);
        triggerNotification("Image attached successfully!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setMediaDragging(true);
  };

  const onDragLeave = () => {
    setMediaDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setMediaDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Form Submissions
  const handleSavePost = (overrideStatus?: "published" | "scheduled" | "draft") => {
    if (selectedPlatforms.length === 0) {
      triggerNotification("Please select at least one connected platform.", "error");
      return;
    }

    if (isCustomized) {
      for (const plat of selectedPlatforms) {
        const platCaption = captions[plat] || "";
        if (!platCaption.trim()) {
          triggerNotification(`Caption for ${PLATFORMS_CONFIG[plat]?.name || plat} cannot be empty.`, "error");
          return;
        }
        if (platCaption.length > (PLATFORMS_CONFIG[plat]?.limit || 2200)) {
          triggerNotification(`Caption for ${PLATFORMS_CONFIG[plat]?.name || plat} exceeds character limit.`, "error");
          return;
        }
      }
    } else {
      if (!caption.trim()) {
        triggerNotification("Caption cannot be empty.", "error");
        return;
      }
      if (isOverLimit) {
        triggerNotification("Caption is too long for the selected platform's limit.", "error");
        return;
      }
    }

    let targetStatus: "scheduled" | "draft" | "published" | "pending_review" | "approved" = "scheduled";
    if (overrideStatus) {
      targetStatus = overrideStatus;
    } else {
      targetStatus = composerStatus;
    }

    let actualStatus: "scheduled" | "draft" | "published" | "pending_review" | "approved" = targetStatus;
    let submittedForReview = false;

    if (approvalFlowEnabled && targetStatus === "scheduled") {
      const existing = editingPostId ? posts.find((p) => p.id === editingPostId) : null;
      const isAlreadyApprovedOrScheduled = existing ? (existing.status === "approved" || existing.status === "scheduled") : false;
      if (!isAlreadyApprovedOrScheduled) {
        actualStatus = "pending_review";
        submittedForReview = true;
      }
    }

    const currentTimestamp = new Date().toISOString().slice(0, 16);

    if (editingPostId) {
      // Editing Mode
      const updated = posts.map((p) => {
        if (p.id === editingPostId) {
          return {
            ...p,
            platforms: selectedPlatforms,
            caption: isCustomized ? "" : caption,
            captions: isCustomized ? captions : undefined,
            isCustomized,
            media,
            scheduledAt: actualStatus === "published" ? currentTimestamp : scheduledAt,
            status: actualStatus,
            publishedAt: actualStatus === "published" ? currentTimestamp : null,
            repeat: repeat === "none" ? undefined : repeat,
            productionBrief: generatedBrief || undefined,
            // Clear approval comment if submitting for review
            approvalComment: actualStatus === "pending_review" ? undefined : p.approvalComment,
          };
        }
        return p;
      });
      updatePostsInStorage(updated);
      if (submittedForReview) {
        triggerNotification("Post submitted to Pending Review queue for approval.", "success");
      } else if (actualStatus === "scheduled") {
        triggerNotification("Post scheduled successfully!", "success");
      } else if (actualStatus === "draft") {
        triggerNotification("Draft saved successfully!", "success");
      } else {
        triggerNotification(`Post successfully updated and set to ${actualStatus}!`, "success");
      }
      resetComposerForm();
      setActiveView("queue");
    } else {
      // Create Mode
      const newPost: Post = {
        id: generateId(),
        platforms: selectedPlatforms,
        caption: isCustomized ? "" : caption,
        captions: isCustomized ? captions : undefined,
        isCustomized,
        media,
        scheduledAt: actualStatus === "published" ? currentTimestamp : scheduledAt,
        status: actualStatus,
        publishedAt: actualStatus === "published" ? currentTimestamp : null,
        repeat: repeat === "none" ? undefined : repeat,
        productionBrief: generatedBrief || undefined,
      };
      updatePostsInStorage([newPost, ...posts]);
      if (submittedForReview) {
        triggerNotification("Post submitted to Pending Review queue for approval.", "success");
      } else if (actualStatus === "scheduled") {
        triggerNotification("Post scheduled successfully!", "success");
      } else if (actualStatus === "draft") {
        triggerNotification("Draft saved successfully!", "success");
      } else {
        triggerNotification(`Post successfully created as ${actualStatus}!`, "success");
      }
      resetComposerForm();
      setActiveView("queue");
    }
  };

  const resetComposerForm = React.useCallback(() => {
    setEditingPostId(null);
    setCaption("");
    setCaptions({});
    setIsCustomized(false);
    setMedia(null);
    setGeneratedBrief(null);
    // set to today's date placeholder
    setScheduledAt("2026-07-14T12:00");
    setComposerStatus("scheduled");
    setRepeat("none");
    // Preserve currently selected platforms or reset
    const connected = channels.filter((c) => c.connected).map((c) => c.id);
    if (connected.length > 0 && selectedPlatforms.length === 0) {
      setSelectedPlatforms([connected[0]]);
    }
  }, [channels, selectedPlatforms, setGeneratedBrief, setSelectedPlatforms, setEditingPostId, setCaption, setCaptions, setIsCustomized, setMedia, setScheduledAt, setComposerStatus, setRepeat]);

  // Global Keyboard Shortcut: "N" to open composer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in a text field, textarea, or contenteditable element
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        resetComposerForm();
        setActiveView("create");
        triggerNotification("Keyboard shortcut: Composer opened.", "info");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetComposerForm]);

  // Actions from Calendar / Queue
  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setSelectedPlatforms(post.platforms);
    setCaption(post.caption || "");
    setCaptions(post.captions || {});
    setIsCustomized(post.isCustomized || false);
    setMedia(post.media);
    setScheduledAt(post.scheduledAt);
    setComposerStatus(post.status === "draft" ? "draft" : "scheduled");
    setRepeat(post.repeat || "none");
    setGeneratedBrief(post.productionBrief || null);
    setActiveView("create");
    triggerNotification("Loaded post into composer.", "info");
  };

  const handleDeletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    updatePostsInStorage(updated);
    triggerNotification("Post deleted.", "info");
  };

  const handleSkipOccurrence = (originalId: string, dateStr: string) => {
    const updated = posts.map(p => {
      if (p.id === originalId) {
        return {
          ...p,
          skippedOccurrences: [...(p.skippedOccurrences || []), dateStr]
        };
      }
      return p;
    });
    updatePostsInStorage(updated);
    triggerNotification("Occurrence skipped.", "info");
  };

  const handleCreateOnDate = (dateStr: string) => {
    resetComposerForm();
    setScheduledAt(`${dateStr}T12:00`);
    setActiveView("create");
    triggerNotification(`Creating a post for ${dateStr}`, "info");
  };

  // Reset Storage back to defaults
  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all posts, connected accounts, and chat logs back to the default state?")) {
      resetToDefaults();
      setPosts(getStoredPosts());
      setChannels(getStoredChannels());
      initDefaultChat();
      triggerNotification("Application data reset successfully.", "success");
    }
  };

  // Send message to Gemini API
  const handleSendChat = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || chatInput).trim();
    if (!promptToSend) return;

    const userMsg = { role: "user" as const, content: promptToSend };
    const updatedMessages = [...chatMessages, userMsg];

    setChatMessages(updatedMessages);
    setChatInput("");
    setIsGenerating(true);

    // Scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const data = await response.json();
      const aiResponseText = data.response;

      const aiMsg = { role: "assistant" as const, content: aiResponseText };
      const finalMessages = [...updatedMessages, aiMsg];
      setChatMessages(finalMessages);
      localStorage.setItem("plano_chat_history", JSON.stringify(finalMessages));
      markAiUsed();
    } catch (error: any) {
      console.error(error);
      const errorMsg = {
        role: "assistant" as const,
        content: "Sorry, I had trouble reaching Plano AI. Please ensure your Gemini API Key is configured in Settings > Secrets.",
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleAiWriteGenerate = async () => {
    if (!aiTopic.trim()) {
      triggerNotification("Please enter a topic first.", "error");
      return;
    }

    setIsAiGenerating(true);

    // determine platform target
    const targetPlatform = (isCustomized && computedActiveCaptionTab)
      ? computedActiveCaptionTab
      : (selectedPlatforms.length > 0 ? selectedPlatforms.map(p => PLATFORMS_CONFIG[p]?.name || p).join(', ') : "general social media");

    const limitInfo = (isCustomized && computedActiveCaptionTab)
      ? `Ensure it's well under ${PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200} characters.`
      : (selectedPlatforms.length > 0 ? `Ensure it satisfies the character limits: ${selectedPlatforms.map(p => `${PLATFORMS_CONFIG[p]?.name} (${PLATFORMS_CONFIG[p]?.limit})`).join(', ')}.` : "");

    const prompt = `Write a ${aiTone} social media caption in ${aiLanguage} about the following topic: "${aiTopic}".
Target platform(s): ${targetPlatform}. ${limitInfo}
Produce ONLY the caption text (no preamble, no quotes) and add 3-5 relevant hashtags at the end.`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate caption.");
      }

      const data = await response.json();
      const generatedText = data.response;

      if (isCustomized && computedActiveCaptionTab) {
        setCaptions(prev => ({ ...prev, [computedActiveCaptionTab]: generatedText }));
      } else {
        setCaption(generatedText);
      }

      triggerNotification("AI generated caption successfully.", "success");
      markAiUsed();
    } catch (err) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleGenerateHashtags = async () => {
    const currentCaption = isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] || "" : caption;
    if (!currentCaption.trim()) {
      triggerNotification("Please write a caption first to generate hashtags.", "error");
      return;
    }

    setIsGeneratingHashtags(true);
    setAiHashtags([]);

    const prompt = `Based on the following caption, generate exactly 10 relevant hashtags. 
Return ONLY a valid JSON array of strings containing the hashtags (including the # symbol). No extra text, no preamble, no markdown formatting.
Caption: "${currentCaption}"`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        }),
      });

      if (!response.ok) throw new Error("Failed to generate hashtags.");

      const data = await response.json();
      let text = data.response.trim();
      if (text.startsWith('```json')) text = text.slice(7, -3);
      else if (text.startsWith('```')) text = text.slice(3, -3);
      
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setAiHashtags(parsed);
        markAiUsed();
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const handleGenerateHook = async () => {
    const currentCaption = isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] || "" : caption;
    if (!currentCaption.trim()) {
      triggerNotification("Please write a caption first to improve the hook.", "error");
      return;
    }

    setIsGeneratingHook(true);
    // Find the first sentence (approximate)
    const firstSentenceMatch = currentCaption.match(/^[^.!?\n]+[.!?\n]+/);
    const beforeText = firstSentenceMatch ? firstSentenceMatch[0].trim() : currentCaption.trim();
    setHookBefore(beforeText);
    setHookAfter("");

    const prompt = `Rewrite ONLY the first sentence of this caption to be a much stronger, scroll-stopping hook. 
Return ONLY the rewritten first sentence. No preamble, no quotes, no extra text.
Original caption: "${currentCaption}"`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        }),
      });

      if (!response.ok) throw new Error("Failed to improve hook.");

      const data = await response.json();
      setHookAfter(data.response.trim());
      markAiUsed();
    } catch (err) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setIsGeneratingHook(false);
    }
  };

  const applyHook = () => {
    const currentCaption = isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] || "" : caption;
    const newCaption = currentCaption.replace(hookBefore, hookAfter);
    
    if (isCustomized && computedActiveCaptionTab) {
      setCaptions(prev => ({ ...prev, [computedActiveCaptionTab]: newCaption }));
    } else {
      setCaption(newCaption);
    }
    
    setIsHookPopoverOpen(false);
    triggerNotification("Hook applied!", "success");
  };

  const applyHashtag = (tag: string) => {
    const currentCaption = isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] || "" : caption;
    const newCaption = currentCaption + (currentCaption.endsWith(" ") || currentCaption.endsWith("\n") ? "" : " ") + tag;
    
    if (isCustomized && computedActiveCaptionTab) {
      setCaptions(prev => ({ ...prev, [computedActiveCaptionTab]: newCaption }));
    } else {
      setCaption(newCaption);
    }
  };

  const handleGeneratePlan = async () => {
    if (!planBusinessDesc.trim() || !planAudience.trim() || planPlatforms.length === 0) {
      triggerNotification("Please fill in business description, target audience, and select at least one platform.", "error");
      return;
    }

    setIsGeneratingPlan(true);
    setGeneratedPlan([]);

    const prompt = `You are an expert social media manager. Create a 30-day content plan for a business based on these details:
Business Description: ${planBusinessDesc}
Target Audience: ${planAudience}
Posting Frequency: ${planFrequency}
Language: ${planLanguage}
Target Platforms: ${planPlatforms.join(", ")}

Generate a strict JSON array of objects representing the content plan. 
EACH object in the array must have the following fields:
- "day": a number from 1 to 30.
- "date": string representing the day, e.g., "Day 1".
- "platform": the social media platform string.
- "contentPillar": one of "Value", "Engagement", "Credibility", "Promotion".
- "postIdea": a one-sentence summary of the post idea.
- "caption": the full, ready-to-post caption including hashtags.

Only generate posts for the specified frequency (e.g., if 3x/week, you should generate roughly 12-13 posts, not 30).
Return ONLY the JSON array. Do not include markdown formatting or code blocks.`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        }),
      });

      if (!response.ok) throw new Error("Failed to generate content plan.");

      const data = await response.json();
      let text = data.response.trim();
      if (text.startsWith('\`\`\`json')) text = text.slice(7, -3);
      else if (text.startsWith('\`\`\`')) text = text.slice(3, -3);
      
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setGeneratedPlan(parsed);
        triggerNotification("Content plan generated successfully.", "success");
        markAiUsed();
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateBrief = async (retry = false) => {
    const currentCaption = isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] || "" : caption;
    
    if (!currentCaption.trim() || briefRoles.length === 0) {
      triggerNotification("Please ensure you have a caption and selected at least one role.", "error");
      return;
    }

    setIsGeneratingBrief(true);
    markAiUsed();

    const roleRequirements = {
      "Video Talent": `hook line to say in the first 3 seconds, full talking points/script outline, tone & energy direction, wardrobe suggestion, do's & don'ts on camera.${briefFormat === "Reels/TikTok Video" ? " ALSO INCLUDE a 'Shot List' section with a numbered table of scenes." : ""}`,
      "Graphic Designer": "visual concept, composition/layout direction, exact dimensions per selected platform (e.g. 1080x1350 feed, 1080x1920 story), color & typography direction, text elements to include (headline, subheadline, CTA), reference style keywords.",
      "Video Editor": `recommended duration per platform, pacing & cut style, on-screen caption/subtitle direction, music/audio mood, b-roll suggestions, safe zones for platform UI, export specs (ratio, resolution, format).${briefFormat === "Reels/TikTok Video" ? " ALSO INCLUDE a 'Shot List' section with a numbered table of scenes." : ""}`
    };

    const rolesPrompt = briefRoles.map(role => `${role}: ${roleRequirements[role as keyof typeof roleRequirements]}`).join("\n");

    const prompt = `You are a professional Creative Director. Generate a detailed production brief for a social media post based on the following context:
Caption/Content: ${currentCaption}
Platforms: ${selectedPlatforms.join(", ")}
Format: ${briefFormat}
Language: ${briefLanguage}

The brief must be tailored for the following roles:
${rolesPrompt}

If a 'Shot List' is requested for a role, it MUST be a section with heading "Shot List" containing a table.
The table must have these exact columns: "Scene", "Duration (s)", "Visual", "Dialogue/Action", "Text Overlay".
The total duration of all scenes must match your recommended video length for the format.

Return the response as a strict JSON object (no markdown fences, no extra text) in this exact shape:
{
  "contentTitle": "string",
  "objective": "string",
  "keyMessage": "string",
  "briefs": [
    {
      "role": "Video Talent" | "Graphic Designer" | "Video Editor",
      "sections": [ 
        { 
          "heading": "string", 
          "items": ["string"],
          "table": { "columns": ["string"], "rows": [["string"]] } 
        } 
      ]
    }
  ]
}
${retry ? "IMPORTANT: Return ONLY valid JSON. No markdown code blocks." : ""}`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        }),
      });

      if (!response.ok) throw new Error("AI generation failed.");

      const data = await response.json();
      let text = data.response;

      // Clean markdown fences if present
      text = text.replace(/```json\n?|```/g, "").trim();

      try {
        const parsed: ProductionBrief = JSON.parse(text);
        setGeneratedBrief(parsed);
        if (parsed.briefs.length > 0) {
          setBriefActiveTab(parsed.briefs[0].role);
        }
      } catch (parseErr) {
        if (!retry) {
          console.warn("JSON parse failed, retrying once...");
          handleGenerateBrief(true);
          return;
        }
        throw parseErr;
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleExportBrief = () => {
    if (!generatedBrief) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      triggerNotification("Please allow popups to export the brief.", "error");
      return;
    }

    const platformListHtml = selectedPlatforms.map(p => `
      <span style="display: inline-flex; align-items: center; gap: 4px; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #555;">
        ${PLATFORMS_CONFIG[p]?.name}
      </span>
    `).join(" ");

    const briefsHtml = generatedBrief.briefs.map(b => `
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 8px; color: #000; text-transform: uppercase; font-size: 16px; margin-bottom: 20px;">Role: ${b.role}</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${b.sections.map(s => `
            <div style="${s.table ? "grid-column: span 2;" : ""}">
              <h3 style="font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 10px; border-left: 3px solid #6366f1; padding-left: 8px;">${s.heading}</h3>
              ${s.table ? `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
                  <thead>
                    <tr style="background: #f8fafc;">
                      ${s.table.columns.map(col => `<th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; color: #64748b;">${col}</th>`).join("")}
                    </tr>
                  </thead>
                  <tbody>
                    ${s.table.rows.map(row => `
                      <tr>
                        ${row.map(cell => `<td style="border: 1px solid #e2e8f0; padding: 8px; color: #334155; vertical-align: top;">${cell}</td>`).join("")}
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              ` : `
                <ul style="padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.6; margin: 0;">
                  ${s.items?.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
                </ul>
              `}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Production Brief - ${generatedBrief.contentTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 50px; max-width: 900px; margin: 0 auto; color: #1e293b; background: white; -webkit-print-color-adjust: exact; }
          .header { border-bottom: 3px solid #0f172a; padding-bottom: 25px; margin-bottom: 35px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header-left h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; color: #0f172a; }
          .header-left .meta { margin-top: 10px; font-size: 12px; color: #64748b; display: flex; gap: 20px; font-weight: 500; }
          .confidential { font-size: 10px; font-weight: 700; color: #cbd5e1; letter-spacing: 2px; }
          .platforms { margin-bottom: 30px; }
          .platform-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; display: block; }
          .objective-section { background: #f1f5f9; padding: 25px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          .objective-section h4 { margin: 0 0 8px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          .objective-section p { margin: 0; font-size: 13px; font-weight: 500; color: #1e293b; line-height: 1.5; }
          @media print {
            body { padding: 30px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>PRODUCTION BRIEF</h1>
            <div class="meta">
              <span><strong>DATE:</strong> ${new Date().toLocaleDateString()}</span>
              <span><strong>ID:</strong> ${Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
          </div>
          <div class="confidential">CONFIDENTIAL DOCUMENT</div>
        </div>

        <div style="margin-bottom: 30px;">
           <h2 style="font-size: 20px; margin: 0 0 15px 0; color: #0f172a;">${generatedBrief.contentTitle}</h2>
           <div class="platforms">
             <span class="platform-label">Target Distribution</span>
             ${platformListHtml}
           </div>
        </div>

        <div class="objective-section">
          <div>
            <h4>Project Objective</h4>
            <p>${generatedBrief.objective}</p>
          </div>
          <div>
            <h4>Primary Message</h4>
            <p>${generatedBrief.keyMessage}</p>
          </div>
        </div>

        ${briefsHtml}

        <footer style="margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Generated by Antigravity Media Planner</span>
          <span>&copy; ${new Date().getFullYear()} All Rights Reserved</span>
        </footer>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const fetchAIInsights = async () => {
    setLoadingInsights(true);
    setAiInsights(null);
    try {
      const kpis = getKPIs(analyticsDays, analyticsPlatform);
      const lineData = getLineChartData(analyticsDays, analyticsPlatform);
      const res = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analyticsSummary: {
            days: analyticsDays,
            platform: analyticsPlatform,
            kpis: kpis.map((k) => ({ label: k.label, value: k.value, diff: k.diff, isUp: k.isUp })),
            lineChartPeak: lineData.peakText,
          },
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to load insights.");
      }
      const data = await res.json();
      if (data && data.insights) {
        setAiInsights(data);
        triggerNotification("AI Insights generated successfully!", "success");
        markAiUsed();
      } else {
        throw new Error("Invalid format received.");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setLoadingInsights(false);
    }
  };

  const addPlanPostToCalendar = (post: any) => {
    // Determine the scheduled date (e.g., today + day offset)
    const today = new Date();
    today.setDate(today.getDate() + (post.day - 1));
    const targetDate = today.toISOString().split("T")[0];

    const matchedPlatforms = [post.platform.toLowerCase()].filter(p => Object.keys(PLATFORMS_CONFIG).includes(p));

    const newPost: Post = {
      id: generateId(),
      caption: post.caption,
      platforms: matchedPlatforms.length > 0 ? matchedPlatforms as any : planPlatforms,
      status: "draft",
      scheduledAt: targetDate,
      isCustomized: false,
      captions: {},
      media: null,
      publishedAt: null,
    };

    setPosts(prev => {
      const updated = [...prev, newPost];
      saveStoredPosts(updated, currentWorkspaceId);
      return updated;
    });
    triggerNotification(`Added post for Day ${post.day} to calendar.`, "success");
  };

  const addAllPlanPostsToCalendar = () => {
    const today = new Date();
    const newPosts: Post[] = generatedPlan.map(post => {
      const postDate = new Date(today);
      postDate.setDate(postDate.getDate() + (post.day - 1));
      
      const matchedPlatforms = [post.platform.toLowerCase()].filter(p => Object.keys(PLATFORMS_CONFIG).includes(p));

      return {
        id: generateId(),
        caption: post.caption,
        platforms: matchedPlatforms.length > 0 ? matchedPlatforms as any : planPlatforms,
        status: "draft",
        scheduledAt: postDate.toISOString().split("T")[0],
        isCustomized: false,
        captions: {},
        media: null,
        publishedAt: null,
      };
    });

    setPosts(prev => {
      const updated = [...prev, ...newPosts];
      saveStoredPosts(updated, currentWorkspaceId);
      return updated;
    });
    triggerNotification(`Added ${newPosts.length} posts to calendar.`, "success");
  };

  // Chat templates
  const CHAT_SUGGESTIONS = [
    {
      label: "Tech Startup Hook",
      prompt: "Give me 3 high-converting hooks for a Twitter/X thread launching a productivity SaaS.",
    },
    {
      label: "LinkedIn Post Blueprint",
      prompt: "Structure an editorial LinkedIn post discussing why 'building in public' builds massive trust.",
    },
    {
      label: "Instagram Caption Ideas",
      prompt: "Generate a witty, short Instagram caption with hashtags for a scenic office picture.",
    },
    {
      label: "Optimize Engagement",
      prompt: "What are the best peak posting times on Instagram, LinkedIn, and TikTok in 2026?",
    },
  ];

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfWeek(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => {
    const dayNum = daysInPrevMonth - firstDayIndex + 1 + i;
    return {
      day: dayNum,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      dateString: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
    };
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    return {
      day: dayNum,
      month: month,
      year: year,
      isCurrentMonth: true,
      dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
    };
  });

  const totalCells = 42;
  const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => {
    const dayNum = i + 1;
    return {
      day: dayNum,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      dateString: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
    };
  });

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 14));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 14));
  };

  // Platform styling mappings
  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case "instagram":
        return <Instagram className="w-3.5 h-3.5" />;
      case "x":
        return <Twitter className="w-3.5 h-3.5" />;
      case "linkedin":
        return <Linkedin className="w-3.5 h-3.5" />;
      case "facebook":
        return <Facebook className="w-3.5 h-3.5" />;
      case "tiktok":
        return <Video className="w-3.5 h-3.5" />;
      case "threads":
        return <Hash className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  const getPlatformColorClasses = (platformId: string) => {
    switch (platformId) {
      case "instagram":
        return "bg-rose-500/10 text-rose-300 border-rose-500/20";
      case "x":
        return "bg-slate-400/10 text-slate-300 border-slate-500/20";
      case "linkedin":
        return "bg-blue-600/10 text-blue-300 border-blue-500/20";
      case "facebook":
        return "bg-indigo-600/10 text-indigo-300 border-indigo-500/20";
      case "tiktok":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
      case "threads":
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
    }
  };

  const getPlatformBrandColor = (platformId: string) => {
    switch (platformId) {
      case "instagram":
        return "#E1306C";
      case "x":
        return "#F3F4F6";
      case "linkedin":
        return "#0A66C2";
      case "facebook":
        return "#1877F2";
      case "tiktok":
        return "#FE2C55";
      case "threads":
        return "#A855F7";
      default:
        return "#6366f1";
    }
  };

  // Month names helper
  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const renderFormattedText = (text: string, hashtagColorClass: string = "text-indigo-400") => {
    if (!text) return <span className="text-slate-600 italic">Caption content is empty...</span>;
    return text.split(/(\s+)/).map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        return (
          <span key={index} className={`${hashtagColorClass} hover:underline cursor-pointer font-medium`}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderPlatformMockup = (platId: string) => {
    const currentCaption = isCustomized ? (captions[platId] || "") : caption;

    switch (platId) {
      case "instagram": {
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col text-slate-200">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Instagram story style border */}
                <div className="p-[1.5px] bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 rounded-full shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-900 text-[10px] font-bold text-white">
                    EA
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">elabram</span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] text-white flex items-center justify-center">✓</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Singapore</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Media square */}
            <div className="w-full aspect-square bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800/40">
              {media ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media} alt="Instagram preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2.5 text-slate-600 p-4 text-center">
                  <Instagram className="w-10 h-10 text-slate-800" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">No Image Uploaded</span>
                  <span className="text-[9px] text-slate-600 max-w-[180px]">Upload or generate a photo to preview here</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <button className="text-slate-300 hover:text-rose-500 hover:scale-110 transition duration-150">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="text-slate-300 hover:text-indigo-400 hover:scale-110 transition duration-150">
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button className="text-slate-300 hover:text-indigo-400 hover:scale-110 transition duration-150">
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <button className="text-slate-300 hover:text-yellow-500 transition duration-150">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>

            {/* Likes */}
            <div className="px-3.5 py-1 text-xs font-bold text-slate-200">
              Liked by alex_doe and 1,428 others
            </div>

            {/* Caption & Comments */}
            <div className="px-3.5 pb-3 flex-1 flex flex-col justify-between">
              <div className="text-xs leading-relaxed text-slate-200">
                <span className="font-bold text-white mr-1.5">elabram</span>
                {renderFormattedText(currentCaption, "text-indigo-400")}
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-slate-900/60 pt-2.5">
                <span className="text-[10.5px] text-slate-400 font-semibold cursor-pointer hover:text-slate-300">View all 12 comments</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">2 hours ago</span>
              </div>
            </div>
          </div>
        );
      }

      case "x": {
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col text-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                  EA
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[14px] text-white truncate leading-tight">Plano</span>
                    <span className="w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center text-[7px] text-white font-bold shrink-0">✓</span>
                    <span className="text-xs text-slate-500 truncate leading-tight">@elabram</span>
                    <span className="text-xs text-slate-500 shrink-0 leading-tight">· 2h</span>
                  </div>
                  {/* Content Tweet */}
                  <div className="text-[14px] text-slate-100 leading-normal whitespace-pre-wrap mt-1">
                    {renderFormattedText(currentCaption, "text-[#1d9bf0]")}
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white transition shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Media Image */}
            {media && (
              <div className="ml-13 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 mt-2.5 max-h-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media} alt="X preview" className="w-full h-full object-cover max-h-[280px]" />
              </div>
            )}

            {/* Action Bar (Standard Twitter Stats row) */}
            <div className="ml-13 mt-3.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-slate-500 text-xs max-w-md">
              <button className="flex items-center gap-1.5 hover:text-sky-400 group transition">
                <span className="p-1.5 group-hover:bg-sky-500/10 rounded-full transition">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <span>24</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-emerald-400 group transition">
                <span className="p-1.5 group-hover:bg-emerald-500/10 rounded-full transition">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <span>86</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-rose-500 group transition">
                <span className="p-1.5 group-hover:bg-rose-500/10 rounded-full transition">
                  <Heart className="w-4 h-4" />
                </span>
                <span>512</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-sky-400 group transition">
                <span className="p-1.5 group-hover:bg-sky-500/10 rounded-full transition">
                  <Eye className="w-4 h-4" />
                </span>
                <span>12k</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-sky-400 group transition">
                <span className="p-1.5 group-hover:bg-sky-500/10 rounded-full transition">
                  <Send className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>
        );
      }

      case "linkedin": {
        // LinkedIn truncates caption after 3 lines (approx 150 characters)
        const shouldTruncate = currentCaption.length > 150;
        const truncatedText = shouldTruncate && isLinkedInCollapsed ? currentCaption.slice(0, 150) : currentCaption;

        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl flex flex-col text-slate-200">
            {/* Header */}
            <div className="p-4 flex items-start justify-between gap-3">
              <div className="flex gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                  EA
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[14px] text-white truncate hover:underline cursor-pointer">Plano</span>
                    <span className="text-[11px] text-slate-400 font-normal">· @elabram</span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[220px]">Social Media Manager at Plano Inc.</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span>1h</span>
                    <span>•</span>
                    <Globe className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white transition">
                <MoreHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Caption area */}
            <div className="px-4 pb-2.5 text-xs leading-relaxed text-slate-200">
              {renderFormattedText(truncatedText, "text-[#0a66c2]")}
              {shouldTruncate && isLinkedInCollapsed && (
                <button
                  onClick={() => setIsLinkedInCollapsed(false)}
                  className="text-[#0a66c2] font-semibold hover:underline cursor-pointer ml-1.5 inline-block focus:outline-none animate-pulse"
                >
                  ...see more
                </button>
              )}
              {shouldTruncate && !isLinkedInCollapsed && (
                <button
                  onClick={() => setIsLinkedInCollapsed(true)}
                  className="text-[#0a66c2] font-semibold hover:underline cursor-pointer ml-1.5 inline-block focus:outline-none"
                >
                  (show less)
                </button>
              )}
            </div>

            {/* Media Image */}
            {media ? (
              <div className="w-full border-t border-b border-slate-800/80 bg-slate-950 max-h-[300px] overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media} alt="LinkedIn preview" className="w-full object-cover max-h-[300px]" />
              </div>
            ) : null}

            {/* Reactions bar */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/40 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white font-bold border border-slate-900">👍</div>
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[7px] text-white font-bold border border-slate-900">❤️</div>
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[7px] text-white font-bold border border-slate-900">👏</div>
                </div>
                <span>elabram and 48 others</span>
              </div>
              <span className="hover:underline cursor-pointer">5 comments • 1 repost</span>
            </div>

            {/* Action Row Buttons */}
            <div className="px-2 py-1 flex items-center justify-between">
              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
                <ThumbsUp className="w-4 h-4 text-slate-400" />
                <span>Like</span>
              </button>
              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Comment</span>
              </button>
              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>Repost</span>
              </button>
              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
                <Send className="w-4 h-4 text-slate-400" />
                <span>Send</span>
              </button>
            </div>
          </div>
        );
      }

      case "facebook": {
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl flex flex-col text-slate-200">
            {/* Header */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                  EA
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-white leading-tight hover:underline cursor-pointer">Plano App</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span>Sponsored</span>
                    <span>·</span>
                    <Globe className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <button className="hover:text-white transition"><MoreHorizontal className="w-4.5 h-4.5" /></button>
                <button className="hover:text-white transition"><X className="w-4.5 h-4.5" /></button>
              </div>
            </div>

            {/* Caption */}
            <div className="px-4 pb-3 text-xs leading-relaxed text-slate-200">
              {renderFormattedText(currentCaption, "text-indigo-400")}
            </div>

            {/* Media Image */}
            {media ? (
              <div className="w-full border-t border-b border-slate-800/80 bg-slate-950 max-h-[300px] overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media} alt="Facebook preview" className="w-full object-cover max-h-[300px]" />
              </div>
            ) : null}

            {/* Likes and Comment count */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/40 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  <div className="w-4.5 h-4.5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold border border-slate-900 shadow font-normal">👍</div>
                  <div className="w-4.5 h-4.5 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold border border-slate-900 shadow font-normal">❤️</div>
                </div>
                <span>128</span>
              </div>
              <span className="hover:underline cursor-pointer">14 comments • 3 shares</span>
            </div>

            {/* Actions Bar */}
            <div className="px-2 py-1 flex items-center justify-between">
              <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
                <ThumbsUp className="w-4 h-4 text-slate-400" />
                <span>Like</span>
              </button>
              <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Comment</span>
              </button>
              <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Share</span>
              </button>
            </div>
          </div>
        );
      }

      default: {
        const config = PLATFORMS_CONFIG[platId] || { name: platId, handle: `@${platId}_user` };
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-200">
            {/* Header */}
            <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                  EA
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{config.name} Preview</span>
                  <span className="text-[10px] text-slate-500">@elabram</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">mock feed</span>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3">
              <div className="text-xs leading-relaxed text-slate-100">
                {renderFormattedText(currentCaption, "text-indigo-400")}
              </div>

              {media && (
                <div className="rounded-lg overflow-hidden border border-slate-800/60 bg-slate-950 max-h-[220px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media} alt="Feed preview" className="w-full object-cover max-h-[220px]" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-950/20 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium">Scheduled for: {new Date(scheduledAt).toLocaleString()}</span>
              <span className="text-[10px] font-mono">{currentCaption.length} chars</span>
            </div>
          </div>
        );
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium tracking-wide">Initializing Plano SaaS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-200">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-20 lg:w-60 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-row md:flex-col justify-between p-4 md:py-6 md:px-3 lg:px-4 shrink-0 shadow-xl transition-all duration-300">
        <div className="flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start w-full gap-2 md:gap-8">
          {/* Logo Brand Header */}
          <div className="flex items-center md:justify-center lg:justify-start gap-3 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col md:hidden lg:flex">
              <span className="font-bold text-xl text-white leading-none tracking-tight">Plano</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-1">Scheduler</span>
            </div>
          </div>

          {/* Workspace Switcher */}
          {(() => {
            const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];
            return (
              <div className="relative w-auto md:w-full md:px-0 lg:px-2" id="workspace-switcher-container">
                <button
                  id="workspace-switcher-button"
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className="flex items-center justify-between md:justify-center lg:justify-between w-auto md:w-full gap-2.5 px-3 py-2 bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl transition-all duration-200 text-left cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold text-white uppercase shrink-0 select-none shadow-md"
                      style={{ backgroundColor: currentWorkspace?.color || "#6366f1" }}
                    >
                      {currentWorkspace?.name?.charAt(0) || "W"}
                    </div>
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors truncate md:hidden lg:inline">
                      {currentWorkspace?.name || "Workspace"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0 md:hidden lg:block" />
                </button>

                {/* Dropdown Popover */}
                {isWorkspaceDropdownOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsWorkspaceDropdownOpen(false)}
                    />
                    <div className="absolute left-0 md:left-2 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-2.5 py-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          Workspaces
                        </span>
                      </div>
                      
                      {workspaces.map((ws) => {
                        const isSelected = ws.id === currentWorkspaceId;
                        return (
                          <button
                            key={ws.id}
                            id={`workspace-item-${ws.id}`}
                            onClick={() => {
                              handleSwitchWorkspace(ws.id);
                              setIsWorkspaceDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between w-full gap-2 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/10"
                                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold text-white uppercase shrink-0"
                                style={{ backgroundColor: ws.color }}
                              >
                                {ws.name.charAt(0)}
                              </div>
                              <span className="text-xs font-medium truncate">{ws.name}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}

                      <div className="border-t border-slate-800/80 my-1.5" />

                      <button
                        id="btn-new-workspace"
                        onClick={() => {
                          setIsWorkspaceDropdownOpen(false);
                          setIsNewWorkspaceModalOpen(true);
                        }}
                        className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-indigo-400 transition cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
                          <Plus className="w-3 h-3" />
                        </div>
                        <span>New workspace</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Navigation Links */}
          <nav className="hidden md:flex flex-col gap-1.5 w-full">
            {[
              { id: "calendar", label: "Calendar", icon: CalendarIcon },
              { id: "create", label: "Create Post", icon: PlusSquare },
              { id: "queue", label: "Queue", icon: Clock },
              { id: "channels", label: "Channels", icon: Layers },
              { id: "assistant", label: "AI Assistant", icon: Bot },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    if (item.id === "create" && !editingPostId) {
                      resetComposerForm();
                    }
                    setActiveView(item.id as any);
                  }}
                  className={`flex items-center md:justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent"
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  <span className="md:hidden lg:inline truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Quick Info */}
        <div className="hidden md:flex flex-col gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center md:justify-center lg:justify-start gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-indigo-400 border border-slate-700 shrink-0">
              AR
            </div>
            <div className="flex flex-col min-w-0 md:hidden lg:flex">
              <span className="text-xs font-semibold text-slate-200 truncate">aulia.r@elabram.com</span>
              <span className="text-[10px] text-slate-500">Free Tier</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md py-2.5 px-4 flex items-center justify-around md:hidden shadow-2xl pb-safe">
        {[
          { id: "calendar", label: "Calendar", icon: CalendarIcon },
          { id: "create", label: "Create", icon: PlusSquare },
          { id: "queue", label: "Queue", icon: Clock },
          { id: "channels", label: "Channels", icon: Layers },
          { id: "assistant", label: "AI Assistant", icon: Bot },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "settings", label: "Settings", icon: SettingsIcon },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "create" && !editingPostId) {
                  resetComposerForm();
                }
                setActiveView(item.id as any);
              }}
              className={`flex flex-col items-center gap-1 p-1 rounded-lg transition-all ${
                isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-medium tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-0 relative">
        {/* Global Notifications Toast Stack */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className="pointer-events-auto"
              >
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2.5 shadow-2xl backdrop-blur-md ${
                    toast.type === "success"
                      ? "bg-emerald-950/95 text-emerald-200 border-emerald-500/20"
                      : toast.type === "error"
                      ? "bg-rose-950/95 text-rose-200 border-rose-500/20"
                      : "bg-slate-900/95 text-slate-200 border-slate-800"
                  }`}
                >
                  {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  {toast.type === "info" && <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />}
                  <p className="text-xs font-semibold leading-normal">{toast.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingPostId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
                onClick={() => setDeletingPostId(null)}
              />

              {/* Dialog Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl overflow-hidden"
              >
                {/* Visual warning accent */}
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  Delete this post?
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  This action cannot be undone. This post will be permanently deleted from your editorial calendar and content queues.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDeletingPostId(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (deletingPostId) {
                        handleDeletePost(deletingPostId);
                        setDeletingPostId(null);
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create Workspace Modal */}
        <AnimatePresence>
          {isNewWorkspaceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={() => setIsNewWorkspaceModalOpen(false)}
              />

              {/* Dialog Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-400" /> Create New Workspace
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsNewWorkspaceModalOpen(false)}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="e.g. My Workspace, Client B"
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition outline-none"
                    />
                  </div>

                  {/* Colors Grid */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Brand Color Accent
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {WORKSPACE_COLORS.map((color) => {
                        const isSelected = newWorkspaceColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewWorkspaceColor(color)}
                            className={`w-7 h-7 rounded-lg transition-all duration-200 border-2 cursor-pointer relative ${
                              isSelected
                                ? "border-white scale-110 shadow-lg shadow-indigo-500/10"
                                : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto stroke-[3]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 border-t border-slate-800/60 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewWorkspaceModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 cursor-pointer"
                    >
                      Create Workspace
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUB-VIEW CAROUSEL WITH ANIMATION */}
        <div className="p-4 md:p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              {/* ======================================= */}
              {/* 1. CALENDAR VIEW */}
              {/* ======================================= */}
              {activeView === "calendar" && (
                <div className="flex-1 flex flex-col gap-6">
                  {/* Calendar view header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" /> Editorial Calendar
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">
                        View monthly queue structure. Click empty cells to schedule or select cards to edit.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
                        <button
                          onClick={handlePrevMonth}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold text-slate-200 px-3 w-32 text-center">
                          {MONTH_NAMES[month]} {year}
                        </span>
                        <button
                          onClick={handleNextMonth}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const today = new Date();
                          setCalendarDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
                          triggerNotification("Navigated to today.", "info");
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-semibold transition"
                      >
                        Today
                      </button>

                      <button
                        onClick={() => {
                          resetComposerForm();
                          setActiveView("create");
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
                      >
                        <PlusSquare className="w-3.5 h-3.5" /> Compose
                      </button>
                    </div>
                  </div>

                  {/* Onboarding Checklist Card */}
                  {(!channels.some(c => c.connected) || posts.length === 0 || !hasUsedAi) && (
                    <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-950 border border-indigo-500/15 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Welcome to Plano Workspace
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Complete these quick setup tasks to launch your social media content powerhouse:
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-500 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/60 font-mono self-start md:self-auto">
                          Onboarding Progress: {
                            [channels.some(c => c.connected), posts.length > 0, hasUsedAi].filter(Boolean).length
                          }/3 completed
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
                        {/* Step 1: Connect a channel */}
                        {(() => {
                          const isDone = channels.some((c) => c.connected);
                          return (
                            <div
                              onClick={() => setActiveView("channels")}
                              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                                isDone
                                  ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300"
                                  : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 text-slate-300"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                  : "bg-slate-900 border-slate-700 text-slate-500"
                              }`}>
                                {isDone ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <span className="text-[10px] font-bold">1</span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold ${isDone ? "line-through text-emerald-400/80" : ""}`}>
                                  Connect a channel
                                </span>
                                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                  Integrate IG, Twitter, or LinkedIn
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Step 2: Create your first post */}
                        {(() => {
                          const isDone = posts.length > 0;
                          return (
                            <div
                              onClick={() => {
                                resetComposerForm();
                                setActiveView("create");
                              }}
                              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                                isDone
                                  ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300"
                                  : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 text-slate-300"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                  : "bg-slate-900 border-slate-700 text-slate-500"
                              }`}>
                                {isDone ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <span className="text-[10px] font-bold">2</span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold ${isDone ? "line-through text-emerald-400/80" : ""}`}>
                                  Create your first post
                                </span>
                                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                  Draft, schedule, or publish
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Step 3: Try the AI assistant */}
                        {(() => {
                          const isDone = hasUsedAi;
                          return (
                            <div
                              onClick={() => setActiveView("assistant")}
                              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                                isDone
                                  ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300"
                                  : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 text-slate-300"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                  : "bg-slate-900 border-slate-700 text-slate-500"
                              }`}>
                                {isDone ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <span className="text-[10px] font-bold">3</span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold ${isDone ? "line-through text-emerald-400/80" : ""}`}>
                                  Try the AI assistant
                                </span>
                                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                  Generate hooks, captions, or plans
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {posts.length === 0 ? (
                    <div className="flex-1 min-h-[400px] bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                        <CalendarIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-200">Your Editorial Calendar is Empty</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                        There are no scheduled or drafted posts in this workspace. Create your first post to start mapping out your content schedule.
                      </p>
                      <button
                        onClick={() => {
                          resetComposerForm();
                          setActiveView("create");
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition mt-6 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                      >
                        <PlusSquare className="w-4 h-4" /> Create Your First Post
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex-1 flex flex-col">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/30 py-2.5">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                        <div key={dayName} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                          {dayName}
                        </div>
                      ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-slate-800/50">
                      {allCalendarDays.map((cell, idx) => {
                        const isToday =
                          cell.year === 2026 && cell.month === 6 && cell.day === 14; // hardcode for today July 14, 2026
                        
                        // Find matching posts
                        const cellPosts = expandedPosts.filter((post) => {
                          const pDate = new Date(post.scheduledAt);
                          return (
                            pDate.getFullYear() === cell.year &&
                            pDate.getMonth() === cell.month &&
                            pDate.getDate() === cell.day
                          );
                        });

                        return (
                          <div
                            key={`${cell.dateString}-${idx}`}
                            className={`min-h-[100px] p-2 flex flex-col justify-between group transition duration-150 hover:bg-slate-800/10 ${
                              cell.isCurrentMonth ? "bg-transparent" : "bg-slate-950/20 text-slate-600"
                            } ${isToday ? "bg-indigo-600/20 ring-1 ring-inset ring-indigo-500/50" : ""}`}
                          >
                            {/* Day Header */}
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-[11px] font-semibold flex items-center justify-center w-5 h-5 rounded-full ${
                                  isToday
                                    ? "bg-indigo-600 text-white font-bold"
                                    : cell.isCurrentMonth
                                    ? "text-slate-400"
                                    : "text-slate-600"
                                }`}
                              >
                                {cell.day}
                              </span>

                              {/* Plus button visible on cell hover */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateOnDate(cell.dateString);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-indigo-500/20 rounded text-indigo-400 transition"
                                title="Schedule post on this day"
                              >
                                <PlusSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Cell Posts list */}
                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                              {cellPosts.map((post) => {
                                const isGhost = (post as any).isGhost;
                                return (
                                  <div key={post.id} className="relative group/post">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPost(isGhost ? posts.find(p => p.id === (post as any).originalId)! : post);
                                      }}
                                      className={`w-full text-left text-[10px] p-1.5 rounded border flex flex-col gap-0.5 transition hover:scale-[1.02] cursor-pointer ${getPlatformColorClasses(
                                        post.platforms[0] || "instagram"
                                      )} ${
                                        post.status === "draft"
                                          ? "border-dashed border-slate-700/60 opacity-80"
                                          : post.status === "pending_review"
                                          ? "border-dotted border-amber-500/60 bg-amber-950/20 text-amber-200"
                                          : post.status === "approved"
                                          ? "border-emerald-500/40 bg-emerald-950/10 text-emerald-200"
                                          : post.status === "published"
                                          ? "border-opacity-50 brightness-75"
                                          : ""
                                      } ${isGhost ? "opacity-60 bg-slate-900/40" : ""}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 shrink-0 font-medium truncate max-w-[70%]">
                                          {post.platforms.map((plat) => (
                                            <span key={plat}>{getPlatformIcon(plat)}</span>
                                          ))}
                                          {isGhost && <RefreshCw className="w-2.5 h-2.5 ml-0.5 text-slate-400" />}
                                        </div>
                                        <span className="text-[9px] opacity-75 shrink-0">
                                          {new Date(post.scheduledAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                          })}
                                        </span>
                                      </div>
                                      <span className="truncate text-[9px] opacity-90 leading-tight">
                                        {post.isCustomized ? (post.captions?.[post.platforms[0]] || "Customized captions") : post.caption}
                                      </span>
                                    </button>
                                    
                                    {isGhost && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSkipOccurrence((post as any).originalId, (post as any).ghostDate);
                                        }}
                                        className="absolute -top-1.5 -right-1.5 p-1 bg-slate-800 border border-slate-700 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 rounded-full opacity-0 group-hover/post:opacity-100 transition shadow-lg"
                                        title="Skip occurrence"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* ======================================= */}
              {/* 2. CREATE POST VIEW (Composer) */}
              {/* ======================================= */}
              {activeView === "create" && (
                <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <PlusSquare className="w-5 h-5 text-indigo-500" />
                      {editingPostId ? "Edit Post Composer" : "Create New Post"}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Compose content, preview structures, configure scheduling time, and route to social platforms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Form Panel */}
                    <div className="lg:col-span-7 flex flex-col gap-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
                      {/* Show Approval Comment if it exists */}
                      {editingPostId && posts.find(p => p.id === editingPostId)?.approvalComment && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex flex-col gap-1">
                          <span className="font-bold text-rose-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Revision Requested by Reviewer
                          </span>
                          <span className="text-slate-200">{posts.find(p => p.id === editingPostId)?.approvalComment}</span>
                        </div>
                      )}

                      {/* Platform Selectors */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-400">Select Channels</span>
                        <div className="flex flex-wrap gap-2">
                          {channels.map((chan) => {
                            const config = PLATFORMS_CONFIG[chan.id];
                            const isSelected = selectedPlatforms.includes(chan.id);
                            return (
                              <button
                                key={chan.id}
                                disabled={!chan.connected}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedPlatforms((prev) => prev.filter((p) => p !== chan.id));
                                  } else {
                                    setSelectedPlatforms((prev) => [...prev, chan.id]);
                                  }
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                  isSelected
                                    ? "bg-slate-100 text-slate-900 border-white shadow-md shadow-white/5"
                                    : chan.connected
                                    ? "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                                    : "bg-slate-950/30 text-slate-600 border-slate-900/50 cursor-not-allowed"
                                }`}
                              >
                                <span style={{ color: isSelected ? "inherit" : getPlatformBrandColor(chan.id) }}>
                                  {getPlatformIcon(chan.id)}
                                </span>
                                <span>{chan.name}</span>
                                {!chan.connected && <span className="text-[9px] opacity-60 font-normal">(offline)</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content Caption Editor */}
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-semibold text-slate-400">Caption / Copy</label>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
                              <span>Customize per platform</span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isCustomized}
                                onClick={() => {
                                  if (!isCustomized) {
                                    const newCaptions = { ...captions };
                                    selectedPlatforms.forEach(p => {
                                      if (!newCaptions[p]) newCaptions[p] = caption;
                                    });
                                    setCaptions(newCaptions);
                                    if (selectedPlatforms.length > 0 && !activeCaptionTab) {
                                      setActiveCaptionTab(selectedPlatforms[0]);
                                    }
                                  }
                                  setIsCustomized(!isCustomized);
                                }}
                                className={`w-7 h-4 rounded-full relative transition-colors ${
                                  isCustomized ? "bg-indigo-500" : "bg-slate-700"
                                }`}
                              >
                                <span className={`block w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                                  isCustomized ? "translate-x-3.5" : "translate-x-0.5"
                                }`} />
                              </button>
                            </label>
                            
                            {!isCustomized && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  isOverLimit
                                    ? "bg-rose-500/10 text-rose-400 font-bold"
                                    : "bg-slate-950 text-slate-400"
                                }`}
                              >
                                {caption.length} / {strictestLimit} limit
                              </span>
                            )}
                            {isCustomized && computedActiveCaptionTab && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  (captions[computedActiveCaptionTab] || "").length > (PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200)
                                    ? "bg-rose-500/10 text-rose-400 font-bold"
                                    : "bg-slate-950 text-slate-400"
                                }`}
                              >
                                {(captions[computedActiveCaptionTab] || "").length} / {PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200} limit
                              </span>
                            )}
                          </div>
                        </div>

                        {isCustomized && selectedPlatforms.length > 0 && (
                          <div className="flex items-center gap-1 mb-0 mt-1 overflow-x-auto scrollbar-none">
                            {selectedPlatforms.map(p => {
                              const isActive = computedActiveCaptionTab === p;
                              const currentLimit = PLATFORMS_CONFIG[p]?.limit || 2200;
                              const currentLength = (captions[p] || "").length;
                              const isOver = currentLength > currentLimit;
                              return (
                                <button
                                  key={p}
                                  onClick={() => setActiveCaptionTab(p)}
                                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[11px] font-bold transition-all border-b-2 shrink-0 ${
                                    isActive
                                      ? "bg-slate-800/80 text-white border-indigo-500"
                                      : "bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 border-transparent"
                                  } ${isOver ? "text-rose-400" : ""}`}
                                >
                                  <span className={isActive ? "text-indigo-400" : "text-slate-500"}>{getPlatformIcon(p)}</span>
                                  <span>{PLATFORMS_CONFIG[p]?.name || p}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        <textarea
                          placeholder={isCustomized ? `Draft your custom caption for ${PLATFORMS_CONFIG[computedActiveCaptionTab || ""]?.name || "platform"}...` : "What would you like to share? Write your caption or draft ideas here..."}
                          value={isCustomized ? (computedActiveCaptionTab ? (captions[computedActiveCaptionTab] || "") : "") : caption}
                          onChange={(e) => {
                            if (isCustomized && computedActiveCaptionTab) {
                              setCaptions(prev => ({ ...prev, [computedActiveCaptionTab]: e.target.value }));
                            } else {
                              setCaption(e.target.value);
                            }
                          }}
                          rows={6}
                          className={`w-full p-3.5 bg-slate-950 rounded-lg text-sm text-slate-200 border transition placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            (isCustomized && computedActiveCaptionTab && (captions[computedActiveCaptionTab] || "").length > (PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200)) || (!isCustomized && isOverLimit)
                             ? "border-rose-500" : "border-slate-800 focus:border-slate-700"
                          } ${isCustomized && selectedPlatforms.length > 0 ? "rounded-tl-none" : ""}`}
                        />
                        <div className="flex justify-between items-center mt-1 relative">
                          <div className="flex items-center gap-4">
                            {/* AI Copywriting Button */}
                            <button
                              onClick={() => {
                                resetComposerForm();
                                const text = isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] : caption;
                                setChatInput(`Draft a highly engaging post about: "${text || "[topic]"}"`);
                                setActiveView("assistant");
                                triggerNotification("Drafted prompt for AI Assistant.", "info");
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Enhance with Plano AI
                            </button>

                            {/* New AI Write Button */}
                            <button
                              onClick={() => {
                                setIsAiPopoverOpen(!isAiPopoverOpen);
                                setIsHashtagsPopoverOpen(false);
                                setIsHookPopoverOpen(false);
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                            >
                              <Bot className="w-3.5 h-3.5" /> AI Write
                            </button>

                            {/* AI Hashtags Button */}
                            <button
                              onClick={() => {
                                setIsHashtagsPopoverOpen(!isHashtagsPopoverOpen);
                                setIsHookPopoverOpen(false);
                                setIsAiPopoverOpen(false);
                                if (!isHashtagsPopoverOpen && aiHashtags.length === 0) {
                                  handleGenerateHashtags();
                                }
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
                            >
                              <Hash className="w-3.5 h-3.5" /> Hashtags
                            </button>

                            {/* AI Hook Button */}
                            <button
                              onClick={() => {
                                setIsHookPopoverOpen(!isHookPopoverOpen);
                                setIsHashtagsPopoverOpen(false);
                                setIsAiPopoverOpen(false);
                                if (!isHookPopoverOpen) {
                                  handleGenerateHook();
                                }
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Improve Hook
                            </button>

                            {/* Production Brief Button */}
                            <button
                              onClick={() => setIsBriefModalOpen(true)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white transition"
                            >
                              <Clipboard className="w-3.5 h-3.5" /> Production Brief
                            </button>

                            {/* AI Write Popover */}
                            <AnimatePresence>
                              {isAiPopoverOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute top-full mt-2 left-0 w-80 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl p-4 z-50 flex flex-col gap-3"
                                >
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5"><Bot className="w-4 h-4 text-emerald-400" /> AI Write</h4>
                                    <button onClick={() => setIsAiPopoverOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-slate-400">Topic or context</label>
                                    <input 
                                      type="text" 
                                      value={aiTopic}
                                      onChange={(e) => setAiTopic(e.target.value)}
                                      placeholder="e.g. New product launch next week" 
                                      className="bg-slate-900 border border-slate-700 text-sm rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <div className="flex-1 flex flex-col gap-1.5">
                                      <label className="text-xs text-slate-400">Tone</label>
                                      <select 
                                        value={aiTone}
                                        onChange={(e) => setAiTone(e.target.value)}
                                        className="bg-slate-900 border border-slate-700 text-sm rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                                      >
                                        <option>Professional</option>
                                        <option>Casual</option>
                                        <option>Bold</option>
                                        <option>Storytelling</option>
                                      </select>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1.5">
                                      <label className="text-xs text-slate-400">Language</label>
                                      <select 
                                        value={aiLanguage}
                                        onChange={(e) => setAiLanguage(e.target.value)}
                                        className="bg-slate-900 border border-slate-700 text-sm rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                                      >
                                        <option>English</option>
                                        <option>Bahasa Indonesia</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="pt-2">
                                    <button
                                      onClick={handleAiWriteGenerate}
                                      disabled={isAiGenerating || !aiTopic.trim()}
                                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                      {isAiGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                      {isAiGenerating ? "Generating..." : (caption.trim() || (isCustomized && computedActiveCaptionTab && captions[computedActiveCaptionTab]?.trim()) ? "Regenerate" : "Generate")}
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Hashtags Popover */}
                            <AnimatePresence>
                              {isHashtagsPopoverOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute top-full mt-2 left-0 w-72 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl p-4 z-50 flex flex-col gap-3"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5"><Hash className="w-4 h-4 text-blue-400" /> AI Hashtags</h4>
                                    <button onClick={() => setIsHashtagsPopoverOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                                  </div>
                                  
                                  {isGeneratingHashtags ? (
                                    <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                                      <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                                      <p className="text-xs">Generating relevant hashtags...</p>
                                    </div>
                                  ) : aiHashtags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {aiHashtags.map(tag => (
                                        <button
                                          key={tag}
                                          onClick={() => applyHashtag(tag)}
                                          className="text-xs px-2 py-1 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:text-blue-400 rounded-md transition"
                                        >
                                          {tag}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400">No hashtags generated yet.</p>
                                  )}

                                  <div className="pt-2 border-t border-slate-700 mt-1">
                                    <button
                                      onClick={handleGenerateHashtags}
                                      disabled={isGeneratingHashtags}
                                      className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium py-1.5 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingHashtags ? 'animate-spin' : ''}`} />
                                      Regenerate
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Hook Popover */}
                            <AnimatePresence>
                              {isHookPopoverOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute top-full mt-2 left-0 w-80 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl p-4 z-50 flex flex-col gap-3"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> Improve Hook</h4>
                                    <button onClick={() => setIsHookPopoverOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                                  </div>
                                  
                                  {isGeneratingHook ? (
                                    <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                                      <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                                      <p className="text-xs">Rewriting first sentence...</p>
                                    </div>
                                  ) : hookAfter ? (
                                    <div className="flex flex-col gap-3">
                                      <div className="flex flex-col gap-1 text-xs">
                                        <span className="text-slate-500 font-semibold uppercase text-[10px]">Before</span>
                                        <div className="p-2 bg-slate-900 border border-rose-900/30 rounded text-slate-400 line-through">
                                          {hookBefore}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-1 text-xs">
                                        <span className="text-slate-500 font-semibold uppercase text-[10px]">After</span>
                                        <div className="p-2 bg-slate-900 border border-emerald-900/30 rounded text-emerald-100">
                                          {hookAfter}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 pt-2 border-t border-slate-700 mt-1">
                                        <button
                                          onClick={applyHook}
                                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium py-2 rounded-lg transition"
                                        >
                                          Apply Hook
                                        </button>
                                        <button
                                          onClick={handleGenerateHook}
                                          className="px-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg transition"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400">Write a caption first.</p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {(!isCustomized && isOverLimit) && (
                            <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Caption exceeds the limit of selected platform.
                            </p>
                          )}
                          {(isCustomized && computedActiveCaptionTab && (captions[computedActiveCaptionTab] || "").length > (PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200)) && (
                            <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Caption exceeds platform limit.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Image / Media Upload Box */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-400">Attached Media</span>
                        {media ? (
                          <div className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={media} alt="Uploaded attachment" className="w-full max-h-[180px] object-cover" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
                              >
                                Replace
                              </button>
                              <button
                                onClick={() => {
                                  setMedia(null);
                                  triggerNotification("Image removed.", "info");
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                              mediaDragging
                                ? "border-indigo-500 bg-indigo-500/5 text-indigo-400"
                                : "border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-500"
                            }`}
                          >
                            <Upload className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
                            <p className="text-xs font-medium text-slate-400">
                              Drag & Drop image here, or <span className="text-indigo-400 hover:underline">browse files</span>
                            </p>
                            <p className="text-[10px] text-slate-500">Supports PNG, JPG, WEBP (stored locally)</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>

                      {/* Scheduling Settings */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-900">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400">Date & Time (WIB / UTC+7)</label>
                          <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="p-2.5 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400">Repeat</label>
                          <select
                            value={repeat}
                            onChange={(e) => setRepeat(e.target.value as any)}
                            className="p-2.5 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="none">None</option>
                            <option value="7">Every 7 days</option>
                            <option value="14">Every 14 days</option>
                            <option value="30">Every 30 days</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400">Composer Action</label>
                          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-800 h-full">
                            <button
                              onClick={() => setComposerStatus("scheduled")}
                              className={`py-1.5 text-[11px] font-semibold rounded-md transition ${
                                composerStatus === "scheduled"
                                  ? "bg-slate-900 text-white shadow"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              Schedule Post
                            </button>
                            <button
                              onClick={() => setComposerStatus("draft")}
                              className={`py-1.5 text-[11px] font-semibold rounded-md transition ${
                                composerStatus === "draft"
                                  ? "bg-slate-900 text-white shadow"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              Save as Draft
                            </button>
                          </div>
                        </div>

                        {/* Suggested times row */}
                        <div className="sm:col-span-3 flex flex-col gap-2 pt-2 border-t border-slate-900/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" /> Suggested Times (WIB / UTC+7)
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Based on: <strong className="text-indigo-400 capitalize">{selectedPlatforms[0] || "Instagram"}</strong>
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {(
                              (selectedPlatforms[0] ? selectedPlatforms[0].toLowerCase() : "instagram") === "instagram" ? [
                                { time: "11:00", label: "11:00 — high engagement" },
                                { time: "19:00", label: "19:00 — peak audience" },
                                { time: "21:00", label: "21:00 — late night" },
                              ] : (selectedPlatforms[0]?.toLowerCase() === "linkedin" ? [
                                { time: "08:00", label: "08:00 — morning commute" },
                                { time: "12:00", label: "12:00 — lunch break" },
                                { time: "17:00", label: "17:00 — end of day" },
                              ] : (selectedPlatforms[0]?.toLowerCase() === "x" || selectedPlatforms[0]?.toLowerCase() === "twitter" ? [
                                { time: "09:00", label: "09:00 — high engagement" },
                                { time: "15:00", label: "15:00 — afternoon slump" },
                                { time: "21:00", label: "21:00 — peak activity" },
                              ] : (selectedPlatforms[0]?.toLowerCase() === "facebook" ? [
                                { time: "10:00", label: "10:00 — mid-morning" },
                                { time: "13:00", label: "13:00 — early afternoon" },
                                { time: "18:00", label: "18:00 — after work" },
                              ] : (selectedPlatforms[0]?.toLowerCase() === "tiktok" ? [
                                { time: "12:00", label: "12:00 — lunch break" },
                                { time: "16:00", label: "16:00 — high engagement" },
                                { time: "20:00", label: "20:00 — evening scroll" },
                              ] : [
                                { time: "11:00", label: "11:00 — high engagement" },
                                { time: "15:00", label: "15:00 — mid-afternoon" },
                                { time: "20:00", label: "20:00 — evening chat" },
                              ]))))
                            ).map((sug) => {
                              // extract current date
                              const datePart = scheduledAt ? scheduledAt.split("T")[0] : "2026-07-14";
                              const isSelected = scheduledAt === `${datePart}T${sug.time}`;
                              return (
                                <button
                                  key={sug.time}
                                  type="button"
                                  onClick={() => {
                                    setScheduledAt(`${datePart}T${sug.time}`);
                                    triggerNotification(`Time set to ${sug.time} WIB.`, "success");
                                  }}
                                  className={`px-3 py-2 rounded-lg text-left text-xs font-medium border transition-all flex items-center justify-between ${
                                    isSelected
                                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm"
                                      : "bg-slate-950/50 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200"
                                  }`}
                                >
                                  <span>{sug.label}</span>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Buttons strip */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-900">
                        {editingPostId && (
                          <button
                            onClick={resetComposerForm}
                            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            Cancel Editing
                          </button>
                        )}
                        <div className="w-full flex flex-col sm:flex-row items-center justify-end gap-2 ml-auto">
                          <button
                            onClick={() => handleSavePost("published")}
                            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            Post Now
                          </button>
                          <button
                            onClick={() => handleSavePost()}
                            className="w-full sm:w-auto px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/10 transition"
                          >
                            {editingPostId
                              ? "Update Post"
                              : composerStatus === "draft"
                              ? "Save Draft"
                              : "Schedule Content"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Live Preview Panel */}
                    <div className="lg:col-span-5 flex flex-col gap-4 sticky top-6">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                          Live Cross-Platform Preview
                        </span>
                        {selectedPlatforms.length > 0 && computedActivePreviewTab && (
                          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                            Active Preview: {PLATFORMS_CONFIG[computedActivePreviewTab]?.name || computedActivePreviewTab}
                          </span>
                        )}
                      </div>

                      {selectedPlatforms.length === 0 ? (
                        <div className="bg-slate-900/20 border border-slate-900 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-slate-500">
                          <Layers className="w-8 h-8 text-slate-600" />
                          <p className="text-xs text-center font-medium">
                            Select one or more platforms above to view instant live feed layout mockups.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {/* Tabs above preview if multiple are selected */}
                          {selectedPlatforms.length > 1 && (
                            <div className="flex items-center gap-1.5 p-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none shrink-0">
                              {selectedPlatforms.map((platId) => {
                                const config = PLATFORMS_CONFIG[platId];
                                const isActive = computedActivePreviewTab === platId;
                                return (
                                  <button
                                    key={platId}
                                    onClick={() => setActivePreviewTab(platId)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 ${
                                      isActive
                                        ? "bg-slate-800 text-white shadow-md border border-slate-750"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                                    }`}
                                  >
                                    <div
                                      className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 scale-90"
                                      style={{ backgroundColor: getPlatformBrandColor(platId) }}
                                    >
                                      {getPlatformIcon(platId)}
                                    </div>
                                    <span>{config?.name || platId}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Render selected preview mockup */}
                          {computedActivePreviewTab && renderPlatformMockup(computedActivePreviewTab)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* 3. QUEUE VIEW */}
              {/* ======================================= */}
              {activeView === "queue" && (
                <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" /> Content Queue
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Chronological lists of your drafts, upcoming schedules, and historically published media content.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800 self-start flex-wrap">
                    {[
                      { id: "scheduled", label: "Upcoming Scheduled" },
                      ...(approvalFlowEnabled || posts.some((p) => p.status === "pending_review") ? [{ id: "pending_review", label: "Pending Review" }] : []),
                      { id: "draft", label: "Saved Drafts" },
                      { id: "published", label: "Published History" },
                    ].map((tab) => {
                      const count = posts.filter((p) => {
                        if (tab.id === "draft") {
                          return p.status === "draft" || p.status === "approved";
                        }
                        return p.status === tab.id;
                      }).length;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setQueueTab(tab.id as any)}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                            queueTab === tab.id
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              queueTab === tab.id ? "bg-indigo-700 text-indigo-100" : "bg-slate-950 text-slate-500"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Queue Items List */}
                  <div className="flex flex-col gap-4">
                    {(() => {
                      const currentQueuePosts = posts.filter((p) => {
                        if (queueTab === "draft") {
                          return p.status === "draft" || p.status === "approved";
                        }
                        return p.status === queueTab;
                      });

                      if (currentQueuePosts.length === 0) {
                        const getTabEmptyContent = () => {
                          switch (queueTab) {
                            case "scheduled":
                              return {
                                icon: Clock,
                                title: "No Upcoming Scheduled Posts",
                                desc: "There are no publications scheduled at the moment. Plan ahead by creating content and scheduling them to drop at prime peak times!",
                                buttonText: "Schedule a Post"
                              };
                            case "pending_review":
                              return {
                                icon: Eye,
                                title: "Queue Clean & Reviewed",
                                desc: "No draft submissions are waiting for team approval right now. Everything is polished and set to launch.",
                                buttonText: "Compose Draft"
                              };
                            case "published":
                              return {
                                icon: CheckCircle2,
                                title: "No Published History Yet",
                                desc: "No posts have been published from this workspace yet. Once your scheduled content launches, you can trace history here.",
                                buttonText: "Create a Post"
                              };
                            default: // draft
                              return {
                                icon: Edit3,
                                title: "Your Draft Bin is Empty",
                                desc: "You don't have any saved drafts in this workspace. Write down your raw thoughts, save them as drafts, and perfect them later.",
                                buttonText: "Start a Draft"
                              };
                          }
                        };

                        const emptyContent = getTabEmptyContent();
                        const EmptyIcon = emptyContent.icon;

                        return (
                          <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center text-slate-400 shadow-xl min-h-[360px]">
                            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                              <EmptyIcon className="w-6 h-6 animate-pulse" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-200">{emptyContent.title}</h3>
                            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                              {emptyContent.desc}
                            </p>
                            <button
                              onClick={() => {
                                resetComposerForm();
                                setActiveView("create");
                              }}
                              className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                            >
                              <PlusSquare className="w-4 h-4" /> {emptyContent.buttonText}
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-3">
                          {currentQueuePosts
                            .sort((a, b) => {
                              if (queueTab === "published") {
                                return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(); // reverse chrono for published
                              }
                              return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(); // chrono for schedule
                            })
                            .map((post) => {
                              return (
                                <div
                                  key={post.id}
                                  className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/85 transition rounded-2xl p-5 flex flex-col gap-4 shadow-md"
                                >
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex gap-4 items-start min-w-0 flex-1">
                                      {/* Post Media Preview Column */}
                                      {post.media ? (
                                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={post.media} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        <div className="w-14 h-14 rounded-lg border border-slate-800/80 bg-slate-950/40 flex items-center justify-center shrink-0">
                                          <Hash className="w-4 h-4 text-slate-600" />
                                        </div>
                                      )}

                                      {/* Info Column */}
                                      <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          {/* Platform Badges */}
                                          <div className="flex items-center gap-1">
                                            {post.platforms.map((platId) => (
                                              <div
                                                key={platId}
                                                className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                                                style={{ backgroundColor: getPlatformBrandColor(platId) }}
                                                title={PLATFORMS_CONFIG[platId]?.name || platId}
                                              >
                                                {getPlatformIcon(platId)}
                                              </div>
                                            ))}
                                          </div>

                                          {/* Time Info Badge */}
                                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/60 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            {new Date(post.scheduledAt).toLocaleString([], {
                                              dateStyle: "medium",
                                              timeStyle: "short",
                                            })}
                                          </span>

                                          {post.productionBrief && (
                                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1" title="Production Brief Attached">
                                              <Clipboard className="w-3 h-3" />
                                              Brief
                                            </span>
                                          )}
                                          
                                          {/* Repeat Badge */}
                                          {post.repeat && post.repeat !== "none" && (
                                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
                                              <RefreshCw className="w-3 h-3 text-indigo-500" />
                                              Every {post.repeat} days
                                            </span>
                                          )}

                                          {/* Status Badges */}
                                          {post.status === "approved" && (
                                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                                              <Check className="w-3 h-3" /> Approved
                                            </span>
                                          )}

                                          {post.status === "pending_review" && (
                                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                                              <Clock className="w-3 h-3" /> Pending Review
                                            </span>
                                          )}
                                        </div>

                                        {/* Caption Preview */}
                                        <p className="text-xs text-slate-300 leading-relaxed pr-4">
                                          {post.isCustomized ? (post.captions?.[post.platforms[0]] || "Customized captions") : post.caption}
                                        </p>

                                        {/* Review Comment display */}
                                        {post.approvalComment && (
                                          <div className="mt-1 p-2 bg-rose-950/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs flex flex-col gap-0.5 max-w-xl">
                                            <span className="font-bold text-rose-400 text-[10px] uppercase tracking-wider">Reviewer Comment:</span>
                                            <span>{post.approvalComment}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions Column */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                      {post.status === "pending_review" && (
                                        <div className="flex items-center gap-2 mr-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = posts.map(p => p.id === post.id ? { ...p, status: "approved" as const } : p);
                                              setPosts(updated);
                                              saveStoredPosts(updated, currentWorkspaceId);
                                              triggerNotification("Post approved! It can now be scheduled from drafts.", "success");
                                            }}
                                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-lg shadow-emerald-600/10"
                                          >
                                            <Check className="w-3 h-3" /> Approve
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setCommentingPostId(post.id);
                                              setRequestComment("");
                                            }}
                                            className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                          >
                                            <X className="w-3 h-3" /> Request Changes
                                          </button>
                                        </div>
                                      )}

                                      <button
                                        onClick={() => handleEditPost(post)}
                                        className="p-2 bg-slate-950 hover:bg-slate-800/80 text-indigo-400 hover:text-indigo-300 rounded-lg border border-slate-800/60 transition cursor-pointer"
                                        title="Edit / View Post"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeletingPostId(post.id)}
                                        className="p-2 bg-slate-950 hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 rounded-lg border border-slate-800/60 transition cursor-pointer"
                                        title="Delete Post"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Request Changes Textarea inline */}
                                  {commentingPostId === post.id && (
                                    <div className="border-t border-slate-800/60 pt-3 flex flex-col gap-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for requesting changes</span>
                                      <textarea
                                        value={requestComment}
                                        onChange={(e) => setRequestComment(e.target.value)}
                                        placeholder="e.g. Please update the hashtags, verify the spelling, or swap the media asset."
                                        className="w-full min-h-[60px] bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setCommentingPostId(null)}
                                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRequestChanges(post.id, requestComment)}
                                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                                        >
                                          Submit Request
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* 4. CHANNELS VIEW */}
              {/* ======================================= */}
              {activeView === "channels" && (
                <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-500" /> Social Channels
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage linked accounts. Only connected channels are available inside the content composer.
                    </p>
                  </div>

                  {/* Channel Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {channels.map((chan) => {
                      const limitInfo = PLATFORMS_CONFIG[chan.id];
                      return (
                        <div
                          key={chan.id}
                          className={`bg-slate-900/40 border rounded-2xl p-6 flex flex-col gap-4 justify-between transition shadow-md ${
                            chan.connected ? "border-slate-800" : "border-slate-800/40 opacity-65"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/5"
                                style={{ backgroundColor: getPlatformBrandColor(chan.id) }}
                              >
                                {getPlatformIcon(chan.id)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{chan.name}</span>
                                <span className="text-xs text-slate-500">{chan.handle}</span>
                              </div>
                            </div>

                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                chan.connected
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                  : "bg-slate-950 text-slate-600 border border-slate-900"
                              }`}
                            >
                              {chan.connected ? "Active" : "Offline"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 leading-normal pt-2 border-t border-slate-900">
                            <div className="flex justify-between py-0.5">
                              <span>Character Limit:</span>
                              <span className="font-mono text-slate-300">{limitInfo.limit} chars</span>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span>Post Format:</span>
                              <span className="text-slate-300">Images, Video, Text</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => handleToggleChannel(chan.id)}
                              className={`w-full py-1.5 rounded-lg text-xs font-semibold border transition ${
                                chan.connected
                                  ? "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/10"
                              }`}
                            >
                              {chan.connected ? "Disconnect" : "Connect Channel"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* 5. AI ASSISTANT VIEW */}
              {/* ======================================= */}
              {activeView === "assistant" && (
                <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Bot className="w-5 h-5 text-indigo-500" /> Plano AI Assistant
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Ask questions, generate campaign ideas, refine captions, and brainstorm content plans instantly.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
                    <button
                      onClick={() => setAssistantTab("chat")}
                      className={`text-sm font-semibold transition ${assistantTab === "chat" ? "text-indigo-400 border-b-2 border-indigo-400 pb-2 -mb-[9px]" : "text-slate-500 hover:text-slate-300 pb-2 -mb-[9px]"}`}
                    >
                      AI Chat
                    </button>
                    <button
                      onClick={() => setAssistantTab("plan")}
                      className={`text-sm font-semibold transition ${assistantTab === "plan" ? "text-indigo-400 border-b-2 border-indigo-400 pb-2 -mb-[9px]" : "text-slate-500 hover:text-slate-300 pb-2 -mb-[9px]"}`}
                    >
                      Content Plan Generator
                    </button>
                  </div>

                  {assistantTab === "chat" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch flex-1">
                      {/* Quick Suggestions Left Column */}
                      <div className="md:col-span-1 flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                          AI Copy Prompts
                        </span>
                        {CHAT_SUGGESTIONS.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendChat(sug.prompt)}
                            className="w-full text-left p-4 bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 rounded-2xl text-xs font-medium text-slate-300 hover:text-indigo-400 transition hover:scale-[1.01] shadow-sm"
                          >
                            <span className="block font-bold text-white mb-1 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-indigo-400" /> {sug.label}
                            </span>
                            <span className="text-slate-500 line-clamp-2">{sug.prompt}</span>
                          </button>
                        ))}
                      </div>

                      {/* Chat Window Right Column */}
                      <div className="md:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-xl">
                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 scrollbar-thin">
                          {chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex gap-3 max-w-[85%] ${
                                msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  msg.role === "user"
                                    ? "bg-slate-800 text-indigo-400 border border-slate-700"
                                    : "bg-indigo-600 text-white"
                                }`}
                              >
                                {msg.role === "user" ? "U" : <Bot className="w-3.5 h-3.5" />}
                              </div>

                              <div
                                className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                                  msg.role === "user"
                                    ? "bg-indigo-600/10 text-indigo-200 border border-indigo-500/20"
                                    : "bg-slate-950 text-slate-300 border border-slate-900"
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}

                          {isGenerating && (
                            <div className="flex gap-3 self-start max-w-[85%]">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                                <Bot className="w-3.5 h-3.5" />
                              </div>
                              <div className="p-3 rounded-xl text-xs bg-slate-950 text-slate-500 border border-slate-900 italic flex items-center gap-2">
                                <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                                Plano AI is thinking...
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type your copy questions or request post outlines..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !isGenerating) handleSendChat();
                            }}
                            className="flex-1 p-2.5 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-800 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-slate-700"
                          />
                          <button
                            onClick={() => handleSendChat()}
                            disabled={isGenerating || !chatInput.trim()}
                            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {assistantTab === "plan" && (
                    <div className="flex flex-col gap-6">
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-400">Business Description</label>
                            <textarea
                              value={planBusinessDesc}
                              onChange={(e) => setPlanBusinessDesc(e.target.value)}
                              placeholder="e.g. A premium coffee shop in Jakarta focusing on single-origin beans..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-semibold text-slate-400">Target Audience</label>
                              <input
                                type="text"
                                value={planAudience}
                                onChange={(e) => setPlanAudience(e.target.value)}
                                placeholder="e.g. Millennials, coffee enthusiasts, young professionals"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-400">Frequency</label>
                                <select
                                  value={planFrequency}
                                  onChange={(e) => setPlanFrequency(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="3x/week">3x/week</option>
                                  <option value="5x/week">5x/week</option>
                                  <option value="daily">Daily</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-400">Language</label>
                                <select
                                  value={planLanguage}
                                  onChange={(e) => setPlanLanguage(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="English">English</option>
                                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-slate-400">Target Platforms</label>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(PLATFORMS_CONFIG).map(p => (
                              <button
                                key={p}
                                onClick={() => {
                                  if (planPlatforms.includes(p)) {
                                    setPlanPlatforms(planPlatforms.filter(pl => pl !== p));
                                  } else {
                                    setPlanPlatforms([...planPlatforms, p]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${planPlatforms.includes(p) ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                              >
                                {getPlatformIcon(p)}
                                {PLATFORMS_CONFIG[p]?.name || p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={handleGeneratePlan}
                            disabled={isGeneratingPlan}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition flex items-center gap-2 w-full justify-center disabled:opacity-50"
                          >
                            {isGeneratingPlan ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            {isGeneratingPlan ? "Generating Plan..." : "Generate 30-Day Content Plan"}
                          </button>
                        </div>
                      </div>

                      {generatedPlan.length > 0 && (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-indigo-400" /> Generated Content Plan
                            </h3>
                            <button
                              onClick={addAllPlanPostsToCalendar}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition"
                            >
                              Add all to Calendar
                            </button>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                              <thead className="bg-slate-950 text-xs text-slate-500 uppercase font-semibold">
                                <tr>
                                  <th className="px-4 py-3">Day / Date</th>
                                  <th className="px-4 py-3">Platform</th>
                                  <th className="px-4 py-3">Pillar</th>
                                  <th className="px-4 py-3">Idea</th>
                                  <th className="px-4 py-3">Caption Preview</th>
                                  <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {generatedPlan.map((post, idx) => (
                                  <tr key={idx} className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="font-medium text-white">Day {post.day}</div>
                                      <div className="text-xs text-slate-500">{post.date}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className="px-2 py-1 bg-slate-800 rounded-md text-xs font-medium flex items-center gap-1 w-fit">
                                        {getPlatformIcon(post.platform.toLowerCase())}
                                        {post.platform}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className="text-xs text-indigo-300">{post.contentPillar}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={post.postIdea}>
                                      {post.postIdea}
                                    </td>
                                    <td className="px-4 py-3 text-xs max-w-[300px] truncate text-slate-400" title={post.caption}>
                                      {post.caption}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => addPlanPostToCalendar(post)}
                                        className="p-1.5 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-400 rounded-lg transition"
                                        title="Add to Calendar"
                                      >
                                        <PlusSquare className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ======================================= */}
              {/* 6. ANALYTICS VIEW */}
              {/* ======================================= */}
              {activeView === "analytics" && (
                <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" /> Workspace Analytics
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Performance telemetry: aggregate impressions, platform engagement indices, and top-performing scheduled posts.
                      </p>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 self-start sm:self-center">
                      {([7, 30, 90] as const).map((days) => (
                        <button
                          key={days}
                          onClick={() => {
                            setAnalyticsDays(days);
                            setAiInsights(null); // Reset stale insights when params change
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            analyticsDays === days
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  {posts.length === 0 ? (
                    <div className="flex-1 min-h-[400px] bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center mt-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                        <BarChart3 className="w-8 h-8 animate-pulse" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-200">No Performance Telemetry Data</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                        Analytics require active publications or scheduled posts to map performance indices. Draft and publish content to unlock aggregate impressions, platform engagement insights, and AI Growth Intelligence!
                      </p>
                      <button
                        onClick={() => {
                          resetComposerForm();
                          setActiveView("create");
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition mt-6 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                      >
                        <PlusSquare className="w-4 h-4" /> Schedule Your First Post
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Platform Filter Chips */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter by Platform</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setAnalyticsPlatform("all");
                          setAiInsights(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          analyticsPlatform === "all"
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                            : "bg-slate-900 border-slate-800/80 text-slate-400 hover:bg-slate-800/60"
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        All Platforms
                      </button>
                      {Object.keys(PLATFORMS_CONFIG).map((pId) => {
                        const isSelected = analyticsPlatform === pId;
                        return (
                          <button
                            key={pId}
                            onClick={() => {
                              setAnalyticsPlatform(pId);
                              setAiInsights(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                                : "bg-slate-900 border-slate-800/80 text-slate-400 hover:bg-slate-800/60"
                            }`}
                          >
                            <span className="scale-90">{getPlatformIcon(pId)}</span>
                            {PLATFORMS_CONFIG[pId]?.name || pId}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Metric KPI Cards Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {getKPIs(analyticsDays, analyticsPlatform).map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 shadow-md hover:scale-[1.01] transition duration-200"
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                        <div className="flex items-baseline justify-between mt-1 gap-2 flex-wrap">
                          <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                              stat.isUp
                                ? "text-emerald-400 bg-emerald-950/20 border border-emerald-500/20"
                                : "text-rose-400 bg-rose-950/20 border border-rose-500/20"
                            }`}
                          >
                            <span>{stat.isUp ? "▲" : "▼"}</span>
                            <span>{stat.diff}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{stat.desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Grid of Dynamic SVG Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dynamic Line Chart */}
                    {(() => {
                      const chartData = getLineChartData(analyticsDays, analyticsPlatform);
                      return (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                          <div className="flex justify-between items-center">
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Impressions (Last {analyticsDays} Days)
                              </h2>
                              <p className="text-[10px] text-slate-500 capitalize">
                                Performance tracking for {analyticsPlatform === "all" ? "All Platforms" : analyticsPlatform}
                              </p>
                            </div>
                            <TrendingUp className="w-4 h-4 text-indigo-400" />
                          </div>

                          {/* SVG Line Drawing */}
                          <div className="w-full h-48 bg-slate-950/40 rounded-xl border border-slate-800/80 p-2 relative flex items-center justify-center">
                            <svg viewBox="0 0 300 120" className="w-full h-full">
                              <defs>
                                <linearGradient id="areaGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>

                              {/* Grid Lines */}
                              <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                              <line x1="0" y1="60" x2="300" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                              <line x1="0" y1="100" x2="300" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />

                              {/* Filled Area */}
                              <path d={chartData.areaPath} fill="url(#areaGradientDynamic)" />

                              {/* Stroke Path */}
                              <path
                                d={chartData.strokePath}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />

                              {/* Dynamic Interactive dots */}
                              {chartData.dots.map((dot, dIdx) => (
                                <g key={dIdx} className="group cursor-pointer">
                                  <circle
                                    cx={dot.cx}
                                    cy={dot.cy}
                                    r="4"
                                    fill="#6366f1"
                                    className="transition-all duration-200 hover:r-6 hover:fill-white"
                                  />
                                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <rect
                                      x={dot.cx - 35}
                                      y={dot.cy - 22}
                                      width="70"
                                      height="14"
                                      rx="3"
                                      fill="#0f172a"
                                      stroke="#334155"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x={dot.cx}
                                      y={dot.cy - 12}
                                      fill="#f8fafc"
                                      fontSize="6"
                                      fontFamily="monospace"
                                      textAnchor="middle"
                                    >
                                      {dot.tooltip}
                                    </text>
                                  </g>
                                </g>
                              ))}
                            </svg>

                            {/* Floating tooltip summary */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded px-2.5 py-0.5 text-[8px] font-mono text-slate-300 shadow-lg">
                              {chartData.peakText}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SVG Bar Chart with platforms highlight */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Engagement Rate Per Platform
                          </h2>
                          <p className="text-[10px] text-slate-500">Average interactions during {analyticsDays}-day period</p>
                        </div>
                        <Share2 className="w-4 h-4 text-purple-400" />
                      </div>

                      {/* SVG Bar Drawing */}
                      <div className="w-full h-48 bg-slate-950/40 rounded-xl border border-slate-800/80 p-2 relative flex items-center justify-center">
                        <svg viewBox="0 0 300 120" className="w-full h-full">
                          {/* Y-Axis Line */}
                          <line x1="30" y1="10" x2="30" y2="105" stroke="#1e293b" strokeWidth="1" />
                          {/* X-Axis Line */}
                          <line x1="30" y1="105" x2="290" y2="105" stroke="#1e293b" strokeWidth="1" />

                          {/* Bars */}
                          {getBarChartData(analyticsDays, analyticsPlatform).map((bar, idx) => {
                            const xOffset = 45 + idx * 40;
                            const height = bar.height;
                            const yOffset = 105 - height;
                            return (
                              <g
                                key={bar.name}
                                style={{ opacity: bar.opacity }}
                                className="transition-opacity duration-300"
                              >
                                <rect
                                  x={xOffset}
                                  y={yOffset}
                                  width="20"
                                  height={height}
                                  fill={bar.color}
                                  rx="2"
                                  className="transition duration-300 hover:brightness-110 cursor-pointer"
                                />
                                <text x={xOffset + 10} y={yOffset - 4} fill="#94a3b8" fontSize="6" textAnchor="middle">
                                  {bar.textVal}
                                </text>
                                <text x={xOffset + 10} y="115" fill="#64748b" fontSize="6" textAnchor="middle">
                                  {bar.name}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights Button and Generated Cards Panel */}
                  <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-indigo-400" /> AI Growth Intelligence
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Leverage Gemini to parse your current analytics scope ({analyticsDays} days, {analyticsPlatform === "all" ? "all channels" : analyticsPlatform}) and draft tailored tactics.
                        </p>
                      </div>
                      <button
                        onClick={fetchAIInsights}
                        disabled={loadingInsights}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-indigo-400 text-white font-semibold py-2.5 px-4 rounded-xl transition flex items-center gap-2 text-xs shrink-0 self-start sm:self-center shadow-lg shadow-indigo-600/10"
                      >
                        {loadingInsights ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        {loadingInsights ? "Synthesizing Insights..." : "Generate AI Insights"}
                      </button>
                    </div>

                    {/* Loader State with reassurance */}
                    {loadingInsights && (
                      <div className="py-8 flex flex-col items-center justify-center gap-3 bg-slate-950/30 rounded-xl border border-slate-800/50">
                        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                        <span className="text-xs text-slate-300 font-medium">Analyzing dataset...</span>
                        <span className="text-[10px] text-slate-500 max-w-sm text-center">
                          Gemini is formulating actionable audience-building strategies based on your engagement matrices.
                        </span>
                      </div>
                    )}

                    {/* AI Insights Card Deck */}
                    {aiInsights && aiInsights.insights && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
                      >
                        {aiInsights.insights.map((insight, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-slate-700/80 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded">
                                {insight.platform}
                              </span>
                              <span
                                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                  insight.impact.toLowerCase().includes("high")
                                    ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900/60"
                                    : "text-purple-400 bg-purple-950/40 border border-purple-900/60"
                                }`}
                              >
                                {insight.impact}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-white tracking-tight">{insight.title}</h3>
                              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Top 5 Performing Posts Table */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Top Performing Posts ({analyticsPlatform === "all" ? "All Channels" : analyticsPlatform})
                    </h2>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold">
                            <th className="pb-2.5 font-bold">Platform</th>
                            <th className="pb-2.5 font-bold">Caption Copy Summary</th>
                            <th className="pb-2.5 text-right font-bold">Impressions</th>
                            <th className="pb-2.5 text-right font-bold">Clicks</th>
                            <th className="pb-2.5 text-right font-bold">Engagement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {(analyticsPlatform === "all"
                            ? ALL_PERFORMING_POSTS
                            : ALL_PERFORMING_POSTS.filter((post) =>
                                post.platforms.map((p) => p.toLowerCase()).includes(analyticsPlatform.toLowerCase())
                              )
                          )
                            .slice(0, 5)
                            .map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/20">
                                <td className="py-2.5 font-medium flex items-center gap-1">
                                  {row.platforms.map((p) => (
                                    <span
                                      key={p}
                                      className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 scale-90"
                                      style={{ backgroundColor: getPlatformBrandColor(p) }}
                                    >
                                      {getPlatformIcon(p)}
                                    </span>
                                  ))}
                                </td>
                                <td className="py-2.5 pr-4 truncate max-w-[200px]">{row.caption}</td>
                                <td className="py-2.5 text-right font-mono text-slate-200">{row.imp}</td>
                                <td className="py-2.5 text-right font-mono text-slate-200">{row.clicks}</td>
                                <td className="py-2.5 text-right font-mono text-indigo-400 font-bold">{row.eng}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              )}

              {/* ======================================= */}
              {/* 7. SETTINGS VIEW */}
              {/* ======================================= */}
              {activeView === "settings" && (
                <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <SettingsIcon className="w-5 h-5 text-indigo-500" /> Account Settings
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure user profiles, calendar display timezones, and restore application factory parameters.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column Profile config */}
                    <div className="md:col-span-2 flex flex-col gap-5">
                      {/* User Profile details */}
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">User Profile</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">First Name</span>
                            <input
                              type="text"
                              defaultValue="Aulia"
                              disabled
                              className="p-2 bg-slate-950 rounded-lg text-xs text-slate-500 border border-slate-800/80 cursor-not-allowed"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Last Name</span>
                            <input
                              type="text"
                              defaultValue="Rahman"
                              disabled
                              className="p-2 bg-slate-950 rounded-lg text-xs text-slate-500 border border-slate-800/80 cursor-not-allowed"
                            />
                          </div>
                          <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Email Address</span>
                            <input
                              type="email"
                              defaultValue="aulia.r@elabram.com"
                              disabled
                              className="p-2 bg-slate-950 rounded-lg text-xs text-slate-500 border border-slate-800/80 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Timezone and preferences */}
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace Preferences</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Timezone</span>
                            <select className="p-2 bg-slate-950 rounded-lg text-xs text-slate-300 border border-slate-800">
                              <option>UTC-07:00 (Pacific Time)</option>
                              <option>UTC+00:00 (GMT)</option>
                              <option>UTC+07:00 (Jakarta/Bangkok)</option>
                              <option>UTC+08:00 (Singapore/Kuala Lumpur)</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Week Starts On</span>
                            <select className="p-2 bg-slate-950 rounded-lg text-xs text-slate-300 border border-slate-800">
                              <option>Sunday</option>
                              <option>Monday</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl mt-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-semibold text-white">Content Approval Flow</span>
                              <span className="text-[10px] text-slate-400">Require drafts to be approved before they can be scheduled.</span>
                            </div>
                            <button
                              id="toggle-approval-flow"
                              type="button"
                              onClick={() => {
                                const newVal = !approvalFlowEnabled;
                                setApprovalFlowEnabled(newVal);
                                if (typeof window !== "undefined") {
                                  localStorage.setItem(`plano_approval_flow_enabled_${currentWorkspaceId}`, String(newVal));
                                }
                                triggerNotification(newVal ? "Approval flow enabled!" : "Approval flow disabled.", "info");
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                approvalFlowEnabled ? "bg-indigo-600" : "bg-slate-700"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  approvalFlowEnabled ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column destructive actions */}
                    <div className="md:col-span-1 flex flex-col gap-4">
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">Database Tools</h2>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Reset the workspace to restore default connected accounts, 6 seed posts, and empty AI chat histories.
                        </p>
                        <button
                          onClick={handleResetData}
                          className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Restore Default Seeds
                        </button>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">API Connection</h2>
                        <div className="text-[10px] text-slate-500 flex flex-col gap-1">
                          <p>Gemini API Status:</p>
                          <p className="font-semibold text-slate-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active (Environment Key)
                          </p>
                          <p className="mt-1 leading-normal">
                            All chatbot queries are proxy-routed through our server-side integration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Production Brief Modal */}
          <AnimatePresence>
            {isBriefModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsBriefModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Clipboard className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Production Brief Generator</h2>
                        <p className="text-xs text-slate-400">Transform your caption into actionable production specs for your team.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBriefModalOpen(false)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {!generatedBrief ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Configuration Panel */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-200">Production Roles</label>
                            <div className="grid grid-cols-1 gap-2">
                              {["Video Talent", "Graphic Designer", "Video Editor"].map(role => (
                                <button
                                  key={role}
                                  onClick={() => {
                                    if (briefRoles.includes(role)) {
                                      setBriefRoles(prev => prev.filter(r => r !== role));
                                    } else {
                                      setBriefRoles(prev => [...prev, role]);
                                    }
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                    briefRoles.includes(role)
                                      ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300"
                                      : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {role === "Video Talent" && <Video className="w-4 h-4" />}
                                    {role === "Graphic Designer" && <Palette className="w-4 h-4" />}
                                    {role === "Video Editor" && <Scissors className="w-4 h-4" />}
                                    <span className="text-sm font-medium">{role}</span>
                                  </div>
                                  {briefRoles.includes(role) && <Check className="w-4 h-4" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-200">Language</label>
                              <select
                                value={briefLanguage}
                                onChange={(e) => setBriefLanguage(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              >
                                <option>English</option>
                                <option>Bahasa Indonesia</option>
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-200">Format</label>
                              <select
                                value={briefFormat}
                                onChange={(e) => setBriefFormat(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              >
                                <option>Reels/TikTok Video</option>
                                <option>Static Post</option>
                                <option>Carousel</option>
                                <option>Story</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Context Preview */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context Context</span>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Target Platforms</span>
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {selectedPlatforms.map(p => (
                                  <span key={p} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] text-slate-300 flex items-center gap-1.5">
                                    {getPlatformIcon(p)} {PLATFORMS_CONFIG[p]?.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Base Caption</span>
                              <div className="mt-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 line-clamp-6 leading-relaxed italic">
                                &quot;{isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] : caption}&quot;
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Results Header */}
                        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
                          <h3 className="text-lg font-bold text-white mb-1">{generatedBrief.contentTitle}</h3>
                          <div className="grid grid-cols-2 gap-6 mt-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objective</span>
                              <p className="text-xs text-slate-300 mt-1">{generatedBrief.objective}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Message</span>
                              <p className="text-xs text-slate-300 mt-1">{generatedBrief.keyMessage}</p>
                            </div>
                          </div>
                        </div>

                        {/* Role Tabs */}
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl w-fit">
                            {generatedBrief.briefs.map(b => (
                              <button
                                key={b.role}
                                onClick={() => setBriefActiveTab(b.role)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                  briefActiveTab === b.role
                                    ? "bg-slate-800 text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                {b.role}
                              </button>
                            ))}
                          </div>

                          {generatedBrief.briefs.map(b => (
                            <div
                              key={b.role}
                              className={briefActiveTab === b.role ? "block" : "hidden"}
                            >
                              <div className="grid grid-cols-1 gap-6">
                                {b.sections.map((section, sIdx) => (
                                  <div 
                                    key={sIdx} 
                                    className={`bg-slate-950/40 border border-slate-800 p-5 rounded-2xl ${section.table ? "col-span-full" : "md:col-span-1"}`}
                                  >
                                    <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                      {section.heading}
                                    </h4>
                                    
                                    {section.table ? (
                                      <div className="overflow-x-auto rounded-xl border border-slate-800/50">
                                        <table className="w-full text-left border-collapse min-w-[600px]">
                                          <thead>
                                            <tr className="bg-slate-900/50">
                                              {section.table.columns.map((col, cIdx) => (
                                                <th key={cIdx} className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800 whitespace-nowrap">
                                                  {col}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {section.table.rows.map((row, rIdx) => (
                                              <tr key={rIdx} className="hover:bg-slate-800/20 transition">
                                                {row.map((cell, cIdx) => (
                                                  <td key={cIdx} className="p-3 text-[11px] text-slate-300 border-b border-slate-800/50 align-top">
                                                    {cell}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <ul className="space-y-2">
                                        {section.items?.map((item, iIdx) => (
                                          <li key={iIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                            <ArrowRight className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                              
                              <div className="mt-6 flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    const textBrief = [
                                      `BRIEF: ${b.role}`,
                                      `Title: ${generatedBrief.contentTitle}`,
                                      `Objective: ${generatedBrief.objective}`,
                                      "",
                                      ...b.sections.map(s => {
                                        if (s.table) {
                                          const tableHeader = s.table.columns.join(" | ");
                                          const tableRows = s.table.rows.map(r => r.join(" | ")).join("\n");
                                          return `${s.heading}:\n${tableHeader}\n${"-".repeat(tableHeader.length)}\n${tableRows}`;
                                        }
                                        return `${s.heading}:\n${s.items?.map(i => `- ${i}`).join("\n")}`;
                                      })
                                    ].join("\n\n");
                                    navigator.clipboard.writeText(textBrief);
                                    triggerNotification(`${b.role} brief copied to clipboard.`, "success");
                                  }}
                                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                                >
                                  <Copy className="w-4 h-4" /> Copy {b.role} Brief
                                </button>
                                <button
                                  onClick={() => handleExportBrief()}
                                  className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                                >
                                  <Printer className="w-4 h-4" /> Export PDF
                                </button>
                                <button
                                  onClick={() => handleGenerateBrief()}
                                  className="px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                                >
                                  <RefreshCw className="w-4 h-4" /> Regenerate
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {!generatedBrief && (
                    <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                      <button
                        disabled={isGeneratingBrief || briefRoles.length === 0}
                        onClick={() => handleGenerateBrief()}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/20 transition flex items-center gap-2"
                      >
                        {isGeneratingBrief ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clipboard className="w-4 h-4" />}
                        {isGeneratingBrief ? "Synthesizing Brief..." : "Generate Production Brief"}
                      </button>
                    </div>
                  )}
                  {generatedBrief && (
                    <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                      <button
                        onClick={() => setGeneratedBrief(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-2 transition"
                      >
                        <ChevronLeft className="w-4 h-4" /> Change Configuration
                      </button>
                      <button
                        onClick={() => setIsBriefModalOpen(false)}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
