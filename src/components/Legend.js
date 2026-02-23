/**
 * Legend.js — Dynamic legend for active layers
 *
 * Shows:
 *   - Co-occurrence scale (0–4 burdens) when in co-occurrence mode
 *   - Individual burden swatches when in individual mode
 *   - Breadbasket food-group legend (collapsible)
 */

import { useState } from "react";
import {
  BURDEN_LAYERS,
  COOCCURRENCE_COLORS,
  FOOD_GROUP_COLORS,
} from "../layers/burdenConfig";

function CooccurrenceLegend() {
  return (
    <div className="legend-block">
      <div className="legend-title">Simultaneous Burdens</div>
      <div className="legend-cooc-scale">
        {COOCCURRENCE_COLORS.map(({ value, color, label }) => (
          <div key={value} className="legend-cooc-row">
            <span
              className="legend-cooc-swatch"
              style={{
                background: value === 0 ? "rgba(60,60,80,0.4)" : color,
                border: value === 0 ? "1px dashed #555" : "none",
              }}
            />
            <span className="legend-cooc-label">{label}</span>
          </div>
        ))}
      </div>
      <div className="legend-note">
        Per 5 arc-minute grid cell (~9 km). Pixel intensity reflects count of concurrent burden hotspots.
      </div>
    </div>
  );
}

function BurdenSwatchLegend({ activeBurdens }) {
  if (!activeBurdens.length) return null;
  return (
    <div className="legend-block">
      <div className="legend-title">Active Burdens</div>
      {activeBurdens.map((key) => {
        const cfg = BURDEN_LAYERS[key];
        if (!cfg) return null;
        return (
          <div key={key} className="legend-burden-row">
            <span className="legend-burden-swatch" style={{ background: cfg.color }} />
            <span className="legend-burden-name">
              {cfg.icon} {cfg.shortLabel}
            </span>
            <span className="legend-burden-desc">hotspot</span>
          </div>
        );
      })}
      <div className="legend-note">
        Binary hotspot classification (≥ threshold).
      </div>
    </div>
  );
}

function BreadbasketLegend({ visible }) {
  const [expanded, setExpanded] = useState(false);
  if (!visible) return null;
  return (
    <div className="legend-block legend-block-bb">
      <button
        className="legend-bb-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        Food Groups {expanded ? "▲" : "▼"}
      </button>
      {expanded && (
        <div className="legend-bb-grid">
          {Object.entries(FOOD_GROUP_COLORS).map(([key, { color, label }]) => (
            <div key={key} className="legend-bb-row">
              <span className="legend-bb-dot" style={{ background: color }} />
              <span className="legend-bb-label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Legend({ activeLayers, viewMode }) {
  const bbActive = activeLayers.includes("breadbaskets");
  const coocActive = activeLayers.includes("cooccurrence");
  const activeBurdens = Object.keys(BURDEN_LAYERS).filter((k) =>
    activeLayers.includes(k)
  );

  const hasContent =
    (viewMode === "cooccurrence" && coocActive) ||
    (viewMode === "individual" && activeBurdens.length > 0) ||
    bbActive;

  if (!hasContent) return null;

  return (
    <div className="legend-panel">
      {viewMode === "cooccurrence" && coocActive && <CooccurrenceLegend />}
      {viewMode === "individual" && activeBurdens.length > 0 && (
        <BurdenSwatchLegend activeBurdens={activeBurdens} />
      )}
      <BreadbasketLegend visible={bbActive} />
    </div>
  );
}
