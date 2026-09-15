import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getCaseSlugs, getMissionSlugs, getTrackSlugs } from "@/lib/store";

/**
 * The sitemap is generated from the same store the pages read, so a new case or
 * track cannot be added and then forgotten here.
 */
/**
 * Cases can change in the database without a deploy (a report deleted, a status
 * edited), so this page also rebuilds itself every five minutes. A new report
 * still appears at once, through revalidatePath in the Server Action.
 */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseSlugs, missionSlugs, trackSlugs] = await Promise.all([
    getCaseSlugs(),
    getMissionSlugs(),
    getTrackSlugs(),
  ]);

  const lastModified = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/report", priority: 0.9, changeFrequency: "monthly" },
    { path: "/map", priority: 0.9, changeFrequency: "daily" },
    { path: "/cases", priority: 0.8, changeFrequency: "daily" },
    { path: "/track", priority: 0.8, changeFrequency: "daily" },
    { path: "/learn", priority: 0.8, changeFrequency: "monthly" },
    { path: "/learn/earth-kids", priority: 0.7, changeFrequency: "monthly" },
    { path: "/act", priority: 0.8, changeFrequency: "weekly" },
    { path: "/connect", priority: 0.7, changeFrequency: "monthly" },
    { path: "/score", priority: 0.6, changeFrequency: "weekly" },
    { path: "/ambassadors", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/get-involved", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/accessibility", priority: 0.3, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE.url}${route.path === "/" ? "" : route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...caseSlugs.map((slug) => ({
      url: `${SITE.url}/cases/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...missionSlugs.map((slug) => ({
      url: `${SITE.url}/act/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...trackSlugs.map((slug) => ({
      url: `${SITE.url}/learn/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
