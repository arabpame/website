/**
 * The status and category vocabularies, with their labels, meanings and classes.
 *
 * These are the two systems the client supplied inside the concept document, and
 * they drive most of the interface. Everything about a status or a category is
 * defined once here so a chip, a pin, a rail segment and a filter button can never
 * disagree with each other.
 *
 * Note the two-tone rule from DESIGN_DIRECTION.md: `dotClass` is the saturated tone
 * for graphics, `textClass` is the darkened tone for labels on a light ground.
 * Colour is never the only carrier of meaning, so every one also has a label.
 */

import {
  CASE_CATEGORIES,
  CASE_STATUSES,
  type CaseCategory,
  type CaseCategoryMeta,
  type CaseStatus,
  type CaseStatusMeta,
  type Urgency,
} from "@/lib/types";

export const STATUS_META: Record<CaseStatus, CaseStatusMeta> = {
  reported: {
    key: "reported",
    label: "Reported",
    meaning: "Someone has filed this concern. Nothing has been checked yet.",
    step: 1,
    dotClass: "bg-status-reported",
    textClass: "text-status-reported-text",
    chipClass: "bg-status-reported/10 text-status-reported-text ring-status-reported/25",
  },
  verifying: {
    key: "verifying",
    label: "Under verification",
    meaning: "The community and the EARTHLINK team are checking that it is real and accurate.",
    step: 2,
    dotClass: "bg-status-verifying",
    textClass: "text-status-verifying-text",
    chipClass: "bg-status-verifying/10 text-status-verifying-text ring-status-verifying/25",
  },
  referred: {
    key: "referred",
    label: "Referred to authorities",
    meaning: "The verified case and its evidence have been sent to the office that can act on it.",
    step: 3,
    dotClass: "bg-status-referred",
    textClass: "text-status-referred-text",
    chipClass: "bg-status-referred/10 text-status-referred-text ring-status-referred/25",
  },
  progress: {
    key: "progress",
    label: "Action in progress",
    meaning: "Work has started. A mission, an inspection, an order or a clean-up is under way.",
    step: 4,
    dotClass: "bg-status-progress",
    textClass: "text-status-progress-text",
    chipClass: "bg-status-progress/10 text-status-progress-text ring-status-progress/25",
  },
  resolved: {
    key: "resolved",
    label: "Resolved",
    meaning: "The problem was fixed, and the result was measured and recorded.",
    step: 5,
    dotClass: "bg-status-resolved",
    textClass: "text-status-resolved-text",
    chipClass: "bg-status-resolved/10 text-status-resolved-text ring-status-resolved/25",
  },
  monitoring: {
    key: "monitoring",
    label: "Monitoring",
    meaning: "Resolved, and now being watched so it does not simply happen again.",
    step: 6,
    dotClass: "bg-status-monitoring",
    textClass: "text-status-monitoring-text",
    chipClass: "bg-status-monitoring/10 text-status-monitoring-text ring-status-monitoring/25",
  },
};

export const STATUS_ORDER = CASE_STATUSES;

export const CATEGORY_META: Record<CaseCategory, CaseCategoryMeta> = {
  water: {
    key: "water",
    label: "Water and ocean",
    covers: "Polluted rivers, coastal pollution, water contamination, blocked or flood-prone waterways.",
    dotClass: "bg-cat-water",
    textClass: "text-cat-water-text",
    chipClass: "bg-cat-water/10 text-cat-water-text ring-cat-water/25",
    hex: "#0EA5E9",
  },
  forest: {
    key: "forest",
    label: "Forest",
    covers: "Illegal logging, forest clearing, damaged watersheds and loss of tree cover.",
    dotClass: "bg-cat-forest",
    textClass: "text-cat-forest-text",
    chipClass: "bg-cat-forest/10 text-cat-forest-text ring-cat-forest/25",
    hex: "#168740",
  },
  waste: {
    key: "waste",
    label: "Waste",
    covers: "Illegal dumping, uncollected garbage, failed segregation and open burning of waste.",
    dotClass: "bg-cat-waste",
    textClass: "text-cat-waste-text",
    chipClass: "bg-cat-waste/10 text-cat-waste-text ring-cat-waste/25",
    hex: "#8C52EF",
  },
  air: {
    key: "air",
    label: "Air",
    covers: "Smoke, open burning, industrial emissions and persistent air quality complaints.",
    dotClass: "bg-cat-air",
    textClass: "text-cat-air-text",
    chipClass: "bg-cat-air/10 text-cat-air-text ring-cat-air/25",
    hex: "#67778F",
  },
  biodiversity: {
    key: "biodiversity",
    label: "Biodiversity",
    covers: "Damaged mangroves and reefs, wildlife harm, and threats to protected species.",
    dotClass: "bg-cat-biodiversity",
    textClass: "text-cat-biodiversity-text",
    chipClass: "bg-cat-biodiversity/10 text-cat-biodiversity-text ring-cat-biodiversity/25",
    hex: "#0D9488",
  },
  land: {
    key: "land",
    label: "Land",
    covers: "Quarrying, erosion, soil contamination and neglected or misused public land.",
    dotClass: "bg-cat-land",
    textClass: "text-cat-land-text",
    chipClass: "bg-cat-land/10 text-cat-land-text ring-cat-land/25",
    hex: "#A86607",
  },
  hazard: {
    key: "hazard",
    label: "Environmental hazard",
    covers: "Anything posing an immediate danger to people: chemical spills, unsafe structures, contamination.",
    dotClass: "bg-cat-hazard",
    textClass: "text-cat-hazard-text",
    chipClass: "bg-cat-hazard/10 text-cat-hazard-text ring-cat-hazard/25",
    hex: "#DE3030",
  },
};

export const CATEGORY_ORDER = CASE_CATEGORIES;

export const URGENCY_META: Record<Urgency, { label: string; note: string; ringClass: string }> = {
  low: {
    label: "Low",
    note: "A concern worth recording. No immediate risk.",
    ringClass: "ring-brand-line text-brand-ink/70",
  },
  moderate: {
    label: "Moderate",
    note: "Getting worse if left alone. Should be looked at within weeks.",
    ringClass: "ring-status-referred/40 text-status-referred-text",
  },
  high: {
    label: "High",
    note: "Active damage happening now. Needs attention within days.",
    ringClass: "ring-status-verifying/50 text-status-verifying-text",
  },
  critical: {
    label: "Critical",
    note: "Danger to people or irreversible damage. Escalated immediately.",
    ringClass: "ring-status-reported/50 text-status-reported-text",
  },
};

export const MISSION_TYPE_LABELS: Record<string, string> = {
  cleanup: "Coastal or river cleanup",
  planting: "Tree planting",
  mangrove: "Mangrove rehabilitation",
  recycling: "Recycling drive",
  education: "Environmental education",
  gardening: "Community gardening",
  wildlife: "Wildlife protection",
  segregation: "Waste segregation programme",
};

export const PARTNER_TYPE_LABELS: Record<string, string> = {
  lgu: "Local government unit",
  "national-agency": "National agency",
  barangay: "Barangay",
  school: "School",
  ngo: "Environmental organisation",
  youth: "Youth organisation",
  company: "Private company",
  expert: "Expert",
};
