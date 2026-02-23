/**
 * InfoPanel.js — Collapsible story/context panel
 *
 * Shows key findings from Levers et al. 2025 to help users
 * understand what they're looking at.
 */

import { useState } from "react";

const FINDINGS = [
  {
    icon: "👥",
    stat: "~5 billion",
    text: "people live in regions with at least one burden hotspot",
  },
  {
    icon: "🔴",
    stat: "1.8–1.9 billion",
    text: "people live where multiple burdens overlap simultaneously",
  },
  {
    icon: "🌾",
    stat: "470M ha",
    text: "agricultural area (10% globally) experiences multiple concurrent burdens",
  },
  {
    icon: "🏡",
    stat: "Small farms",
    text: "and Indigenous lands are disproportionately in multi-burden hotspot areas",
  },
];

const BURDENS_INFO = [
  {
    icon: "🌿",
    name: "Environmental Footprint",
    detail: "Cumulative food-production pressure: GHG emissions, freshwater use, habitat disturbance, nutrient pollution",
    threshold: "Strict: ≥ 2 SD above global mean · Less strict: ≥ 1 SD",
    source: "Halpern et al. 2022",
  },
  {
    icon: "⛈️",
    name: "Weather Extremes",
    detail: "Pixel-level z-scores of drought (CDD), precipitation (RX5), heat (TX35), frost (FD) vs. each pixel's own 1980–2009 climatology",
    threshold: "Strict: any indicator ≥ 2 SD · Less strict: ≥ 1 SD",
    source: "ERA5 / Hersbach et al. 2020",
  },
  {
    icon: "💰",
    name: "Income Poverty",
    detail: "Subnational GNI per capita (PPP, 2011 US$)",
    threshold: "Strict: ≤ $5.50/day · Less strict: ≤ $21.70/day",
    source: "Smits & Permanyer 2019",
  },
  {
    icon: "🍽️",
    name: "Malnutrition",
    detail: "Double burden: combined prevalence of childhood wasting and overweight (under-5, LMICs only)",
    threshold: "Strict: ≥ 15% · Less strict: ≥ 10%",
    source: "Kinyoki et al. 2020",
  },
];

export default function InfoPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`info-panel ${open ? "open" : "closed"}`}>
      <button className="info-toggle" onClick={() => setOpen(!open)}>
        {open ? "✕ Close" : "ℹ About this map"}
      </button>

      {open && (
        <div className="info-content">
          <div className="info-section-title">Key Findings</div>
          <div className="findings-grid">
            {FINDINGS.map((f, i) => (
              <div key={i} className="finding-card">
                <span className="finding-icon">{f.icon}</span>
                <span className="finding-stat">{f.stat}</span>
                <span className="finding-text">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="info-section-title" style={{ marginTop: "1rem" }}>
            Burden Dimensions &amp; Thresholds
          </div>
          <div className="burdens-table">
            {BURDENS_INFO.map((b, i) => (
              <div key={i} className="burden-info-row">
                <span className="bi-icon">{b.icon}</span>
                <div className="bi-text">
                  <div className="bi-name">{b.name}</div>
                  <div className="bi-detail">{b.detail}</div>
                  <div className="bi-threshold">{b.threshold}</div>
                  {b.source && (
                    <div className="bi-detail" style={{ fontStyle: "italic", marginTop: 2 }}>
                      {b.source}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="info-cite">
            Levers et al. (2025). <em>Environ. Res. Lett.</em> 20.{" "}
            DOI: 10.1088/1748-9326/ae20ac &bull; Data: Zenodo 10.5281/zenodo.15340862
          </div>
        </div>
      )}
    </div>
  );
}
