/**
 * App.js — Agrifood Burdens Explorer
 *
 * A flat-map interactive explorer for understanding where agrifood-system
 * burdens (environmental footprint, weather extremes, income poverty,
 * malnutrition) co-occur globally.
 *
 * Based on: Levers et al. (2025) "Different places, different challenges:
 * mapping global variations in agrifood-system burdens."
 * Environ. Res. Lett. 20. DOI: 10.1088/1748-9326/ae20ac
 */

import { useState, useCallback } from "react";
import Map from "./components/Map";
import ControlPanel from "./components/ControlPanel";
import Legend from "./components/Legend";
import InfoPanel from "./components/InfoPanel";
import { BURDEN_LAYERS } from "./layers/burdenConfig";
import "./styles/global.css";

// Mapbox token injection (same pattern as ExposureApp)
window.__MAPBOX_TOKEN__ = process.env.REACT_APP_MAPBOX_TOKEN;

// ── Default state ────────────────────────────────────────────────────────────
const DEFAULT_ACTIVE_LAYERS = ["breadbaskets", "cooccurrence"];
const DEFAULT_OPACITY = {
  breadbaskets: 0.85,
  cooccurrence: 0.75,
  ...Object.fromEntries(Object.keys(BURDEN_LAYERS).map((k) => [k, 0.70])),
};

export default function App() {
  const [activeLayers, setActiveLayers] = useState(DEFAULT_ACTIVE_LAYERS);
  const [layerOpacity, setLayerOpacity] = useState(DEFAULT_OPACITY);
  const [selectedThreshold, setSelectedThreshold] = useState("strict");
  const [viewMode, setViewMode] = useState("cooccurrence");

  // Toggle a layer on/off
  const handleToggle = useCallback((key) => {
    setActiveLayers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  // Change opacity for a specific layer
  const handleOpacityChange = useCallback((key, value) => {
    setLayerOpacity((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Switch threshold (strict / liberal)
  const handleThresholdChange = useCallback((thresh) => {
    setSelectedThreshold(thresh);
  }, []);

  // Switch view mode: co-occurrence vs individual burdens
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);

    if (mode === "cooccurrence") {
      // Activate co-occurrence, deactivate individual burdens
      setActiveLayers((prev) => {
        const cleaned = prev.filter((k) => !Object.keys(BURDEN_LAYERS).includes(k));
        return cleaned.includes("cooccurrence")
          ? cleaned
          : [...cleaned, "cooccurrence"];
      });
    } else {
      // Deactivate co-occurrence, keep others
      setActiveLayers((prev) => prev.filter((k) => k !== "cooccurrence"));
    }
  }, []);

  return (
    <div className="app-root">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <img
            src="https://ires.ubc.ca/files/2021/02/logo_square.png"
            alt="UBC IRES"
            className="header-logo"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="header-titles">
            <h1 className="header-title">Agrifood Burden Explorer</h1>
            <p className="header-sub">
              Mapping co-occurring pressures on global food security
            </p>
          </div>
        </div>
      </header>

      {/* Map + UI layout */}
      <div className="app-body">
        {/* Sidebar */}
        <ControlPanel
          activeLayers={activeLayers}
          layerOpacity={layerOpacity}
          selectedThreshold={selectedThreshold}
          viewMode={viewMode}
          onToggle={handleToggle}
          onOpacityChange={handleOpacityChange}
          onThresholdChange={handleThresholdChange}
          onViewModeChange={handleViewModeChange}
        />

        {/* Map canvas */}
        <div className="map-container">
          <Map
            activeLayers={activeLayers}
            layerOpacity={layerOpacity}
            selectedThreshold={selectedThreshold}
          />

          {/* Legend overlay */}
          <Legend
            activeLayers={activeLayers}
            viewMode={viewMode}
          />

          {/* Info panel overlay */}
          <InfoPanel />
        </div>
      </div>
    </div>
  );
}
