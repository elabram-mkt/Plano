export interface Post {
  id: string;
  platforms: string[]; // ['instagram', 'x', 'linkedin', 'facebook', 'tiktok', 'threads']
  caption: string;
  captions?: Record<string, string>; // per-platform captions
  isCustomized?: boolean;
  media: string | null; // Base64 data url or external url placeholder
  scheduledAt: string; // "YYYY-MM-DDTHH:MM"
  status: "scheduled" | "draft" | "published" | "pending_review" | "approved";
  publishedAt: string | null;
  repeat?: "none" | "7" | "14" | "30";
  skippedOccurrences?: string[]; // array of 'YYYY-MM-DD' dates that were skipped
  approvalComment?: string; // stored comment from requested changes
}

export interface Channel {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // brand HEX or tailwind color classes
  connected: boolean;
  handle: string;
  limit: number;
}

export const PLATFORMS_CONFIG: Record<string, { name: string; color: string; limit: number; handle: string }> = {
  instagram: { name: "Instagram", color: "#E1306C", limit: 2200, handle: "@plano_app" },
  x: { name: "X (Twitter)", color: "#14171A", limit: 280, handle: "@plano_scheduler" },
  linkedin: { name: "LinkedIn", color: "#0A66C2", limit: 3000, handle: "Plano SaaS" },
  facebook: { name: "Facebook", color: "#1877F2", limit: 5000, handle: "Plano App" },
  tiktok: { name: "TikTok", color: "#00F2FE", limit: 2200, handle: "@planotok" },
  threads: { name: "Threads", color: "#000000", limit: 500, handle: "@plano_threads" },
};

export const INITIAL_CHANNELS: Channel[] = [
  { id: "instagram", name: "Instagram", icon: "Instagram", color: "#E1306C", connected: true, handle: "@plano_app", limit: 2200 },
  { id: "x", name: "X (Twitter)", icon: "Twitter", color: "#3A3F47", connected: true, handle: "@plano_scheduler", limit: 280 },
  { id: "linkedin", name: "LinkedIn", icon: "Linkedin", color: "#0A66C2", connected: true, handle: "Plano SaaS", limit: 3000 },
  { id: "facebook", name: "Facebook", icon: "Facebook", color: "#1877F2", connected: false, handle: "Plano App", limit: 5000 },
  { id: "tiktok", name: "TikTok", icon: "Video", color: "#FE2C55", connected: false, handle: "@planotok", limit: 2200 },
  { id: "threads", name: "Threads", icon: "Hash", color: "#000000", connected: true, handle: "@plano_threads", limit: 500 },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    platforms: ["x", "linkedin"],
    caption: "Super excited to launch Plano! 🚀 The ultimate social media scheduler for creators and teams. Crafting posts has never been this seamless. Check it out and optimize your workflow today! #launch #marketing #productivity #SaaS",
    media: "https://picsum.photos/seed/launch/600/400",
    scheduledAt: "2026-07-12T09:00",
    status: "published",
    publishedAt: "2026-07-12T09:01",
  },
  {
    id: "2",
    platforms: ["instagram"],
    caption: "5 tips to supercharge your social media workflow using Plano AI Assistant. Hint: it starts with smart automation and direct draft creation! 🤖✨ swipe left to read our mini-guide.\n\n1. Brainstorm with Plano AI\n2. Schedule to optimal hours\n3. Match platform guidelines\n4. Re-purpose cross-platform\n5. Review analytics regularly\n\n#socialmedia #productivity #AI #marketingtips",
    media: "https://picsum.photos/seed/tips/600/400",
    scheduledAt: "2026-07-14T14:30",
    status: "scheduled",
    publishedAt: null,
  },
  {
    id: "3",
    platforms: ["linkedin"],
    caption: "Consistency is key when growing an organic audience. What is your preferred time of day to publish on LinkedIn, and have you noticed any patterns in engagement? Let's discuss in the comments below! 👇\n\nFor us, Tuesday and Thursday mornings around 9 AM local time tend to yield the highest CTR and initial impressions.",
    media: null,
    scheduledAt: "2026-07-15T10:00",
    status: "scheduled",
    publishedAt: null,
  },
  {
    id: "4",
    platforms: ["x", "threads"],
    caption: "Creating high-converting hooks is easier than you think. Follow this 3-step formula:\n\n1. Agitate the problem\n2. Provide micro-education\n3. Clear, low-friction call to action\n\nWhich stage do you struggle with most? 👇",
    media: null,
    scheduledAt: "2026-07-17T11:15",
    status: "scheduled",
    publishedAt: null,
  },
  {
    id: "5",
    platforms: ["linkedin", "threads"],
    caption: "[Draft Post] Some raw thoughts on building a modern bootstrapped SaaS tool in 2026.\n\nFirst, focus entirely on UX and utility. Second, avoid bloated integrations you don't need yet. Third, talk to your users every single day. If you listen carefully, they'll write your roadmap for you.",
    media: null,
    scheduledAt: "2026-07-20T16:00",
    status: "draft",
    publishedAt: null,
  },
  {
    id: "6",
    platforms: ["instagram", "x"],
    caption: "Behind the scenes at Plano: How we design interfaces that feel alive. 🎨\n\nWe focus on fluid layouts, high contrast dark palettes, subtle micro-interactions, and beautiful negative space. We believe a scheduling tool shouldn't just be useful—it should be a joy to spend time in.\n\nWhat do you think of our new workspace theme?",
    media: "https://picsum.photos/seed/design/600/400",
    scheduledAt: "2026-07-21T15:00",
    status: "scheduled",
    publishedAt: null,
  },
];

export interface Workspace {
  id: string;
  name: string;
  color: string; // hex color or brand color
}

export const INITIAL_WORKSPACES: Workspace[] = [
  { id: "elabram", name: "Elabram", color: "#6366f1" },
  { id: "client_a", name: "Client A", color: "#10b981" },
];

export function getStoredWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return INITIAL_WORKSPACES;
  const stored = localStorage.getItem("plano_workspaces");
  if (!stored) {
    localStorage.setItem("plano_workspaces", JSON.stringify(INITIAL_WORKSPACES));
    return INITIAL_WORKSPACES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_WORKSPACES;
  }
}

export function saveStoredWorkspaces(workspaces: Workspace[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("plano_workspaces", JSON.stringify(workspaces));
}

export function getCurrentWorkspaceId(): string {
  if (typeof window === "undefined") return "elabram";
  const stored = localStorage.getItem("plano_current_workspace_id");
  if (!stored) {
    localStorage.setItem("plano_current_workspace_id", "elabram");
    return "elabram";
  }
  return stored;
}

export function saveCurrentWorkspaceId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("plano_current_workspace_id", id);
}

export function getStoredChannels(workspaceId?: string): Channel[] {
  if (typeof window === "undefined") return INITIAL_CHANNELS;
  const wId = workspaceId || getCurrentWorkspaceId();
  const key = wId === "elabram" ? "plano_channels" : `plano_channels_${wId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(INITIAL_CHANNELS));
    return INITIAL_CHANNELS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_CHANNELS;
  }
}

export function saveStoredChannels(channels: Channel[], workspaceId?: string) {
  if (typeof window === "undefined") return;
  const wId = workspaceId || getCurrentWorkspaceId();
  const key = wId === "elabram" ? "plano_channels" : `plano_channels_${wId}`;
  localStorage.setItem(key, JSON.stringify(channels));
}

export function getStoredPosts(workspaceId?: string): Post[] {
  if (typeof window === "undefined") return INITIAL_POSTS;
  const wId = workspaceId || getCurrentWorkspaceId();
  const key = wId === "elabram" ? "plano_posts" : `plano_posts_${wId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_POSTS;
  }
}

export function saveStoredPosts(posts: Post[], workspaceId?: string) {
  if (typeof window === "undefined") return;
  const wId = workspaceId || getCurrentWorkspaceId();
  const key = wId === "elabram" ? "plano_posts" : `plano_posts_${wId}`;
  localStorage.setItem(key, JSON.stringify(posts));
}

export function resetToDefaults() {
  if (typeof window === "undefined") return;
  const wId = getCurrentWorkspaceId();
  const channelKey = wId === "elabram" ? "plano_channels" : `plano_channels_${wId}`;
  const postKey = wId === "elabram" ? "plano_posts" : `plano_posts_${wId}`;
  localStorage.setItem(channelKey, JSON.stringify(INITIAL_CHANNELS));
  localStorage.setItem(postKey, JSON.stringify(INITIAL_POSTS));
  localStorage.removeItem("plano_chat_history");
}

