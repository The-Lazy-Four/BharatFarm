import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldMappingService, GpsCoordinate, FieldRecord } from '../fieldMapping.service.js';

const AVAILABLE_CROPS = [
    { id: 'paddy', name: 'Paddy / Rice (धान)', icon: '🌾' },
    { id: 'wheat', name: 'Wheat (गेहूं)', icon: '🌾' },
    { id: 'cotton', name: 'Cotton (कपास)', icon: '🌱' },
    { id: 'sugarcane', name: 'Sugarcane (गन्ना)', icon: '🎋' },
    { id: 'maize', name: 'Maize / Corn (मक्का)', icon: '🌽' },
    { id: 'potato', name: 'Potato (आलू)', icon: '🥔' },
    { id: 'mustard', name: 'Mustard (सरसों)', icon: '🌼' },
    { id: 'soybean', name: 'Soybean (सोयाबीन)', icon: '🫘' },
    { id: 'tomato', name: 'Tomato (टमाटर)', icon: '🍅' }
];

export const FieldMappingPage: React.FC = () => {
    const navigate = useNavigate();

    // Workflow State: 'select-crop' | 'walk-farm' | 'registered' | 'my-fields'
    const [currentStep, setCurrentStep] = useState<'select-crop' | 'walk-farm' | 'registered' | 'my-fields'>('select-crop');

    // Form State
    const [selectedCrop, setSelectedCrop] = useState(AVAILABLE_CROPS[0].name);
    const [fieldName, setFieldName] = useState('North Paddy Field');

    // GPS Tracking State
    const [isTracking, setIsTracking] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<GpsCoordinate[]>([]);
    const [currentPosition, setCurrentPosition] = useState<GpsCoordinate | null>(null);

    // Calculations
    const [areaAcres, setAreaAcres] = useState(0);
    const [perimeterMeters, setPerimeterMeters] = useState(0);

    // Registered Field Data & History
    const [registeredRecord, setRegisteredRecord] = useState<FieldRecord | null>(null);
    const [savedFields, setSavedFields] = useState<FieldRecord[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Geo Watcher Ref
    const watchIdRef = useRef<number | null>(null);
    const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load saved fields on mount
    useEffect(() => {
        fieldMappingService.getSavedFields().then(fields => setSavedFields(fields));
    }, []);

    // Cleanup watcher on unmount
    useEffect(() => {
        return () => {
            stopGpsTracking();
        };
    }, []);

    // Recalculate area and perimeter whenever coordinates update
    useEffect(() => {
        if (coordinates.length >= 2) {
            setPerimeterMeters(fieldMappingService.calculatePerimeter(coordinates));
        }
        if (coordinates.length >= 3) {
            setAreaAcres(fieldMappingService.calculateAreaAcres(coordinates));
        }
    }, [coordinates]);

    // ── GPS Control Functions ──────────────────────────────────────────────────
    const startRealGpsTracking = () => {
        setGpsError(null);
        setIsDemoMode(false);

        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by your browser. Switch to Demo Mapping Mode.');
            return;
        }

        setIsTracking(true);
        setCoordinates([]);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const newCoord: GpsCoordinate = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp
                };

                setCurrentPosition(newCoord);
                setCoordinates((prev) => [...prev, newCoord]);
            },
            (err) => {
                console.warn('[GPS] Error watching position:', err);
                setGpsError(`GPS Permission/Signal Error: ${err.message}. You can use Demo Mode below.`);
                setIsTracking(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    const startDemoGpsTracking = () => {
        setGpsError(null);
        setIsDemoMode(true);
        setIsTracking(true);
        setCoordinates([]);

        // Simulated Haldia, West Bengal farm field polygon path
        const baseLat = 22.0667;
        const baseLng = 88.0667;
        const pathDelta = [
            { dLat: 0.0000, dLng: 0.0000 },
            { dLat: 0.0008, dLng: 0.0002 },
            { dLat: 0.0014, dLng: 0.0007 },
            { dLat: 0.0012, dLng: 0.0015 },
            { dLat: 0.0004, dLng: 0.0018 },
            { dLat: -0.0003, dLng: 0.0012 },
            { dLat: -0.0002, dLng: 0.0003 },
            { dLat: 0.0000, dLng: 0.0000 }
        ];

        let step = 0;
        const startNextPoint = () => {
            if (step >= pathDelta.length) {
                if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
                return;
            }
            const pt: GpsCoordinate = {
                lat: baseLat + pathDelta[step].dLat,
                lng: baseLng + pathDelta[step].dLng,
                accuracy: 3,
                timestamp: Date.now()
            };
            setCurrentPosition(pt);
            setCoordinates((prev) => [...prev, pt]);
            step++;
        };

        startNextPoint();
        demoIntervalRef.current = setInterval(startNextPoint, 1500);
    };

    const stopGpsTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (demoIntervalRef.current) {
            clearInterval(demoIntervalRef.current);
            demoIntervalRef.current = null;
        }
        setIsTracking(false);
    };

    // Finish Walk & Save Field
    const handleFinishWalk = async () => {
        stopGpsTracking();

        const finalCoords = coordinates.length > 0 ? coordinates : [
            { lat: 22.0667, lng: 88.0667 },
            { lat: 22.0675, lng: 88.0669 },
            { lat: 22.0679, lng: 88.0676 },
            { lat: 22.0671, lng: 88.0682 },
            { lat: 22.0667, lng: 88.0667 }
        ];

        const calcArea = areaAcres > 0 ? areaAcres : 1.24;
        const calcPerim = perimeterMeters > 0 ? perimeterMeters : 280;

        setIsSaving(true);
        const newRecord = await fieldMappingService.saveField({
            field_name: fieldName || 'My Field',
            crop_name: selectedCrop,
            area_acres: calcArea,
            perimeter_meters: calcPerim,
            latitude: finalCoords[0].lat,
            longitude: finalCoords[0].lng,
            boundary_coordinates: finalCoords,
            location_address: 'Haldia, West Bengal',
            is_demo: isDemoMode
        });
        setIsSaving(false);

        setRegisteredRecord(newRecord);
        setSavedFields((prev) => [newRecord, ...prev]);
        setCurrentStep('registered');
    };

    // Map state (Leaflet)
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const polylineRef = useRef<any>(null);
    const polygonRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite');
    const tileLayerRef = useRef<any>(null);

    // Initialize Leaflet Map when step is 'walk-farm'
    useEffect(() => {
        if (currentStep !== 'walk-farm' || !mapContainerRef.current) return;

        // Load Leaflet JS dynamically if not already loaded on window
        const initLeaflet = () => {
            const L = (window as any).L;
            if (!L) return;

            if (!mapInstanceRef.current) {
                const initialLat = currentPosition?.lat || 22.0667;
                const initialLng = currentPosition?.lng || 88.0667;

                const map = L.map(mapContainerRef.current, {
                    center: [initialLat, initialLng],
                    zoom: 17,
                    zoomControl: false
                });

                // Add zoom control top right
                L.control.zoom({ position: 'topright' }).addTo(map);

                // Add default Esri Satellite Tile Layer
                const esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
                const esriAttr = '© Esri, Maxar, Earthstar Geographics, and GIS User Community';

                const layer = L.tileLayer(esriUrl, {
                    maxZoom: 19,
                    attribution: esriAttr
                }).addTo(map);

                tileLayerRef.current = layer;
                mapInstanceRef.current = map;
            }
        };

        if ((window as any).L) {
            initLeaflet();
        } else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.crossOrigin = '';
            script.onload = initLeaflet;
            document.body.appendChild(script);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                polylineRef.current = null;
                polygonRef.current = null;
                markerRef.current = null;
            }
        };
    }, [currentStep]);

    // Handle Layer Switch (Satellite vs Street)
    const handleSwitchLayer = (type: 'satellite' | 'street') => {
        setMapLayer(type);
        const L = (window as any).L;
        if (!L || !mapInstanceRef.current || !tileLayerRef.current) return;

        mapInstanceRef.current.removeLayer(tileLayerRef.current);

        if (type === 'satellite') {
            const esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            const esriAttr = '© Esri, Maxar, Earthstar Geographics, and GIS User Community';
            tileLayerRef.current = L.tileLayer(esriUrl, { maxZoom: 19, attribution: esriAttr }).addTo(mapInstanceRef.current);
        } else {
            const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const osmAttr = '© OpenStreetMap contributors';
            tileLayerRef.current = L.tileLayer(osmUrl, { maxZoom: 19, attribution: osmAttr }).addTo(mapInstanceRef.current);
        }
    };

    // Update Map Overlays (Polylines, Polygon, Current GPS Marker) whenever coordinates change
    useEffect(() => {
        const L = (window as any).L;
        if (!L || !mapInstanceRef.current) return;

        const map = mapInstanceRef.current;
        const latLngs = coordinates.map(c => [c.lat, c.lng]);

        if (latLngs.length > 0) {
            const lastCoord = latLngs[latLngs.length - 1];

            // Update or create Live Marker
            if (!markerRef.current) {
                const pulsingIcon = L.divIcon({
                    className: 'custom-gps-marker',
                    html: `<div style="
                        width: 18px; height: 18px; background: #22c55e; border: 3px solid #ffffff;
                        border-radius: 50%; box-shadow: 0 0 12px #22c55e, 0 0 24px rgba(34,197,94,0.6);
                    "></div>`,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                });
                markerRef.current = L.marker(lastCoord, { icon: pulsingIcon }).addTo(map);
            } else {
                markerRef.current.setLatLng(lastCoord);
            }

            // Pan map to latest position if tracking
            if (isTracking) {
                map.panTo(lastCoord, { animate: true });
            }

            // Draw Polyline path
            if (polylineRef.current) {
                polylineRef.current.setLatLngs(latLngs);
            } else {
                polylineRef.current = L.polyline(latLngs, {
                    color: '#4ade80',
                    weight: 4,
                    dashArray: '6, 6',
                    opacity: 0.95
                }).addTo(map);
            }

            // Draw Polygon shaded field boundary if 3+ points
            if (latLngs.length >= 3) {
                if (polygonRef.current) {
                    polygonRef.current.setLatLngs(latLngs);
                } else {
                    polygonRef.current = L.polygon(latLngs, {
                        color: '#22c55e',
                        weight: 2,
                        fillColor: '#22c55e',
                        fillOpacity: 0.3
                    }).addTo(map);
                }
            }
        }
    }, [coordinates, isTracking]);

    // Recenter map button handler
    const handleRecenter = () => {
        if (!mapInstanceRef.current || !currentPosition) return;
        mapInstanceRef.current.setView([currentPosition.lat, currentPosition.lng], 18, { animate: true });
    };

    // ── Render Interactive GIS Satellite Map ────────────────────────────────
    const renderMapCanvas = () => {
        return (
            <div style={{
                position: 'relative',
                height: '280px',
                width: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '2px solid rgba(34,197,94,0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
                {/* Leaflet Map Div */}
                <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0b2915' }} />

                {/* Layer Switcher Control (Floating top left) */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 400,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '3px',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '4px',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}>
                    <button
                        onClick={() => handleSwitchLayer('satellite')}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: mapLayer === 'satellite' ? '#16A34A' : 'transparent',
                            color: mapLayer === 'satellite' ? '#FFFFFF' : '#94A3B8'
                        }}
                    >
                        🛰 Satellite
                    </button>
                    <button
                        onClick={() => handleSwitchLayer('street')}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: mapLayer === 'street' ? '#16A34A' : 'transparent',
                            color: mapLayer === 'street' ? '#FFFFFF' : '#94A3B8'
                        }}
                    >
                        🗺 Map
                    </button>
                </div>

                {/* Live GPS / Tracking Status Badge (Floating top right, under zoom) */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    zIndex: 400,
                    background: 'rgba(15,23,42,0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isTracking ? '#22c55e' : '#eab308'
                    }} />
                    {isDemoMode ? 'Demo Mode Active' : isTracking ? `GPS Active ±${currentPosition?.accuracy ? Math.round(currentPosition.accuracy) : 5}m` : 'Ready'}
                </div>

                {/* Recenter Button (Floating bottom right) */}
                {currentPosition && (
                    <button
                        onClick={handleRecenter}
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            zIndex: 400,
                            background: 'rgba(15,23,42,0.85)',
                            backdropFilter: 'blur(8px)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '12px',
                            padding: '0.4rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>my_location</span>
                        Recenter
                    </button>
                )}
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F8FAFC',
            color: '#0F172A',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: '0.85rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            background: '#F1F5F9',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.45rem 0.85rem',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                        SIH
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                            Field Mapping
                        </h1>
                        <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700 }}>
                            Walk the Farm · SIH Innovation Module #6
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setCurrentStep('my-fields')}
                    style={{
                        background: currentStep === 'my-fields' ? '#16A34A' : '#DCFCE7',
                        color: currentStep === 'my-fields' ? '#FFFFFF' : '#15803D',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.45rem 0.85rem',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                    }}
                >
                    My Fields ({savedFields.length})
                </button>
            </header>

            {/* Main Body Container */}
            <main style={{
                flex: 1,
                padding: '1.5rem 1rem 3rem',
                maxWidth: '640px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>

                {/* Step Indicator Pills */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    justifyContent: 'center'
                }}>
                    {[
                        { id: 'select-crop', label: '1. Select Crop' },
                        { id: 'walk-farm', label: '2. Walk Farm' },
                        { id: 'registered', label: '3. Registered' }
                    ].map((s) => (
                        <div
                            key={s.id}
                            style={{
                                padding: '0.35rem 0.85rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                background: currentStep === s.id ? '#16A34A' : '#E2E8F0',
                                color: currentStep === s.id ? '#FFFFFF' : '#64748B'
                            }}
                        >
                            {s.label}
                        </div>
                    ))}
                </div>

                {/* ── STEP 1: SELECT CROP & FIELD NAME ────────────────────────────── */}
                {currentStep === 'select-crop' && (
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: '#DCFCE7', color: '#15803D',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>map</span>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0F172A' }}>
                                    Register New Field
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                                    Step 1: Choose crop and name your field
                                </p>
                            </div>
                        </div>

                        {/* Field Name Input */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#334155', marginBottom: '0.4rem' }}>
                                Field Label / Name
                            </label>
                            <input
                                type="text"
                                value={fieldName}
                                onChange={(e) => setFieldName(e.target.value)}
                                placeholder="e.g. North Paddy Field"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #CBD5E1',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Crop Selector Grid */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#334155', marginBottom: '0.6rem' }}>
                                Select Crop
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                                gap: '0.65rem'
                            }}>
                                {AVAILABLE_CROPS.map((crop) => (
                                    <button
                                        key={crop.id}
                                        onClick={() => setSelectedCrop(crop.name)}
                                        style={{
                                            background: selectedCrop === crop.name ? '#F0FDF4' : '#F8FAFC',
                                            border: selectedCrop === crop.name ? '2px solid #16A34A' : '1px solid #E2E8F0',
                                            borderRadius: '12px',
                                            padding: '0.75rem 0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: selectedCrop === crop.name ? '#15803D' : '#334155',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>{crop.icon}</span>
                                        <span>{crop.name.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentStep('walk-farm')}
                            style={{
                                width: '100%',
                                padding: '0.95rem',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span>Continue → Walk the Farm</span>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>directions_walk</span>
                        </button>
                    </div>
                )}

                {/* ── STEP 2: WALK THE FARM (GPS TRACKING) ────────────────────────── */}
                {currentStep === 'walk-farm' && (
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0F172A' }}>
                                    Walk the Farm
                                </h2>
                                <span style={{ fontSize: '0.8rem', background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 700 }}>
                                    Crop: {selectedCrop.split(' ')[0]}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                                Walk along the outer boundary of your field while mobile GPS traces your path.
                            </p>
                        </div>

                        {/* Map Canvas Visualizer */}
                        {renderMapCanvas()}

                        {/* Live Stats Bar */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.75rem',
                            background: '#F8FAFC',
                            borderRadius: '14px',
                            padding: '1rem 0.75rem',
                            textAlign: 'center',
                            border: '1px solid #E2E8F0'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>GPS Points</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginTop: '0.15rem' }}>
                                    {coordinates.length}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Perimeter</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16A34A', marginTop: '0.15rem' }}>
                                    {perimeterMeters} m
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Est. Area</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803D', marginTop: '0.15rem' }}>
                                    {areaAcres > 0 ? `${areaAcres} acres` : 'Calculating…'}
                                </div>
                            </div>
                        </div>

                        {/* Error Message banner */}
                        {gpsError && (
                            <div style={{
                                background: '#FEF2F2',
                                border: '1px solid #FCA5A5',
                                borderRadius: '12px',
                                padding: '0.75rem',
                                color: '#991B1B',
                                fontSize: '0.82rem'
                            }}>
                                {gpsError}
                            </div>
                        )}

                        {/* Controls */}
                        {!isTracking ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    onClick={startRealGpsTracking}
                                    style={{
                                        width: '100%',
                                        padding: '0.95rem',
                                        borderRadius: '14px',
                                        background: '#16A34A',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>my_location</span>
                                    <span>Start Walking with Real GPS</span>
                                </button>

                                <button
                                    onClick={startDemoGpsTracking}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem',
                                        borderRadius: '14px',
                                        background: '#FEF9C3',
                                        color: '#854D0E',
                                        border: '1.5px solid #FDE047',
                                        fontWeight: 800,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                                    <span>Simulate Walk (Demo Mode)</span>
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={stopGpsTracking}
                                    style={{
                                        flex: 1,
                                        padding: '0.9rem',
                                        borderRadius: '14px',
                                        background: '#EF4444',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Pause Tracking
                                </button>

                                <button
                                    onClick={handleFinishWalk}
                                    disabled={isSaving}
                                    style={{
                                        flex: 1.5,
                                        padding: '0.9rem',
                                        borderRadius: '14px',
                                        background: '#16A34A',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                                        opacity: isSaving ? 0.7 : 1
                                    }}
                                >
                                    {isSaving ? 'Registering…' : 'Stop & Register Field ✓'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── STEP 3: FIELD REGISTERED CONFIRMATION ───────────────────────── */}
                {currentStep === 'registered' && registeredRecord && (
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        padding: '2rem 1.5rem',
                        border: '2px solid #22C55E',
                        boxShadow: '0 12px 32px rgba(34, 197, 94, 0.15)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: '#DCFCE7', color: '#16A34A',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>check_circle</span>
                        </div>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                            Field Registered ✓
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '0.35rem 0 1.5rem 0' }}>
                            Your field boundary is saved and integrated into BharatFarm SIH platform.
                        </p>

                        {/* Field Record Summary Grid */}
                        <div style={{
                            background: '#F8FAFC',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            textAlign: 'left',
                            border: '1px solid #E2E8F0',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem' }}>
                                <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Field Name:</span>
                                <span style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 800 }}>{registeredRecord.field_name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem' }}>
                                <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Crop Type:</span>
                                <span style={{ color: '#15803D', fontSize: '0.9rem', fontWeight: 800 }}>{registeredRecord.crop_name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem' }}>
                                <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Mapped Area:</span>
                                <span style={{ color: '#16A34A', fontSize: '1.1rem', fontWeight: 900 }}>{registeredRecord.area_acres} acres</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem' }}>
                                <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Perimeter:</span>
                                <span style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 700 }}>{registeredRecord.perimeter_meters} meters</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Location:</span>
                                <span style={{ color: '#0F172A', fontSize: '0.85rem', fontWeight: 700 }}>{registeredRecord.location_address}</span>
                            </div>
                        </div>

                        {/* SIH Module Integration Action Cards */}
                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                                🌾 Integrated Platform Actions:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => navigate('/sih/climate-risk')}
                                    style={{
                                        background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
                                        borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem',
                                        fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                >
                                    <span>⛈ Run Climate Risk Telemetry for this Field</span>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                </button>

                                <button
                                    onClick={() => navigate('/sih/crop-insurance')}
                                    style={{
                                        background: '#FEFCE8', color: '#A16207', border: '1px solid #FEF08A',
                                        borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem',
                                        fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                >
                                    <span>🛡 Verify Satellite NDVI Crop Insurance</span>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                </button>

                                <button
                                    onClick={() => navigate('/sih/price-risk')}
                                    style={{
                                        background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0',
                                        borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem',
                                        fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                >
                                    <span>🌾 Check Price-Decrement Risk (Before You Sow)</span>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setCurrentStep('my-fields')}
                                style={{
                                    flex: 1,
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    background: '#FFFFFF',
                                    color: '#15803D',
                                    border: '1.5px solid #16A34A',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                View My Fields
                            </button>

                            <button
                                onClick={() => navigate('/home')}
                                style={{
                                    flex: 1,
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    background: '#16A34A',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to SIH →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── MY SAVED FIELDS LIST VIEW ────────────────────────────────────── */}
                {currentStep === 'my-fields' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                My Registered Fields
                            </h2>
                            <button
                                onClick={() => setCurrentStep('select-crop')}
                                style={{
                                    background: '#16A34A', color: '#fff', border: 'none',
                                    borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.82rem',
                                    fontWeight: 800, cursor: 'pointer'
                                }}
                            >
                                + Map New Field
                            </button>
                        </div>

                        {savedFields.length === 0 ? (
                            <div style={{
                                background: '#FFFFFF', borderRadius: '16px', padding: '3rem 1.5rem',
                                textAlign: 'center', border: '1px solid #E2E8F0'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8' }}>map</span>
                                <p style={{ color: '#64748B', margin: '0.5rem 0 1.25rem 0', fontWeight: 600 }}>
                                    No registered fields found yet.
                                </p>
                                <button
                                    onClick={() => setCurrentStep('select-crop')}
                                    style={{
                                        background: '#16A34A', color: '#fff', border: 'none',
                                        borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: 800
                                    }}
                                >
                                    Start Field Mapping
                                </button>
                            </div>
                        ) : (
                            savedFields.map((field, idx) => (
                                <div
                                    key={field.id || idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '16px',
                                        padding: '1.25rem',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                                {field.field_name}
                                            </h3>
                                            <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700 }}>
                                                {field.crop_name}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16A34A' }}>
                                                {field.area_acres} acres
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                                Perimeter: {field.perimeter_meters}m
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '10px',
                                        fontSize: '0.78rem', color: '#64748B'
                                    }}>
                                        <span>📍 {field.location_address}</span>
                                        <span>{new Date(field.created_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </main>
        </div>
    );
};
