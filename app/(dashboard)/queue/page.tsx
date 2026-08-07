"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  PlusSquare,
  Eye,
  CheckCircle2,
  Edit3,
  Hash,
  Clipboard,
  RefreshCw,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlano } from "@/lib/plano-context";
import { getPlatformIcon, getPlatformBrandColor } from "@/components/platform-visuals";
import { PLATFORMS_CONFIG } from "@/lib/store";

export default function QueuePage() {
  const router = useRouter();
  const { posts, approvalFlowEnabled, handleEditPost, handleDeletePost, handleRequestChanges, updatePostsInStorage, triggerNotification } =
    usePlano();

  const [queueTab, setQueueTab] = useState<"scheduled" | "draft" | "published" | "pending_review">("scheduled");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [requestComment, setRequestComment] = useState("");

  const currentQueuePosts = posts.filter((p) => {
    if (queueTab === "draft") {
      return p.status === "draft" || p.status === "approved";
    }
    return p.status === queueTab;
  });

  const getTabEmptyContent = () => {
    switch (queueTab) {
      case "scheduled":
        return {
          icon: Clock,
          title: "No Upcoming Scheduled Posts",
          desc: "There are no publications scheduled at the moment. Plan ahead by creating content and scheduling them to drop at prime peak times!",
          buttonText: "Schedule a Post",
        };
      case "pending_review":
        return {
          icon: Eye,
          title: "Queue Clean & Reviewed",
          desc: "No draft submissions are waiting for team approval right now. Everything is polished and set to launch.",
          buttonText: "Compose Draft",
        };
      case "published":
        return {
          icon: CheckCircle2,
          title: "No Published History Yet",
          desc: "No posts have been published from this workspace yet. Once your scheduled content launches, you can trace history here.",
          buttonText: "Create a Post",
        };
      default: // draft
        return {
          icon: Edit3,
          title: "Your Draft Bin is Empty",
          desc: "You don't have any saved drafts in this workspace. Write down your raw thoughts, save them as drafts, and perfect them later.",
          buttonText: "Start a Draft",
        };
    }
  };

  return (
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
          ...(approvalFlowEnabled || posts.some((p) => p.status === "pending_review")
            ? [{ id: "pending_review", label: "Pending Review" }]
            : []),
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
              onClick={() => setQueueTab(tab.id as typeof queueTab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                queueTab === tab.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
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
        {currentQueuePosts.length === 0 ? (
          (() => {
            const emptyContent = getTabEmptyContent();
            const EmptyIcon = emptyContent.icon;
            return (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center text-slate-400 shadow-xl min-h-[360px]">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <EmptyIcon className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">{emptyContent.title}</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">{emptyContent.desc}</p>
                <button
                  onClick={() => router.push("/compose")}
                  className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                >
                  <PlusSquare className="w-4 h-4" /> {emptyContent.buttonText}
                </button>
              </div>
            );
          })()
        ) : (
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
                              <span
                                className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1"
                                title="Production Brief Attached"
                              >
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
                            {post.isCustomized ? post.captions?.[post.platforms[0]] || "Customized captions" : post.caption}
                          </p>

                          {/* Review Comment display */}
                          {post.approvalComment && (
                            <div className="mt-1 p-2 bg-rose-950/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs flex flex-col gap-0.5 max-w-xl">
                              <span className="font-bold text-rose-400 text-[10px] uppercase tracking-wider">
                                Reviewer Comment:
                              </span>
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
                                const updated = posts.map((p) =>
                                  p.id === post.id ? { ...p, status: "approved" as const } : p
                                );
                                updatePostsInStorage(updated);
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Reason for requesting changes
                        </span>
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
                            onClick={() => {
                              handleRequestChanges(post.id, requestComment);
                              setCommentingPostId(null);
                              setRequestComment("");
                            }}
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
        )}
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

              <h3 className="text-base font-bold text-white tracking-tight">Delete this post?</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                This action cannot be undone. This post will be permanently deleted from your editorial calendar and content
                queues.
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
    </div>
  );
}
