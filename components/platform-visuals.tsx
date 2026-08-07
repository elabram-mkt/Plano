import React from "react";
import { Instagram, Twitter, Linkedin, Facebook, Video, Hash, Layers } from "lucide-react";

export function getPlatformIcon(platformId: string) {
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
}

export function getPlatformColorClasses(platformId: string) {
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
}

export function getPlatformBrandColor(platformId: string) {
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
}

export function renderFormattedText(text: string, hashtagColorClass: string = "text-indigo-400") {
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
}
