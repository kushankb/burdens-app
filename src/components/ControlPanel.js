/**
 * ControlPanel.js — Left sidebar for the Agrifood Burdens Explorer
 *
 * Sections:
 *   1. Base Layer (breadbaskets)
 *   2. View Mode: Co-occurrence (hero) vs Individual Burdens
 *   3. Threshold selector (strict / liberal)
 *   4. Individual burden toggles + opacity sliders
 *   5. Context stats panel
 */

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  BURDEN_LAYERS,
  THRESHOLD_OPTIONS,
  LAYER_DESCRIPTIONS,
} from "../layers/burdenConfig";

// ── Tooltip ─────────────────────────────────────────────────────────────────
function InfoTooltip({ info, btnRef, visible }) {
  if (!visible || !info) return null;
  const rect = btnRef.current?.getBoundingClientRect();
  if (!rect) return null;
  return createPortal(
    <div
      className="layer-tooltip"
      style={{
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
        transform: "translateY(-50%)",
      }}
    >
      {info.text}
      {info.source && <span className="tooltip-source">{info.source}</span>}
    </div>,
    document.body
  );
}

// ── Opacity Slider ───────────────────────────────────────────────────────────
function OpacitySlider({ layerKey, value, color, onChange }) {
  return (
    <div className="opacity-slider-row">
      <span className="opacity-label">Opacity</span>
      <input
        type="range"
        className="opacity-slider"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(layerKey, parseFloat(e.target.value))}
        style={{ "--slider-color": color }}
      />
      <span className="opacity-value">{Math.round(value * 100)}%</span>
    </div>
  );
}

// ── Generic Layer Button ─────────────────────────────────────────────────────
function LayerButton({ layerKey, label, sublabel, color, icon, isActive, onToggle }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const btnRef = useRef(null);
  const info = LAYER_DESCRIPTIONS[layerKey];

  const handleMouseEnter = useCallback(() => setShowTooltip(true), []);
  const handleMouseLeave = useCallback(() => setShowTooltip(false), []);

  return (
    <div className="layer-btn-wrapper">
      <button
        ref={btnRef}
        className={`layer-btn ${isActive ? "active" : ""}`}
        style={{ "--btn-color": color }}
        onClick={() => onToggle(layerKey)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {icon && <span className="layer-icon">{icon}</span>}
        <span className="layer-dot" />
        <span className="layer-btn-text">
          <span className="layer-btn-label">{label}</span>
          {sublabel && <span className="layer-btn-unit">{sublabel}</span>}
        </span>
      </button>
      <InfoTooltip info={info} btnRef={btnRef} visible={showTooltip} />
    </div>
  );
}

// ── Main ControlPanel ────────────────────────────────────────────────────────
export default function ControlPanel({
  activeLayers,
  layerOpacity,
  selectedThreshold,
  onToggle,
  onOpacityChange,
  onThresholdChange,
  viewMode,
  onViewModeChange,
}) {
  const bbActive   = activeLayers.includes("breadbaskets");
  const coocActive = activeLayers.includes("cooccurrence");
  const nActive    = Object.keys(BURDEN_LAYERS).filter(k => activeLayers.includes(k)).length;

  return (
    <div className="control-panel">

      {/* ── Header ── */}
      <div className="panel-header">
        <div className="panel-logo">🌍</div>
        <div>
          <div className="panel-title">Burden Explorer</div>
          <div className="panel-subtitle">Agrifood System Pressures</div>
        </div>
      </div>

      {/* ── Base Layer ── */}
      <div className="panel-section">
        <div className="panel-section-label">Base Layer</div>
        <LayerButton
          layerKey="breadbaskets"
          label="Food Breadbaskets"
          sublabel="by food group"
          color="#e6a532"
          isActive={bbActive}
          onToggle={onToggle}
        />
        {bbActive && (
          <OpacitySlider
            layerKey="breadbaskets"
            value={layerOpacity.breadbaskets}
            color="#e6a532"
            onChange={onOpacityChange}
          />
        )}
      </div>

      <div className="panel-divider" />

      {/* ── View Mode Toggle ── */}
      <div className="panel-section">
        <div className="panel-section-label">View Mode</div>
        <div className="view-mode-tabs">
          <button
            className={`view-tab ${viewMode === "cooccurrence" ? "active" : ""}`}
            onClick={() => onViewModeChange("cooccurrence")}
          >
            Co-occurrence
          </button>
          <button
            className={`view-tab ${viewMode === "individual" ? "active" : ""}`}
            onClick={() => onViewModeChange("individual")}
          >
            Individual
          </button>
        </div>
        <div className="view-mode-desc">
          {viewMode === "cooccurrence"
            ? "Shows how many burden hotspots overlap at each location (0–4)."
            : "Toggle individual burden dimensions to compare patterns."}
        </div>
      </div>

      {/* ── Co-occurrence mode ── */}
      {viewMode === "cooccurrence" && (
        <div className="panel-section">
          <LayerButton
            layerKey="cooccurrence"
            label="Burden Co-occurrence"
            sublabel="0–4 simultaneous burdens"
            color="#d73027"
            icon="🔥"
            isActive={coocActive}
            onToggle={onToggle}
          />
          {coocActive && (
            <OpacitySlider
              layerKey="cooccurrence"
              value={layerOpacity.cooccurrence}
              color="#d73027"
              onChange={onOpacityChange}
            />
          )}
        </div>
      )}

      {/* ── Individual burdens mode ── */}
      {viewMode === "individual" && (
        <div className="panel-section">
          <div className="panel-section-label">
            Burden Layers
            {nActive > 0 && (
              <span className="active-count">{nActive} active</span>
            )}
          </div>
          {Object.values(BURDEN_LAYERS).map((cfg) => {
            const isActive = activeLayers.includes(cfg.key);
            return (
              <div key={cfg.key} className="burden-row">
                <LayerButton
                  layerKey={cfg.key}
                  label={cfg.label}
                  sublabel={cfg.description.substring(0, 55) + "…"}
                  color={cfg.color}
                  icon={cfg.icon}
                  isActive={isActive}
                  onToggle={onToggle}
                />
                {isActive && (
                  <OpacitySlider
                    layerKey={cfg.key}
                    value={layerOpacity[cfg.key] ?? 0.7}
                    color={cfg.color}
                    onChange={onOpacityChange}
                  />
                )}
              </div>
            );
          })}
          {nActive >= 2 && (
            <div className="multi-burden-hint">
              Tip: Overlap between active layers reveals co-occurring burdens.
            </div>
          )}
        </div>
      )}

      <div className="panel-divider" />

      {/* ── Threshold Selector ── */}
      <div className="panel-section">
        <div className="panel-section-label">Hotspot Threshold</div>
        <div className="threshold-selector">
          {THRESHOLD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`thresh-btn ${selectedThreshold === opt.key ? "active" : ""}`}
              onClick={() => onThresholdChange(opt.key)}
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="thresh-desc">
          {THRESHOLD_OPTIONS.find((o) => o.key === selectedThreshold)?.description}
        </div>
      </div>

      <div className="panel-divider" />

      {/* ── Citation ── */}
      <div className="panel-section panel-citation">
        <div className="citation-label">Data Source</div>
        <div className="citation-text">
          Levers et al. (2025). "Different places, different challenges: mapping
          global variations in agrifood-system burdens."{" "}
          <em>Environ. Res. Lett.</em> 20.
        </div>
        <div className="citation-doi">
          DOI: 10.1088/1748-9326/ae20ac
        </div>
      </div>

    </div>
  );
}
