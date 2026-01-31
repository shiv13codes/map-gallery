import React, { useState, useEffect, useRef } from 'react';
/**
 * ------------------------------------------------------------------
 * 🔧 CONFIGURATION
 * ------------------------------------------------------------------
 * Customize your map settings and identity here.
 */
const CONFIG = {
  title: "Vantage Point",
  subtitle: "Photography by Priyansh Patidar",
  defaultCenter: [25.0, 15.0], // Initial map view [lat, lng]
  defaultZoom: 3,
  // CartoDB Voyager (Light) - Clean, minimal street map
  streetTiles: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  streetAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  // Esri World Imagery - High quality satellite
  satelliteTiles: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  satelliteAttribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
};

/**
 * ------------------------------------------------------------------
 * 📸 DEMO DATA (Fallback)
 * ------------------------------------------------------------------
 * Used when photos.json is not found (e.g. in preview mode).
 */
const DEMO_PHOTOS = [
  {
    id: 1,
    lat: 64.1265,
    lng: -21.8174,
    src: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1200&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    lat: 35.6762,
    lng: 139.6503,
    src: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    lat: -33.8688,
    lng: 151.2093,
    src: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 4,
    lat: 40.7128,
    lng: -74.0060,
    src: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=1200&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 5,
    lat: 45.4408,
    lng: 12.3155,
    src: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=1200&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=200&auto=format&fit=crop"
  }
];

export default function PhotoMapApp() {
  const [activePhoto, setActivePhoto] = useState(null);
  const [mapMode, setMapMode] = useState('street'); // 'street' or 'satellite'
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Leaflet Import Handling
  // We use a ref to hold the map instance to avoid re-initialization issues
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // 1. Load Data
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const res = await fetch('/photos.json');
        if (!res.ok) throw new Error('Failed to load photos');
        const data = await res.json();
        setPhotos(data);
      } catch (error) {
        console.log("Using demo data (photos.json not found or environment restricted)");
        setPhotos(DEMO_PHOTOS); 
      } finally {
        setIsLoading(false);
      }
    };
    loadPhotos();
  }, []);

  // 2. Initialize Map (Leaflet)
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;

    // Load Leaflet CSS dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if necessary
    };
  }, [isLoading]);

  const initMap = () => {
    if (mapInstanceRef.current || !window.L) return;

    // Create Map
    const map = window.L.map(mapContainerRef.current, {
      center: CONFIG.defaultCenter,
      zoom: CONFIG.defaultZoom,
      zoomControl: false, // We will add a custom one or move it
      attributionControl: false // We will add custom attribution
    });

    // Add Zoom Control to bottom right
    window.L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    markerLayerRef.current = window.L.layerGroup().addTo(map);

    // Initial Tile Layer
    updateTileLayer(mapMode);
    
    // Render Markers
    renderMarkers();
  };

  // 3. Handle Map Mode Switching
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateTileLayer(mapMode);
    }
  }, [mapMode]);

  const updateTileLayer = (mode) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = mode === 'street' ? CONFIG.streetTiles : CONFIG.satelliteTiles;
    const attribution = mode === 'street' ? CONFIG.streetAttribution : CONFIG.satelliteAttribution;

    tileLayerRef.current = window.L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: attribution
    }).addTo(map);
  };

  // 4. Render Markers
  useEffect(() => {
    if (mapInstanceRef.current && window.L && photos.length > 0) {
      renderMarkers();
    }
  }, [photos]);

  const renderMarkers = () => {
    const map = mapInstanceRef.current;
    const layerGroup = markerLayerRef.current;
    
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Create a custom icon class
    const PhotoIcon = window.L.DivIcon.extend({
      options: {
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20] // Center
      }
    });

    // Keep track of all marker positions
    const markersBounds = [];

    photos.forEach(photo => {
      if (!photo.lat || !photo.lng) return;

      const markerHtml = `
        <div class="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gray-200 hover:scale-110 transition-transform duration-200 cursor-pointer box-border relative group">
          <img src="${photo.thumb || photo.src}" class="w-full h-full object-cover" alt="marker" />
        </div>
      `;

      const icon = new PhotoIcon({ html: markerHtml });
      const marker = window.L.marker([photo.lat, photo.lng], { icon: icon });

      marker.on('click', () => {
        setActivePhoto(photo);
        // Optional: Pan to marker on click
        map.flyTo([photo.lat, photo.lng], 13, { duration: 1.5 });
      });

      marker.addTo(layerGroup);
      markersBounds.push([photo.lat, photo.lng]);
    });

    // Auto-zoom to fit all markers
    if (markersBounds.length > 0) {
      const bounds = window.L.latLngBounds(markersBounds);
      map.fitBounds(bounds, {
        padding: [50, 50], // Add 50px padding around markers so they aren't on the edge
        maxZoom: 15,       // Don't zoom in too close if there's only 1 photo
        animate: true,
        duration: 1.5
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden font-sans text-slate-800">
      
      {/* 🌍 Map Container */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 z-0 bg-gray-200"
        style={{ width: '100%', height: '100%' }}
      />

      {/* 🏷️ Header / Brand */}
      <div className="absolute top-0 left-0 p-6 z-[400] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-sm border border-gray-100 pointer-events-auto inline-block">
          <h1 className="text-sm font-bold tracking-widest uppercase text-gray-900">{CONFIG.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{CONFIG.subtitle}</p>
        </div>
      </div>

      {/* 🕹️ Controls */}
      <div className="absolute top-6 right-6 z-[400] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-gray-100 p-1 flex">
          <button
            onClick={() => setMapMode('street')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mapMode === 'street' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mapMode === 'satellite' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* 🖼️ Lightbox Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActivePhoto(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
            onClick={() => setActivePhoto(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
          >
            <img 
              src={activePhoto.src} 
              alt="Full view" 
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
            />
            
            {/* Minimal Location Metadata */}
            <div className="mt-4 text-white/60 text-xs font-mono tracking-wider flex items-center gap-4">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {activePhoto.lat.toFixed(4)}, {activePhoto.lng.toFixed(4)}
              </span>

              {/* Google Maps Link */}
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${activePhoto.lat},${activePhoto.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors border-b border-transparent hover:border-white/50 pb-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Open in Maps</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 🦶 Attribution Footer (Subtle) */}
      <div className="absolute bottom-1 left-2 z-[400] text-[10px] text-gray-500/80 pointer-events-none mix-blend-multiply">
        Built with <a href="https://github.com/your-repo" className="underline pointer-events-auto hover:text-gray-900">Photo Map</a>
      </div>

    </div>
  );
}