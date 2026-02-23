/**
 * Map.js — Core flat-map component for the Agrifood Burdens Explorer
 *
 * Architecture:
 *   BASE:        Breadbasket dots (Mapbox vector tileset)
 *   HERO LAYER:  Co-occurrence raster (0–4 burdens per pixel)
 *   INDIVIDUAL:  4 binary burden rasters (env footprint, weather, poverty, malnutrition)
 *   PROJECTION:  Flat Mercator (not globe)
 *   THRESHOLD:   "strict" or "liberal" — switches between tile directories
 */

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  BREADBASKET,
  BURDEN_LAYERS,
  COOCCURRENCE_LAYER,
  FOOD_GROUP_COLORS,
  tileUrl,
} from "../layers/burdenConfig";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// Breadbasket dot size by zoom
const BREADBASKET_SIZE = [
  "interpolate", ["linear"], ["zoom"],
  1, 0.4,
  2, 0.6,
  3, 0.9,
  4, 1.3,
  5, 1.8,
  6, 2.5,
  7, 3.2,
  8, 4.0,
];

function buildFoodGroupColorExpr() {
  const expr = ["match", ["get", BREADBASKET.groupKey]];
  Object.entries(FOOD_GROUP_COLORS).forEach(([key, { color }]) => {
    expr.push(key, color);
  });
  expr.push("#444444");
  return expr;
}

// ── Add all map sources ──────────────────────────────────────────────────────
function addAllSources(m) {
  // Breadbasket vector source
  m.addSource("breadbaskets", {
    type: "vector",
    url: `mapbox://${BREADBASKET.id}`,
  });

  // Co-occurrence layers (strict + liberal)
  for (const threshKey of ["strict", "liberal"]) {
    const dir = COOCCURRENCE_LAYER.tileDir[threshKey];
    m.addSource(`raster-cooccurrence-${threshKey}`, {
      type: "raster",
      tiles: [tileUrl(dir)],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 7,
    });
  }

  // Individual burden layers (strict + liberal for each)
  for (const [key, cfg] of Object.entries(BURDEN_LAYERS)) {
    for (const threshKey of ["strict", "liberal"]) {
      const dir = cfg.tileDir[threshKey];
      m.addSource(`raster-${key}-${threshKey}`, {
        type: "raster",
        tiles: [tileUrl(dir)],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 7,
      });
    }
  }
}

// ── Add all map layers ───────────────────────────────────────────────────────
function addAllLayers(m) {
  // Breadbasket dots
  m.addLayer({
    id: "breadbaskets-layer",
    type: "circle",
    source: "breadbaskets",
    "source-layer": BREADBASKET.layer,
    layout: { visibility: "visible" },
    paint: {
      "circle-radius": BREADBASKET_SIZE,
      "circle-color": buildFoodGroupColorExpr(),
      "circle-opacity": 0.9,
      "circle-stroke-width": [
        "interpolate", ["linear"], ["zoom"],
        1, 0.5,
        4, 0.3,
        8, 0.2,
      ],
      "circle-stroke-color": "rgba(255,255,255,0.5)",
      "circle-stroke-opacity": 0.5,
    },
  });

  // Co-occurrence rasters
  for (const threshKey of ["strict", "liberal"]) {
    m.addLayer({
      id: `raster-cooccurrence-${threshKey}`,
      type: "raster",
      source: `raster-cooccurrence-${threshKey}`,
      layout: { visibility: threshKey === "strict" ? "visible" : "none" },
      paint: {
        "raster-opacity": 0.75,
        "raster-fade-duration": 200,
      },
    });
  }

  // Individual burden rasters (hidden by default)
  for (const key of Object.keys(BURDEN_LAYERS)) {
    for (const threshKey of ["strict", "liberal"]) {
      m.addLayer({
        id: `raster-${key}-${threshKey}`,
        type: "raster",
        source: `raster-${key}-${threshKey}`,
        layout: { visibility: "none" },
        paint: {
          "raster-opacity": 0.7,
          "raster-fade-duration": 200,
        },
      });
    }
  }
}

// ── Hover popup setup ────────────────────────────────────────────────────────
function setupHoverEvents(m, popupRef, stateRef) {
  m.on("mouseenter", "breadbaskets-layer", (e) => {
    if (!stateRef.current.activeLayers.includes("breadbaskets")) return;
    m.getCanvas().style.cursor = "crosshair";
    if (!e.features?.length) return;
    const props = e.features[0].properties;
    const fg = FOOD_GROUP_COLORS[props[BREADBASKET.groupKey]] || {
      label: props[BREADBASKET.groupKey],
      color: "#888",
    };
    popupRef.current
      .setLngLat(e.lngLat)
      .setHTML(
        `<div class="popup-title">
          <span class="popup-swatch" style="background:${fg.color}"></span>
          ${fg.label}
        </div>
        <div class="popup-row">
          <span class="popup-key">Production</span>
          <span class="popup-value">${Number(props[BREADBASKET.valueKey] || 0).toLocaleString()}</span>
        </div>`
      )
      .addTo(m);
  });

  m.on("mouseleave", "breadbaskets-layer", () => {
    m.getCanvas().style.cursor = "";
    popupRef.current.remove();
  });
}

// =============================================================================
export default function Map({
  activeLayers,
  layerOpacity,
  selectedThreshold,
  onMapReady,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const readyRef = useRef(false);
  const stateRef = useRef({ activeLayers, selectedThreshold });

  useEffect(() => {
    stateRef.current = { activeLayers, selectedThreshold };
  }, [activeLayers, selectedThreshold]);

  // Init map
  useEffect(() => {
    if (mapRef.current) return;

    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "320px",
    });

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20, 15],
      zoom: 2,
      minZoom: 1,
      maxZoom: 9,
      projection: "mercator",   // ← flat map
      antialias: true,
    });

    mapRef.current = m;

    m.on("load", () => {
      // Subtle basemap adjustments for data contrast
      try {
        const style = m.getStyle();
        if (style?.layers) {
          for (const layer of style.layers) {
            if (layer.id === "land" && layer.type === "background") {
              m.setPaintProperty("land", "background-color", "#1a1f2e");
            }
            if (layer.id === "water" && layer.type === "fill") {
              m.setPaintProperty("water", "fill-color", "#111827");
            }
            if (
              (layer.id.includes("landuse") || layer.id.includes("landcover")) &&
              layer.type === "fill"
            ) {
              m.setPaintProperty(layer.id, "fill-opacity", 0.2);
            }
            if (layer.id.includes("admin") && layer.type === "line") {
              m.setPaintProperty(layer.id, "line-opacity", 0.3);
              m.setPaintProperty(layer.id, "line-color", "#4a5568");
            }
          }
        }
      } catch (e) {
        console.warn("Basemap tweak error:", e);
      }

      addAllSources(m);
      addAllLayers(m);
      setupHoverEvents(m, popupRef, stateRef);
      readyRef.current = true;
      if (onMapReady) onMapReady(m);
    });

    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    m.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    return () => {
      readyRef.current = false;
      m.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line

  // Sync visibility, opacity, threshold
  const syncLayers = useCallback(() => {
    const m = mapRef.current;
    if (!m || !readyRef.current) return;

    const thresh = selectedThreshold || "strict";
    const bbActive = activeLayers.includes("breadbaskets");

    // Breadbasket
    if (m.getLayer("breadbaskets-layer")) {
      m.setLayoutProperty("breadbaskets-layer", "visibility", bbActive ? "visible" : "none");
      if (bbActive) {
        m.setPaintProperty("breadbaskets-layer", "circle-opacity", layerOpacity.breadbaskets ?? 0.9);
        m.setPaintProperty("breadbaskets-layer", "circle-stroke-opacity", (layerOpacity.breadbaskets ?? 0.9) * 0.5);
      }
    }

    // Co-occurrence — show only the active threshold
    const coocActive = activeLayers.includes("cooccurrence");
    for (const t of ["strict", "liberal"]) {
      const lid = `raster-cooccurrence-${t}`;
      if (!m.getLayer(lid)) continue;
      const show = coocActive && t === thresh;
      m.setLayoutProperty(lid, "visibility", show ? "visible" : "none");
      if (show) {
        m.setPaintProperty(lid, "raster-opacity", layerOpacity.cooccurrence ?? 0.75);
      }
    }

    // Individual burden layers
    for (const key of Object.keys(BURDEN_LAYERS)) {
      const isActive = activeLayers.includes(key);
      for (const t of ["strict", "liberal"]) {
        const lid = `raster-${key}-${t}`;
        if (!m.getLayer(lid)) continue;
        const show = isActive && t === thresh;
        m.setLayoutProperty(lid, "visibility", show ? "visible" : "none");
        if (show) {
          m.setPaintProperty(lid, "raster-opacity", layerOpacity[key] ?? 0.7);
        }
      }
    }
  }, [activeLayers, layerOpacity, selectedThreshold]);

  useEffect(() => {
    syncLayers();
  }, [syncLayers]);

  return <div ref={mapContainer} id="map" />;
}
