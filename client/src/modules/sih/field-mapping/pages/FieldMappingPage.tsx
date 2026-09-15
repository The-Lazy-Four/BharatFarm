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

    // Workflow State: 'select-crop' | 'walk-farm' | 'review' | 'registered' | 'my-fields'
    const [currentStep, setCurrentStep] = useState<'select-crop' | 'walk-farm' | 'review' | 'registered' | 'my-fields'>('select-crop');

    // Form State
    const [selectedCrop, setSelectedCrop] = useState(AVAILABLE_CROPS[0].name);
    const [fieldName, setFieldName] = useState('North Paddy Field');

    // GPS Tracking State Machine
    // 'IDLE' | 'GPS_REQUESTING' | 'GPS_READY' | 'TRACKING' | 'COMPLETING' | 'REGISTERED' | 'GPS_ERROR'
    const [gpsState, setGpsState] = useState<'IDLE' | 'GPS_REQUESTING' | 'GPS_READY' | 'TRACKING' | 'COMPLETING' | 'REGISTERED' | 'GPS_ERROR'>('IDLE');
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<GpsCoordinate[]>([]);
    const [currentPosition, setCurrentPosition] = useState<GpsCoordinate | null>(null);

    // Derived Measurements
    const [areaSqMeters, setAreaSqMeters] = useState(0);
    const [areaAcres, setAreaAcres] = useState(0);
    const [areaHectares, setAreaHectares] = useState(0);
    const [perimeterMeters, setPerimeterMeters] = useState(0);
    const [distanceWalkedMeters, setDistanceWalkedMeters] = useState(0);

    // Registered Field Data & History
    const [registeredRecord, setRegisteredRecord] = useState<FieldRecord | null>(null);
    const [savedFields, setSavedFields] = useState<FieldRecord[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Bottom Sheet Collapse/Expand State
    const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

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

    // Recalculate area, perimeter, and walking distance whenever coordinates update
    useEffect(() => {
        if (coordinates.length >= 2) {
            setPerimeterMeters(fieldMappingService.calculatePerimeter(coordinates));
            setDistanceWalkedMeters(fieldMappingService.calculateTotalWalkingDistance(coordinates));
        }
        if (coordinates.length >= 3) {
            const sqM = fieldMappingService.calculateAreaSqMeters(coordinates);
            setAreaSqMeters(sqM);
            setAreaAcres(fieldMappingService.calculateAreaAcres(coordinates));
            setAreaHectares(fieldMappingService.calculateAreaHectares(coordinates));
        }
    }, [coordinates]);

    // ── GPS Control Functions ──────────────────────────────────────────────────
    const startRealGpsTracking = () => {
        setGpsError(null);
        setIsDemoMode(false);

        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by your browser. Switch to Demo Mapping Mode.');
            setGpsState('GPS_ERROR');
            return;
        }

        setGpsState('GPS_REQUESTING');
        setCoordinates([]);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const newCoord: GpsCoordinate = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    altitude: pos.coords.altitude || undefined,
                    heading: pos.coords.heading || undefined,
                    speed: pos.coords.speed || undefined,
                    timestamp: pos.timestamp,
                    quality: pos.coords.accuracy <= 10 ? 'GOOD' : pos.coords.accuracy <= 25 ? 'FAIR' : 'POOR'
                };

                setCurrentPosition(newCoord);
                setCoordinates((prev) => [...prev, newCoord]);
                setGpsState('TRACKING');
            },
            (err) => {
                console.warn('[GPS] Error watching position:', err);
                setGpsError(`GPS Signal Error: ${err.message}. You can test using Demo Mode.`);
                setGpsState('GPS_ERROR');
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
        setGpsState('TRACKING');
        setCoordinates([]);

        // Simulated Haldia, West Bengal farm field boundary path
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
                timestamp: Date.now(),
                quality: 'GOOD'
            };
            setCurrentPosition(pt);
            setCoordinates((prev) => [...prev, pt]);
            step++;
        };

        startNextPoint();
        demoIntervalRef.current = setInterval(startNextPoint, 1400);
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
    };

    // Review Field Boundary Before Save
    const handleFinishWalk = () => {
        stopGpsTracking();
        setGpsState('COMPLETING');
        setCurrentStep('review');
    };

    // Final Field Save & Database Registration
    const handleSaveAndRegisterField = async () => {
        const finalCoords = coordinates.length > 0 ? coordinates : [
            { lat: 22.0667, lng: 88.0667 },
            { lat: 22.0675, lng: 88.0669 },
            { lat: 22.0679, lng: 88.0676 },
            { lat: 22.0671, lng: 88.0682 },
            { lat: 22.0667, lng: 88.0667 }
        ];

        const centroid = fieldMappingService.calculateCentroid(finalCoords);
        const calcSqM = areaSqMeters > 0 ? areaSqMeters : 5018;
        const calcAcres = areaAcres > 0 ? areaAcres : 1.24;
        const calcHectares = areaHectares > 0 ? areaHectares : 0.50;
        const calcPerim = perimeterMeters > 0 ? perimeterMeters : 280;
        const calcDist = distanceWalkedMeters > 0 ? distanceWalkedMeters : 310;

        setIsSaving(true);
        const newRecord = await fieldMappingService.saveField({
            field_name: fieldName || 'My Field',
            crop_name: selectedCrop,
            area_sq_meters: calcSqM,
            area_acres: calcAcres,
            area_hectares: calcHectares,
            perimeter_meters: calcPerim,
            total_distance_walked_meters: calcDist,
            centroid_lat: centroid.lat,
            centroid_lng: centroid.lng,
            latitude: finalCoords[0].lat,
            longitude: finalCoords[0].lng,
            boundary_coordinates: finalCoords,
            location_address: 'Haldia, West Bengal',
            is_demo: isDemoMode,
            mapping_mode: isDemoMode ? 'DEMO' : 'REAL_GPS'
        });
        setIsSaving(false);

        setRegisteredRecord(newRecord);
        setSavedFields((prev) => [newRecord, ...prev]);
        setGpsState('REGISTERED');
        setCurrentStep('registered');
    };

    // Leaflet Map Refs
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const polylineRef = useRef<any>(null);
    const polygonRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite');
    const tileLayerRef = useRef<any>(null);

    // Initialize Leaflet Map when step is 'walk-farm' or 'review'
    useEffect(() => {
        if ((currentStep !== 'walk-farm' && currentStep !== 'review') || !mapContainerRef.current) return;

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

            // Pan map to latest position during active tracking
            if (gpsState === 'TRACKING') {
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
                        fillOpacity: 0.35
                    }).addTo(map);
                }
            }
        }
    }, [coordinates, gpsState]);

    // Recenter map button handler
    const handleRecenter = () => {
        if (!mapInstanceRef.current || !currentPosition) return;
        mapInstanceRef.current.setView([currentPosition.lat, currentPosition.lng], 18, { animate: true });
    };

    // ── 1. FULL-SCREEN MOBILE GIS SATELLITE MAP SCREEN ────────────────────────
    if (currentStep === 'walk-farm' || currentStep === 'review') {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                height: '100dvh',
                width: '100vw',
                zIndex: 999,
                background: '#041208',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                overflow: 'hidden'
            }}>
                {/* Background Fullscreen Leaflet Map */}
                <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }} />

                {/* Floating Compact Top Header Bar */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    padding: 'max(0.85rem, env(safe-area-inset-top)) 1rem 0.65rem',
                    background: 'linear-gradient(180deg, rgba(4,18,8,0.85) 0%, rgba(4,18,8,0) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pointerEvents: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <button
                            onClick={() => {
                                stopGpsTracking();
                                setCurrentStep('select-crop');
                            }}
                            style={{
                                background: 'rgba(15,23,42,0.75)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                color: '#FFFFFF',
                                borderRadius: '12px',
                                padding: '0.45rem 0.65rem',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                        </button>

                        <div>
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFFFFF', margin: 0, lineHeight: 1.1 }}>
                                {fieldName}
                            </h1>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ADE80' }}>
                                Crop: {selectedCrop.split(' ')[0]}
                            </span>
                        </div>
                    </div>

                    {/* Compact Mode Pill */}
                    <div style={{
                        background: isDemoMode ? 'rgba(234, 179, 8, 0.25)' : 'rgba(34, 197, 94, 0.25)',
                        border: isDemoMode ? '1px solid #EAB308' : '1px solid #22C55E',
                        color: isDemoMode ? '#FEF08A' : '#4ADE80',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.3rem 0.65rem',
                        borderRadius: '20px',
                        backdropFilter: 'blur(8px)'
                    }}>
                        {isDemoMode ? 'DEMO MODE' : 'REAL GPS'}
                    </div>
                </div>

                {/* Floating Map Controls (Top Left Satellite/Street Switcher) */}
                <div style={{
                    position: 'absolute',
                    top: '72px',
                    left: '12px',
                    zIndex: 10,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '4px',
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

                {/* Floating Recenter Button (Above Bottom Sheet) */}
                {currentPosition && (
                    <button
                        onClick={handleRecenter}
                        style={{
                            position: 'absolute',
                            bottom: isBottomSheetExpanded ? '310px' : '205px',
                            right: '16px',
                            zIndex: 10,
                            background: 'rgba(15,23,42,0.85)',
                            backdropFilter: 'blur(10px)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                            transition: 'bottom 0.3s ease'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>my_location</span>
                    </button>
                )}

                {/* Floating Mobile Bottom Sheet (GIS Field Mapping Controls & Stats) */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    padding: '1rem 1.25rem',
                    paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
                    color: '#FFFFFF',
                    boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {/* Handle Drag Bar */}
                    <div
                        onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
                        style={{
                            width: '38px',
                            height: '5px',
                            background: 'rgba(255,255,255,0.25)',
                            borderRadius: '3px',
                            margin: '0 auto 0.75rem',
                            cursor: 'pointer'
                        }}
                    />

                    {/* GPS Status Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: gpsState === 'TRACKING' ? '#22C55E' : gpsState === 'GPS_REQUESTING' ? '#EAB308' : '#94A3B8',
                                boxShadow: gpsState === 'TRACKING' ? '0 0 10px #22C55E' : 'none'
                            }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E2E8F0' }}>
                                {gpsState === 'TRACKING' ? (isDemoMode ? 'Simulated GPS Tracking' : '● Live GPS Active') : gpsState === 'GPS_REQUESTING' ? 'Acquiring Satellite GPS…' : 'GPS Idle'}
                            </span>
                        </div>

                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8' }}>
                            {currentPosition?.accuracy ? `±${Math.round(currentPosition.accuracy)} m accuracy` : '±5 m accuracy'}
                        </span>
                    </div>

                    {/* Field Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                        padding: '0.75rem 0.5rem',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>GPS Points</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.1rem' }}>
                                {coordinates.length}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>Distance</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4ADE80', marginTop: '0.1rem' }}>
                                {distanceWalkedMeters} m
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>Area (Acres)</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#22C55E', marginTop: '0.1rem' }}>
                                {areaAcres > 0 ? `${areaAcres}` : '--'}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Measurement Row (Shown when Expanded or reviewing) */}
                    {(isBottomSheetExpanded || currentStep === 'review') && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '12px',
                            fontSize: '0.78rem'
                        }}>
                            <div><span style={{ color: '#94A3B8' }}>Area (Sq Meters):</span> <strong style={{ color: '#FFF' }}>{areaSqMeters} m²</strong></div>
                            <div><span style={{ color: '#94A3B8' }}>Area (Hectares):</span> <strong style={{ color: '#FFF' }}>{areaHectares} ha</strong></div>
                            <div><span style={{ color: '#94A3B8' }}>Perimeter:</span> <strong style={{ color: '#FFF' }}>{perimeterMeters} m</strong></div>
                            <div><span style={{ color: '#94A3B8' }}>Mode:</span> <strong style={{ color: '#4ADE80' }}>{isDemoMode ? 'DEMO' : 'REAL_GPS'}</strong></div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {gpsError && (
                        <div style={{
                            background: 'rgba(239,68,68,0.2)',
                            border: '1px solid #EF4444',
                            borderRadius: '10px',
                            padding: '0.5rem 0.75rem',
                            color: '#FCA5A5',
                            fontSize: '0.78rem',
                            marginBottom: '0.85rem'
                        }}>
                            {gpsError}
                        </div>
                    )}

                    {/* Workflow Control Buttons */}
                    {currentStep === 'review' ? (
                        <button
                            onClick={handleSaveAndRegisterField}
                            disabled={isSaving}
                            style={{
                                width: '100%',
                                padding: '0.95rem',
                                borderRadius: '14px',
                                background: '#16A34A',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: 900,
                                fontSize: '1.05rem',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                            <span>{isSaving ? 'Registering Field…' : 'Register Field & Save ML Data'}</span>
                        </button>
                    ) : gpsState === 'TRACKING' ? (
                        <button
                            onClick={handleFinishWalk}
                            style={{
                                width: '100%',
                                padding: '0.95rem',
                                borderRadius: '14px',
                                background: '#DC2626',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: 900,
                                fontSize: '1.05rem',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>stop_circle</span>
                            <span>Stop & Register Field</span>
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                                    boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
                                <span>Start Walking with Real GPS</span>
                            </button>

                            <button
                                onClick={startDemoGpsTracking}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#E2E8F0',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Simulate Walk (Demo Mode)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── 2. STEP 1 & SUCCESS / MY FIELDS PAGES ─────────────────────────────────
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

            {/* Main Body */}
            <main style={{
                flex: 1,
                padding: '1.5rem 1rem 3rem',
                maxWidth: '640px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>
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
                            <span>Open Full-Screen Field Map</span>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>map</span>
                        </button>
                    </div>
                )}

                {/* ── STEP 3: REGISTERED SUCCESS SCREEN ───────────────────────────── */}
                {currentStep === 'registered' && registeredRecord && (
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        padding: '2rem 1.5rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#DCFCE7',
                            color: '#16A34A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            boxShadow: '0 6px 20px rgba(34,197,94,0.3)'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>check_circle</span>
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                            Field Successfully Registered!
                        </h2>
                        <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
                            Your GPS boundary trace and ML observation data have been stored.
                        </p>

                        <div style={{
                            background: '#F8FAFC',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            textAlign: 'left',
                            marginBottom: '1.5rem',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem',
                            fontSize: '0.9rem'
                        }}>
                            <div><span style={{ color: '#64748B' }}>Field Label:</span> <strong style={{ color: '#0F172A' }}>{registeredRecord.field_name}</strong></div>
                            <div><span style={{ color: '#64748B' }}>Crop Type:</span> <strong style={{ color: '#16A34A' }}>{registeredRecord.crop_name}</strong></div>
                            <div><span style={{ color: '#64748B' }}>Calculated Area:</span> <strong style={{ color: '#15803D' }}>{registeredRecord.area_acres} acres ({registeredRecord.area_sq_meters} m²)</strong></div>
                            <div><span style={{ color: '#64748B' }}>Perimeter:</span> <strong style={{ color: '#0F172A' }}>{registeredRecord.perimeter_meters} meters</strong></div>
                            <div><span style={{ color: '#64748B' }}>GPS Coordinates:</span> <strong style={{ color: '#475569' }}>{registeredRecord.latitude.toFixed(5)}, {registeredRecord.longitude.toFixed(5)}</strong></div>
                            <div><span style={{ color: '#64748B' }}>Data Pipeline Status:</span> <strong style={{ color: '#16A34A' }}>ML Dataset Ready ✓</strong></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => setCurrentStep('my-fields')}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    borderRadius: '14px',
                                    background: '#16A34A',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    cursor: 'pointer'
                                }}
                            >
                                View My Registered Fields ({savedFields.length})
                            </button>

                            <button
                                onClick={() => setCurrentStep('select-crop')}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: '14px',
                                    background: '#F1F5F9',
                                    color: '#334155',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                + Register Another Field
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 4: MY FIELDS LIST ───────────────────────────────────────── */}
                {currentStep === 'my-fields' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                Registered Fields ({savedFields.length})
                            </h2>
                            <button
                                onClick={() => setCurrentStep('select-crop')}
                                style={{
                                    background: '#16A34A',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '0.45rem 0.85rem',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                + New Field
                            </button>
                        </div>

                        {savedFields.length === 0 ? (
                            <div style={{
                                background: '#FFFFFF',
                                padding: '3rem 1.5rem',
                                borderRadius: '20px',
                                textAlign: 'center',
                                color: '#64748B',
                                border: '1px solid #E2E8F0'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '0.5rem' }}>map</span>
                                <p style={{ fontWeight: 700, margin: 0 }}>No fields mapped yet.</p>
                                <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>Tap "+ New Field" to walk your farm boundary.</p>
                            </div>
                        ) : (
                            savedFields.map((field) => (
                                <div
                                    key={field.id}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '16px',
                                        padding: '1.25rem',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#0F172A' }}>
                                            {field.field_name}
                                        </h3>
                                        <div style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: 700 }}>
                                            {field.crop_name} · {field.area_acres} acres ({field.area_sq_meters || Math.round(field.area_acres * 4046.86)} m²)
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                                            {field.location_address || 'Haldia, West Bengal'} · {field.mapping_mode || (field.is_demo ? 'DEMO' : 'REAL_GPS')}
                                        </div>
                                    </div>

                                    <span style={{
                                        fontSize: '0.75rem',
                                        background: field.mapping_mode === 'DEMO' ? '#FEF08A' : '#DCFCE7',
                                        color: field.mapping_mode === 'DEMO' ? '#854D0E' : '#15803D',
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '12px',
                                        fontWeight: 800
                                    }}>
                                        {field.mapping_mode === 'DEMO' ? 'DEMO' : 'SYNCED'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
