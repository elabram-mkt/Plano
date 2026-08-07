// Deterministic mock analytics generators, ported verbatim from the
// original composed view. Not real telemetry — purely presentational.

export const ALL_PERFORMING_POSTS = [
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

export function getKPIs(days: number, platform: string) {
  const baseMultipliers: Record<string, { imp: number; eng: number; fol: number; posts: number }> = {
    all: { imp: 1, eng: 1, fol: 1, posts: 1 },
    instagram: { imp: 0.42, eng: 1.23, fol: 0.55, posts: 0.35 },
    x: { imp: 0.28, eng: 0.55, fol: 0.22, posts: 0.45 },
    linkedin: { imp: 0.18, eng: 1.05, fol: 0.15, posts: 0.15 },
    facebook: { imp: 0.08, eng: 0.38, fol: 0.05, posts: 0.05 },
    tiktok: { imp: 0.35, eng: 1.52, fol: 0.65, posts: 0.25 },
    threads: { imp: 0.05, eng: 0.65, fol: 0.03, posts: 0.1 },
  };

  const mult = baseMultipliers[platform] || baseMultipliers.all;
  const daysMult = days === 7 ? 0.23 : days === 90 ? 3.12 : 1.0;

  const impressionsRaw = Math.round(142800 * mult.imp * daysMult);
  const impressionsVal = impressionsRaw >= 1000 ? `${(impressionsRaw / 1000).toFixed(1)}K` : `${impressionsRaw}`;

  const engagementRaw = 3.42 * mult.eng * (days === 7 ? 1.04 : days === 90 ? 0.92 : 1.0);
  const engagementVal = `${engagementRaw.toFixed(2)}%`;

  const followersRaw = Math.round(1240 * mult.fol * daysMult * (platform === "tiktok" ? 1.4 : 1.0));
  const followersVal = followersRaw >= 1000 ? `+${(followersRaw / 1000).toFixed(1)}K` : `+${followersRaw}`;

  const postsRaw = Math.round(56 * mult.posts * (days === 7 ? 0.25 : days === 90 ? 2.85 : 1.0));
  const postsVal = `${postsRaw} posts`;

  const impDiff = (platform === "facebook" ? -2.4 : 12.4) * (days === 7 ? 0.8 : days === 90 ? 1.4 : 1.0);
  const engDiff = (platform === "x" ? -0.3 : 0.8) * (days === 7 ? 1.2 : days === 90 ? 0.6 : 1.0);
  const folDiff = (platform === "threads" ? -1.1 : 15.2) * (days === 7 ? 0.9 : days === 90 ? 1.1 : 1.0);
  const postDiff = (platform === "linkedin" ? -1.5 : 5.4) * (days === 7 ? 0.5 : days === 90 ? 1.2 : 1.0);

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

export function getLineChartData(days: number, platform: string) {
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

export function getBarChartData(days: number, selectedPlatform: string) {
  const baseRates = [
    { name: "Inst", id: "instagram", rate: 85, color: "#E1306C", text: "4.2" },
    { name: "X", id: "x", rate: 50, color: "#3A3F47", text: "1.8" },
    { name: "Lkd", id: "linkedin", rate: 75, color: "#0A66C2", text: "3.5" },
    { name: "FB", id: "facebook", rate: 35, color: "#1877F2", text: "1.2" },
    { name: "Tik", id: "tiktok", rate: 92, color: "#FE2C55", text: "5.1" },
    { name: "Thr", id: "threads", rate: 45, color: "#A855F7", text: "2.1" },
  ];

  const daysFactor = days === 7 ? 1.12 : days === 90 ? 0.88 : 1.0;

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
