/**
 * burdenConfig.js
 * ----------------
 * Configuration for the four agrifood-system burden layers from:
 *   Levers et al. (2025) "Different places, different challenges:
 *   mapping global variations in agrifood-system burdens"
 *   Environ. Res. Lett. 20, 2025. DOI: 10.1088/1748-9326/ae20ac
 *
 * Data: Zenodo DOI 10.5281/zenodo.15340862
 *   Two GeoTIFF outputs:
 *     - strict threshold map  (hotspot_strict.tif)
 *     - liberal threshold map (hotspot_liberal.tif)
 *
 * Raster pixel values encode burden hotspot counts (0–4).
 * Each burden dimension is also available as a separate binary layer.
 *
 * Tile architecture:
 *   - Breadbasket base layer: Mapbox vector tileset (same as ExposureApp)
 *   - Burden layers: Static PNG raster tiles in public/tiles/{tileDir}/{z}/{x}/{y}.png
 *   - Tile server (dev): http://localhost:8766
 */

// ── Breadbasket base layer ──────────────────────────────────────────────────
export const BREADBASKET = {
  id: "plotline.cndbsry2",
  layer: "prod_overview",
  label: "Food Breadbaskets",
  groupKey: "max_food_group",
  valueKey: "max_food_group_value",
};

// ── Food group colour palette ───────────────────────────────────────────────
export const FOOD_GROUP_COLORS = {
  grains:           { color: "#f5c542", label: "Grains" },
  meat_and_fish:    { color: "#ff6b6b", label: "Meat & Fish" },
  dairy_and_eggs:   { color: "#fff06a", label: "Dairy & Eggs" },
  fruits:           { color: "#7dde60", label: "Fruits" },
  vegetables:       { color: "#3dcc3d", label: "Vegetables" },
  oils_and_oilseed: { color: "#e89840", label: "Oils & Oilseeds" },
  pulses:           { color: "#c4855c", label: "Pulses" },
  starchy_roots:    { color: "#d49ce8", label: "Starchy Roots" },
  treenuts:         { color: "#5ea54a", label: "Tree Nuts" },
  other:            { color: "#aaaaaa", label: "Other" },
};

// ── Threshold variants ──────────────────────────────────────────────────────
// The Zenodo data provides two threshold variants for hotspot classification.
// "strict"  = more conservative thresholds (fewer hotspots)
// "liberal" = more permissive thresholds (more hotspots)
export const THRESHOLD_OPTIONS = [
  { key: "strict",  label: "Strict",  description: "Env ≥ 2 SD · Climate z ≥ 2 · Poverty ≤ $5.50 · Malnutrition ≥ 15%" },
  { key: "liberal", label: "Less strict", description: "Env ≥ 1 SD · Climate z ≥ 1 · Poverty ≤ $21.70 · Malnutrition ≥ 10%" },
];

// ── Co-occurrence colour scale ──────────────────────────────────────────────
// Pixel value = number of simultaneous burden hotspots (0–4)
// 0 = no burdens,  4 = all four burdens co-occur
export const COOCCURRENCE_COLORS = [
  { value: 0, color: "rgba(0,0,0,0)",    label: "No burden" },
  { value: 1, color: "#fee08b",          label: "1 burden" },
  { value: 2, color: "#fc8d59",          label: "2 burdens" },
  { value: 3, color: "#d73027",          label: "3 burdens" },
  { value: 4, color: "#7f0000",          label: "4 burdens (all)" },
];

// ── Individual burden layers ────────────────────────────────────────────────
// Each burden is also available as a binary hotspot raster (0 = no, 1 = hotspot).
// tileDir names match what the data pipeline will produce.
export const BURDEN_LAYERS = {
  env_footprint: {
    key: "env_footprint",
    label: "Environmental Footprint",
    shortLabel: "Env. Footprint",
    description:
      "Cumulative food-production pressure index (GHG emissions, freshwater use, habitat disturbance, nutrient pollution). Hotspot: ≥ 2 SD above the global mean of all pixels.",
    source: "Halpern et al. 2022 (via Levers et al. 2025)",
    icon: "🌿",
    color: "#2d9929",
    colorDark: "#145214",
    tileDir: {
      strict:  "env_footprint_strict",
      liberal: "env_footprint_liberal",
    },
    legendColors: [
      { value: 0, color: "#e5f5e0", label: "Not a hotspot" },
      { value: 1, color: "#2d9929", label: "Hotspot" },
    ],
  },
  weather_extremes: {
    key: "weather_extremes",
    label: "Weather Extremes",
    shortLabel: "Weather Extremes",
    description:
      "Pixel-level z-scores of drought (CDD), excess precipitation (RX5), heat (TX35), and frost (FD) relative to each pixel's own 1980–2009 climatology. Hotspot if any indicator ≥ 2 SD.",
    source: "ERA5 / Hersbach et al. 2020 (via Levers et al. 2025)",
    icon: "⛈️",
    color: "#1f78b4",
    colorDark: "#0a3d6b",
    tileDir: {
      strict:  "weather_extremes_strict",
      liberal: "weather_extremes_liberal",
    },
    legendColors: [
      { value: 0, color: "#deebf7", label: "Not a hotspot" },
      { value: 1, color: "#1f78b4", label: "Hotspot" },
    ],
  },
  income_poverty: {
    key: "income_poverty",
    label: "Income Poverty",
    shortLabel: "Poverty",
    description:
      "Subnational GNI per capita (PPP, 2011 US$). Hotspot: ≤ $5.50/day (strict) or ≤ $21.70/day (less strict), based on World Bank international poverty lines.",
    source: "Smits & Permanyer 2019 (via Levers et al. 2025)",
    icon: "💰",
    color: "#d94701",
    colorDark: "#7f2700",
    tileDir: {
      strict:  "income_poverty_strict",
      liberal: "income_poverty_liberal",
    },
    legendColors: [
      { value: 0, color: "#fee6ce", label: "Not a hotspot" },
      { value: 1, color: "#d94701", label: "Hotspot" },
    ],
  },
  malnutrition: {
    key: "malnutrition",
    label: "Malnutrition",
    shortLabel: "Malnutrition",
    description:
      "Double burden of malnutrition: combined prevalence of childhood wasting and overweight (under-5). Hotspot: ≥ 15% (strict) or ≥ 10% (less strict). LMICs only.",
    source: "Kinyoki et al. 2020 (via Levers et al. 2025)",
    icon: "🍽️",
    color: "#756bb1",
    colorDark: "#3d2b8b",
    tileDir: {
      strict:  "malnutrition_strict",
      liberal: "malnutrition_liberal",
    },
    legendColors: [
      { value: 0, color: "#efedf5", label: "Not a hotspot" },
      { value: 1, color: "#756bb1", label: "Hotspot" },
    ],
  },
};

// ── Co-occurrence layer ─────────────────────────────────────────────────────
// This is the main "hero" layer — shows 0–4 burden count per pixel.
export const COOCCURRENCE_LAYER = {
  key: "cooccurrence",
  label: "Burden Co-occurrence",
  description:
    "Number of simultaneous burden hotspots per location (0–4). A pixel is coloured by how many of the four burden dimensions are in hotspot status.",
  tileDir: {
    strict:  "cooccurrence_strict",
    liberal: "cooccurrence_liberal",
  },
};

// ── Layer descriptions for tooltips ────────────────────────────────────────
export const LAYER_DESCRIPTIONS = {
  breadbaskets: {
    text: "Global food production areas coloured by dominant food group (grains, fruits, meat, etc.).",
    source: "Plotline breadbasket dataset",
  },
  cooccurrence: {
    text: "Pixel colour shows how many of the four burden dimensions are simultaneously in hotspot status at that location.",
    source: "Levers et al. 2025, Environ. Res. Lett.",
  },
  env_footprint: {
    text: "Cumulative food-production pressure (GHG, freshwater, habitat, nutrients). Hotspot if ≥ 2 SD above the global mean.",
    source: "Halpern et al. 2022 via Levers et al. 2025",
  },
  weather_extremes: {
    text: "Pixel-level z-scores of drought, precipitation, heat, and frost vs. each pixel's own 1980–2009 climatology. Hotspot if any indicator ≥ 2 SD.",
    source: "ERA5 via Levers et al. 2025",
  },
  income_poverty: {
    text: "Subnational GNI per capita (PPP). Hotspot if ≤ $5.50/day (strict) or ≤ $21.70/day (less strict).",
    source: "Smits & Permanyer 2019 via Levers et al. 2025",
  },
  malnutrition: {
    text: "Combined prevalence of childhood wasting and overweight (under-5, LMICs only). Hotspot if ≥ 15% (strict) or ≥ 10% (less strict).",
    source: "Kinyoki et al. 2020 via Levers et al. 2025",
  },
};

// ── Tile URL helpers ────────────────────────────────────────────────────────
// In dev:  Use tile server on port 8766 (python tile_server.py)
// In prod: Tiles served from static host alongside the app
const IS_PROD = process.env.NODE_ENV === "production";
export const TILE_BASE = IS_PROD
  ? "https://kushankbajaj.com/burdens-tiles"
  : "http://localhost:8766";

export function tileUrl(tileDir) {
  return `${TILE_BASE}/${tileDir}/{z}/{x}/{y}.png`;
}

// All raster layer keys (co-occurrence + 4 individual burdens)
export const ALL_RASTER_KEYS = [
  "cooccurrence",
  ...Object.keys(BURDEN_LAYERS),
];
