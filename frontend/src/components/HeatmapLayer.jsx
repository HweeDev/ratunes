import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function HeatmapLayer({ points = [], options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    let heatLayerInstance = null;
    let circleGroupInstance = null;

    // Check if L.heatLayer exists (from leaflet.heat)
    if (typeof L.heatLayer === 'function') {
      try {
        heatLayerInstance = L.heatLayer(points, {
          radius: options.radius || 35,
          blur: options.blur || 20,
          maxZoom: options.maxZoom || 15,
          gradient: options.gradient || {
            0.2: '#3b82f6', // blue
            0.5: '#10b981', // green
            0.7: '#f59e0b', // yellow/amber
            0.9: '#ef4444', // red
          },
        }).addTo(map);
      } catch (err) {
        console.warn('L.heatLayer notice, using density circles fallback:', err.message);
      }
    }

    // Fallback if L.heatLayer not loaded or active: render glowing density circle overlays
    if (!heatLayerInstance) {
      circleGroupInstance = L.layerGroup();
      points.forEach(([lat, lng, intensity]) => {
        const radius = 25000 + (intensity || 0.5) * 45000; // in meters
        const color = intensity > 0.7 ? '#ef4444' : intensity > 0.5 ? '#f59e0b' : '#10b981';
        L.circle([lat, lng], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 1,
        }).addTo(circleGroupInstance);
      });
      circleGroupInstance.addTo(map);
    }

    return () => {
      if (heatLayerInstance) {
        map.removeLayer(heatLayerInstance);
      }
      if (circleGroupInstance) {
        map.removeLayer(circleGroupInstance);
      }
    };
  }, [map, points, options]);

  return null;
}
