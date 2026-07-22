"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusSquare,
  Sparkles,
  Bot,
  Hash,
  Clipboard,
  X,
  RefreshCw,
  Upload,
  Trash2,
  AlertCircle,
  Layers,
  Video,
  Palette,
  Scissors,
  Check,
  Copy,
  Printer,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { usePlano } from "@/lib/plano-context";
import { PLATFORMS_CONFIG, ProductionBrief } from "@/lib/store";
import { getPlatformIcon, getPlatformBrandColor } from "@/components/platform-visuals";
import { PlatformMockup } from "@/components/platform-mockup";

export default function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { posts, channels, approvalFlowEnabled, updatePostsInStorage, triggerNotification, markAiUsed } = usePlano();

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

  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLanguage, setAiLanguage] = useState("English");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const [isHashtagsPopoverOpen, setIsHashtagsPopoverOpen] = useState(false);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  const [isHookPopoverOpen, setIsHookPopoverOpen] = useState(false);
  const [hookBefore, setHookBefore] = useState("");
  const [hookAfter, setHookAfter] = useState("");
  const [isGeneratingHook, setIsGeneratingHook] = useState(false);

  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [briefRoles, setBriefRoles] = useState<string[]>(["Video Talent"]);
  const [briefLanguage, setBriefLanguage] = useState("English");
  const [briefFormat, setBriefFormat] = useState("Reels/TikTok Video");
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<ProductionBrief | null>(null);
  const [briefActiveTab, setBriefActiveTab] = useState<string>("");

  const computedActivePreviewTab =
    activePreviewTab && selectedPlatforms.includes(activePreviewTab) ? activePreviewTab : selectedPlatforms[0] || null;

  const computedActiveCaptionTab =
    activeCaptionTab && selectedPlatforms.includes(activeCaptionTab) ? activeCaptionTab : selectedPlatforms[0] || null;

  const resetComposerForm = useCallback(() => {
    setEditingPostId(null);
    setCaption("");
    setCaptions({});
    setIsCustomized(false);
    setMedia(null);
    setGeneratedBrief(null);
    setScheduledAt("2026-07-14T12:00");
    setComposerStatus("scheduled");
    setRepeat("none");
    setSelectedPlatforms((prev) => {
      if (prev.length > 0) return prev;
      const connected = channels.filter((c) => c.connected).map((c) => c.id);
      return connected.length > 0 ? [connected[0]] : prev;
    });
  }, [channels]);

  // Load an existing post when navigated here with ?edit=<id>, prefill a date
  // when navigated with ?date=<YYYY-MM-DD>, or start fresh otherwise.
  useEffect(() => {
    const editId = searchParams.get("edit");
    const dateParam = searchParams.get("date");

    if (editId) {
      const post = posts.find((p) => p.id === editId);
      if (post) {
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
      }
      return;
    }

    if (dateParam) {
      setScheduledAt(`${dateParam}T12:00`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, posts.length]);

  // Default (or clean up) selected platforms whenever the connected channel
  // set changes, unless we're mid-edit of an existing post.
  useEffect(() => {
    if (editingPostId) return;
    const connectedIds = channels.filter((c) => c.connected).map((c) => c.id);
    setSelectedPlatforms((prev) => {
      const filtered = prev.filter((p) => connectedIds.includes(p));
      if (filtered.length > 0) return filtered;
      if (connectedIds.length > 0 && prev.length === 0) return [connectedIds[0]];
      return filtered;
    });
  }, [channels, editingPostId]);

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
      const isAlreadyApprovedOrScheduled = existing ? existing.status === "approved" || existing.status === "scheduled" : false;
      if (!isAlreadyApprovedOrScheduled) {
        actualStatus = "pending_review";
        submittedForReview = true;
      }
    }

    const currentTimestamp = new Date().toISOString().slice(0, 16);

    if (editingPostId) {
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
      router.push("/queue");
    } else {
      const newPost = {
        id: String(Math.floor(Math.random() * 10000000) + Date.now()),
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
      router.push("/queue");
    }
  };

  const handleAiWriteGenerate = async () => {
    if (!aiTopic.trim()) {
      triggerNotification("Please enter a topic first.", "error");
      return;
    }

    setIsAiGenerating(true);

    const targetPlatform =
      isCustomized && computedActiveCaptionTab
        ? computedActiveCaptionTab
        : selectedPlatforms.length > 0
        ? selectedPlatforms.map((p) => PLATFORMS_CONFIG[p]?.name || p).join(", ")
        : "general social media";

    const limitInfo =
      isCustomized && computedActiveCaptionTab
        ? `Ensure it's well under ${PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200} characters.`
        : selectedPlatforms.length > 0
        ? `Ensure it satisfies the character limits: ${selectedPlatforms
            .map((p) => `${PLATFORMS_CONFIG[p]?.name} (${PLATFORMS_CONFIG[p]?.limit})`)
            .join(", ")}.`
        : "";

    const prompt = `Write a ${aiTone} social media caption in ${aiLanguage} about the following topic: "${aiTopic}".
Target platform(s): ${targetPlatform}. ${limitInfo}
Produce ONLY the caption text (no preamble, no quotes) and add 3-5 relevant hashtags at the end.`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate caption.");
      }

      const data = await response.json();
      const generatedText = data.response;

      if (isCustomized && computedActiveCaptionTab) {
        setCaptions((prev) => ({ ...prev, [computedActiveCaptionTab]: generatedText }));
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
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!response.ok) throw new Error("Failed to generate hashtags.");

      const data = await response.json();
      let text = data.response.trim();
      if (text.startsWith("```json")) text = text.slice(7, -3);
      else if (text.startsWith("```")) text = text.slice(3, -3);

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
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
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
      setCaptions((prev) => ({ ...prev, [computedActiveCaptionTab]: newCaption }));
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
      setCaptions((prev) => ({ ...prev, [computedActiveCaptionTab]: newCaption }));
    } else {
      setCaption(newCaption);
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
      "Video Talent": `hook line to say in the first 3 seconds, full talking points/script outline, tone & energy direction, wardrobe suggestion, do's & don'ts on camera.${
        briefFormat === "Reels/TikTok Video" ? " ALSO INCLUDE a 'Shot List' section with a numbered table of scenes." : ""
      }`,
      "Graphic Designer":
        "visual concept, composition/layout direction, exact dimensions per selected platform (e.g. 1080x1350 feed, 1080x1920 story), color & typography direction, text elements to include (headline, subheadline, CTA), reference style keywords.",
      "Video Editor": `recommended duration per platform, pacing & cut style, on-screen caption/subtitle direction, music/audio mood, b-roll suggestions, safe zones for platform UI, export specs (ratio, resolution, format).${
        briefFormat === "Reels/TikTok Video" ? " ALSO INCLUDE a 'Shot List' section with a numbered table of scenes." : ""
      }`,
    };

    const rolesPrompt = briefRoles.map((role) => `${role}: ${roleRequirements[role as keyof typeof roleRequirements]}`).join("\n");

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
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!response.ok) throw new Error("AI generation failed.");

      const data = await response.json();
      let text = data.response;

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

    const platformListHtml = selectedPlatforms
      .map(
        (p) => `
      <span style="display: inline-flex; align-items: center; gap: 4px; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #555;">
        ${PLATFORMS_CONFIG[p]?.name}
      </span>
    `
      )
      .join(" ");

    const briefsHtml = generatedBrief.briefs
      .map(
        (b) => `
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 8px; color: #000; text-transform: uppercase; font-size: 16px; margin-bottom: 20px;">Role: ${b.role}</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${b.sections
            .map(
              (s) => `
            <div style="${s.table ? "grid-column: span 2;" : ""}">
              <h3 style="font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 10px; border-left: 3px solid #6366f1; padding-left: 8px;">${s.heading}</h3>
              ${
                s.table
                  ? `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
                  <thead>
                    <tr style="background: #f8fafc;">
                      ${s.table.columns.map((col) => `<th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; color: #64748b;">${col}</th>`).join("")}
                    </tr>
                  </thead>
                  <tbody>
                    ${s.table.rows
                      .map(
                        (row) => `
                      <tr>
                        ${row.map((cell) => `<td style="border: 1px solid #e2e8f0; padding: 8px; color: #334155; vertical-align: top;">${cell}</td>`).join("")}
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
                  : `
                <ul style="padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.6; margin: 0;">
                  ${s.items?.map((item) => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
                </ul>
              `
              }
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
      )
      .join("");

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

  return (
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
          {editingPostId && posts.find((p) => p.id === editingPostId)?.approvalComment && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex flex-col gap-1">
              <span className="font-bold text-rose-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Revision Requested by Reviewer
              </span>
              <span className="text-slate-200">{posts.find((p) => p.id === editingPostId)?.approvalComment}</span>
            </div>
          )}

          {/* Platform Selectors */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400">Select Channels</span>
            <div className="flex flex-wrap gap-2">
              {channels.map((chan) => {
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
                        selectedPlatforms.forEach((p) => {
                          if (!newCaptions[p]) newCaptions[p] = caption;
                        });
                        setCaptions(newCaptions);
                        if (selectedPlatforms.length > 0 && !activeCaptionTab) {
                          setActiveCaptionTab(selectedPlatforms[0]);
                        }
                      }
                      setIsCustomized(!isCustomized);
                    }}
                    className={`w-7 h-4 rounded-full relative transition-colors ${isCustomized ? "bg-indigo-500" : "bg-slate-700"}`}
                  >
                    <span
                      className={`block w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                        isCustomized ? "translate-x-3.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </label>

                {!isCustomized && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isOverLimit ? "bg-rose-500/10 text-rose-400 font-bold" : "bg-slate-950 text-slate-400"
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
                    {(captions[computedActiveCaptionTab] || "").length} / {PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200}{" "}
                    limit
                  </span>
                )}
              </div>
            </div>

            {isCustomized && selectedPlatforms.length > 0 && (
              <div className="flex items-center gap-1 mb-0 mt-1 overflow-x-auto scrollbar-none">
                {selectedPlatforms.map((p) => {
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
                  );
                })}
              </div>
            )}

            <textarea
              placeholder={
                isCustomized
                  ? `Draft your custom caption for ${PLATFORMS_CONFIG[computedActiveCaptionTab || ""]?.name || "platform"}...`
                  : "What would you like to share? Write your caption or draft ideas here..."
              }
              value={isCustomized ? (computedActiveCaptionTab ? captions[computedActiveCaptionTab] || "" : "") : caption}
              onChange={(e) => {
                if (isCustomized && computedActiveCaptionTab) {
                  setCaptions((prev) => ({ ...prev, [computedActiveCaptionTab]: e.target.value }));
                } else {
                  setCaption(e.target.value);
                }
              }}
              rows={6}
              className={`w-full p-3.5 bg-slate-950 rounded-lg text-sm text-slate-200 border transition placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                (isCustomized &&
                  computedActiveCaptionTab &&
                  (captions[computedActiveCaptionTab] || "").length > (PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200)) ||
                (!isCustomized && isOverLimit)
                  ? "border-rose-500"
                  : "border-slate-800 focus:border-slate-700"
              } ${isCustomized && selectedPlatforms.length > 0 ? "rounded-tl-none" : ""}`}
            />
            <div className="flex justify-between items-center mt-1 relative">
              <div className="flex items-center gap-4">
                {/* AI Copywriting Button */}
                <button
                  onClick={() => {
                    resetComposerForm();
                    const text = isCustomized && computedActiveCaptionTab ? captions[computedActiveCaptionTab] : caption;
                    router.push(`/ai?draft=${encodeURIComponent(`Draft a highly engaging post about: "${text || "[topic]"}"`)}`);
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
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-emerald-400" /> AI Write
                        </h4>
                        <button onClick={() => setIsAiPopoverOpen(false)} className="text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
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
                          {isAiGenerating
                            ? "Generating..."
                            : caption.trim() || (isCustomized && computedActiveCaptionTab && captions[computedActiveCaptionTab]?.trim())
                            ? "Regenerate"
                            : "Generate"}
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
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Hash className="w-4 h-4 text-blue-400" /> AI Hashtags
                        </h4>
                        <button onClick={() => setIsHashtagsPopoverOpen(false)} className="text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {isGeneratingHashtags ? (
                        <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                          <p className="text-xs">Generating relevant hashtags...</p>
                        </div>
                      ) : aiHashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {aiHashtags.map((tag) => (
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
                          <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingHashtags ? "animate-spin" : ""}`} />
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
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" /> Improve Hook
                        </h4>
                        <button onClick={() => setIsHookPopoverOpen(false)} className="text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
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
                            <div className="p-2 bg-slate-900 border border-emerald-900/30 rounded text-emerald-100">{hookAfter}</div>
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

              {!isCustomized && isOverLimit && (
                <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Caption exceeds the limit of selected platform.
                </p>
              )}
              {isCustomized &&
                computedActiveCaptionTab &&
                (captions[computedActiveCaptionTab] || "").length > (PLATFORMS_CONFIG[computedActiveCaptionTab]?.limit || 2200) && (
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
                  mediaDragging ? "border-indigo-500 bg-indigo-500/5 text-indigo-400" : "border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-500"
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
                onChange={(e) => setRepeat(e.target.value as "none" | "7" | "14" | "30")}
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
                    composerStatus === "scheduled" ? "bg-slate-900 text-white shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Schedule Post
                </button>
                <button
                  onClick={() => setComposerStatus("draft")}
                  className={`py-1.5 text-[11px] font-semibold rounded-md transition ${
                    composerStatus === "draft" ? "bg-slate-900 text-white shadow" : "text-slate-400 hover:text-slate-200"
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
                  (selectedPlatforms[0] ? selectedPlatforms[0].toLowerCase() : "instagram") === "instagram"
                    ? [
                        { time: "11:00", label: "11:00 — high engagement" },
                        { time: "19:00", label: "19:00 — peak audience" },
                        { time: "21:00", label: "21:00 — late night" },
                      ]
                    : selectedPlatforms[0]?.toLowerCase() === "linkedin"
                    ? [
                        { time: "08:00", label: "08:00 — morning commute" },
                        { time: "12:00", label: "12:00 — lunch break" },
                        { time: "17:00", label: "17:00 — end of day" },
                      ]
                    : selectedPlatforms[0]?.toLowerCase() === "x" || selectedPlatforms[0]?.toLowerCase() === "twitter"
                    ? [
                        { time: "09:00", label: "09:00 — high engagement" },
                        { time: "15:00", label: "15:00 — afternoon slump" },
                        { time: "21:00", label: "21:00 — peak activity" },
                      ]
                    : selectedPlatforms[0]?.toLowerCase() === "facebook"
                    ? [
                        { time: "10:00", label: "10:00 — mid-morning" },
                        { time: "13:00", label: "13:00 — early afternoon" },
                        { time: "18:00", label: "18:00 — after work" },
                      ]
                    : selectedPlatforms[0]?.toLowerCase() === "tiktok"
                    ? [
                        { time: "12:00", label: "12:00 — lunch break" },
                        { time: "16:00", label: "16:00 — high engagement" },
                        { time: "20:00", label: "20:00 — evening scroll" },
                      ]
                    : [
                        { time: "11:00", label: "11:00 — high engagement" },
                        { time: "15:00", label: "15:00 — mid-afternoon" },
                        { time: "20:00", label: "20:00 — evening chat" },
                      ]
                ).map((sug) => {
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
                {editingPostId ? "Update Post" : composerStatus === "draft" ? "Save Draft" : "Schedule Content"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Live Cross-Platform Preview</span>
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
              {computedActivePreviewTab && (
                <PlatformMockup
                  platId={computedActivePreviewTab}
                  caption={caption}
                  captions={captions}
                  isCustomized={isCustomized}
                  media={media}
                  scheduledAt={scheduledAt}
                />
              )}
            </div>
          )}
        </div>
      </div>

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
                          {["Video Talent", "Graphic Designer", "Video Editor"].map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                if (briefRoles.includes(role)) {
                                  setBriefRoles((prev) => prev.filter((r) => r !== role));
                                } else {
                                  setBriefRoles((prev) => [...prev, role]);
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
                            {selectedPlatforms.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] text-slate-300 flex items-center gap-1.5"
                              >
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
                        {generatedBrief.briefs.map((b) => (
                          <button
                            key={b.role}
                            onClick={() => setBriefActiveTab(b.role)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              briefActiveTab === b.role ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {b.role}
                          </button>
                        ))}
                      </div>

                      {generatedBrief.briefs.map((b) => (
                        <div key={b.role} className={briefActiveTab === b.role ? "block" : "hidden"}>
                          <div className="grid grid-cols-1 gap-6">
                            {b.sections.map((section, sIdx) => (
                              <div
                                key={sIdx}
                                className={`bg-slate-950/40 border border-slate-800 p-5 rounded-2xl ${
                                  section.table ? "col-span-full" : "md:col-span-1"
                                }`}
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
                                            <th
                                              key={cIdx}
                                              className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800 whitespace-nowrap"
                                            >
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
                                  ...b.sections.map((s) => {
                                    if (s.table) {
                                      const tableHeader = s.table.columns.join(" | ");
                                      const tableRows = s.table.rows.map((r) => r.join(" | ")).join("\n");
                                      return `${s.heading}:\n${tableHeader}\n${"-".repeat(tableHeader.length)}\n${tableRows}`;
                                    }
                                    return `${s.heading}:\n${s.items?.map((i) => `- ${i}`).join("\n")}`;
                                  }),
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
  );
}
