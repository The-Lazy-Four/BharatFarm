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

    // ── Render Map Visualizer Canvas ──────────────────────────────────────────
    const renderMapCanvas = () => {
        if (coordinates.length === 0) {
            return (
                <div style={{
                    height: '240px',
                    background: '#0d3319',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: '1px dashed rgba(34,197,94,0.4)'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#4ade80', marginBottom: '0.5rem' }}>
                        map
                    </span>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Map Ready</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                        Tap <strong>"Start Walking"</strong> or <strong>"Demo Mode"</strong> to trace field boundaries
                    </div>
                </div>
            );
        }

        // Convert coords to relative SVG viewBox coordinates (0-300 x 0-200)
        const lats = coordinates.map((c) => c.lat);
        const lngs = coordinates.map((c) => c.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats) || minLat + 0.001;
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs) || minLng + 0.001;

        const mapPoints = coordinates.map((c) => {
            const x = 30 + ((c.lng - minLng) / (maxLng - minLng || 0.001)) * 240;
            const y = 170 - ((c.lat - minLat) / (maxLat - minLat || 0.001)) * 140;
            return `${x},${y}`;
        });

        const pointsString = mapPoints.join(' ');
        const lastPt = mapPoints[mapPoints.length - 1].split(',');

        return (
            <div style={{
                position: 'relative',
                height: '260px',
                background: 'linear-gradient(180deg, #0b2915 0%, #061c0d 100%)',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(34,197,94,0.3)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
            }}>
                {/* SVG Polygon & Path */}
                <svg viewBox="0 0 300 200" style={{ width: '100%', height: '100%' }}>
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="300" height="200" fill="url(#grid)" />

                    {/* Filled Polygon (when 3+ points) */}
                    {coordinates.length >= 3 && (
                        <polygon
                            points={pointsString}
                            fill="rgba(34, 197, 94, 0.25)"
                            stroke="#22c55e"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                        />
                    )}

                    {/* Polyline */}
                    <polyline
                        points={pointsString}
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Start Point Pin */}
                    {mapPoints[0] && (
                        <circle
                            cx={mapPoints[0].split(',')[0]}
                            cy={mapPoints[0].split(',')[1]}
                            r="5"
                            fill="#eab308"
                            stroke="#ffffff"
                            strokeWidth="2"
                        />
                    )}

                    {/* Current GPS Position Pulse */}
                    <circle
                        cx={lastPt[0]}
                        cy={lastPt[1]}
                        r="8"
                        fill="#22c55e"
                        stroke="#ffffff"
                        strokeWidth="2"
                    >
                        <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                </svg>

                {/* Map Overlay Badge */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15,23,42,0.85)',
                    backdropFilter: 'blur(4px)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isTracking ? '#22c55e' : '#eab308'
                    }} />
                    {isDemoMode ? 'Demo Mode Active' : isTracking ? 'GPS Active' : 'Stopped'}
                </div>

                {/* Coords Badge */}
                {currentPosition && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(15,23,42,0.85)',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '10px',
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        fontFamily: 'monospace'
                    }}>
                        {currentPosition.lat.toFixed(4)}°, {currentPosition.lng.toFixed(4)}°
                    </div>
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
