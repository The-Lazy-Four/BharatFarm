import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Spinner } from '@core/ui/index';
import { roadmapApi, CropRoadmapRequest, CropRoadmapResponse, CropRoadmapItem } from './index';
import { useAuth } from '@core/context/AuthContext';

const ROADMAP_STORAGE_KEY = 'bharatfarm_active_roadmap';
const ROADMAP_INPUT_KEY = 'bharatfarm_roadmap_input';
const ROADMAP_FAILURE_MESSAGE = 'Unable to generate the roadmap right now. Please try again in a moment.';
const IS_DEVELOPMENT = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const CROPS = [
  'Rice', 'Wheat', 'Maize', 'Potato', 'Tomato', 'Onion', 'Mustard',
  'Cotton', 'Mango', 'Pulses', 'Brinjal', 'Cabbage', 'Cauliflower', 'Chili',
  'Groundnut', 'Sugarcane'
];

const SOIL_TYPES = ['Alluvial', 'Loamy', 'Sandy', 'Clay', 'Black Soil', 'Red Soil', 'Other'];
const IRRIGATION_TYPES = ['Rainfed', 'Drip', 'Sprinkler', 'Canal', 'Borewell', 'Mixed'];

const ICONS: Record<string, string> = {
  land_preparation: '🚜',
  sowing: '🌱',
  irrigation: '💧',
  fertilization: '🌿',
  nutrient_management: '🧪',
  pest_monitoring: '🐛',
  disease_monitoring: '🦠',
  weed_management: '🌾',
  pruning_thinning: '✂️',
  flowering: '🌸',
  fruiting: '🍅',
  harvesting: '🌾',
  post_harvest: '📦',
  general: '📋'
};

const LOADING_MESSAGE = '🌱 Generating your farming roadmap...';

const formatActivityDate = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short'
  }).format(date);
};

const getRoadmapDuration = (roadmap: CropRoadmapResponse['roadmap']) =>
  roadmap.reduce((maxDay, activity) => Math.max(maxDay, activity.day), 1);

const getStageIcon = (stage: string) => {
  const normalizedStage = stage.toLowerCase();

  if (normalizedStage.includes('land') || normalizedStage.includes('soil')) return ICONS.land_preparation;
  if (normalizedStage.includes('sow') || normalizedStage.includes('seed') || normalizedStage.includes('transplant')) return ICONS.sowing;
  if (normalizedStage.includes('irrig')) return ICONS.irrigation;
  if (normalizedStage.includes('fertil') || normalizedStage.includes('nutrient')) return ICONS.fertilization;
  if (normalizedStage.includes('weed')) return ICONS.weed_management;
  if (normalizedStage.includes('pest')) return ICONS.pest_monitoring;
  if (normalizedStage.includes('disease')) return ICONS.disease_monitoring;
  if (normalizedStage.includes('flower')) return ICONS.flowering;
  if (normalizedStage.includes('fruit')) return ICONS.fruiting;
  if (normalizedStage.includes('harvest')) return ICONS.harvesting;

  return ICONS.general;
};

export const CropRoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [activeRoadmap, setActiveRoadmap] = useState<CropRoadmapResponse | null>(null);
  const [roadmapInput, setRoadmapInput] = useState<CropRoadmapRequest | null>(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState<CropRoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [advisoryLoadingDay, setAdvisoryLoadingDay] = useState<number | null>(null);
  const [stageAdvisories, setStageAdvisories] = useState<Record<number, { advisory: string; weatherWarning?: string }>>({});

  // Form State
  const [crop, setCrop] = useState('');
  const [stateName, setStateName] = useState(user?.state || 'Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [landSize, setLandSize] = useState<number | ''>(2.5);
  const [landUnit, setLandUnit] = useState<'acres' | 'hectares'>('acres');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [soilType, setSoilType] = useState('');
  const [irrigation, setIrrigation] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // 1. Load active state from localStorage first for fast render
    const savedRoadmap = localStorage.getItem(ROADMAP_STORAGE_KEY);
    const savedInput = localStorage.getItem(ROADMAP_INPUT_KEY);
    const savedCompleted = localStorage.getItem('bharatfarm_roadmap_completed');

    if (savedRoadmap && savedInput) {
      try {
        setActiveRoadmap(JSON.parse(savedRoadmap));
        setRoadmapInput(JSON.parse(savedInput));
      } catch (e) {
        console.error('Failed to parse saved roadmap');
      }
    }

    if (savedCompleted) {
      try {
        setCompletedTasks(JSON.parse(savedCompleted));
      } catch (e) {
        console.error('Failed to parse completed tasks');
      }
    }

    // 2. Fetch server roadmaps asynchronously
    try {
      const res = await roadmapApi.listRoadmaps();
      if (res.success && res.data) {
        setSavedRoadmaps(res.data);
        // If no active roadmap, pick the first saved/seeded one
        if (!savedRoadmap && res.data.length > 0) {
          selectRoadmapItem(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load backend roadmaps:', err);
    }
  };

  const selectRoadmapItem = (item: CropRoadmapItem) => {
    const input: CropRoadmapRequest = {
      crop: item.crop,
      state: item.state,
      district: item.district,
      landSize: item.landSize,
      landUnit: item.landUnit,
      startDate: item.startDate,
      soilType: item.soilType,
      irrigation: item.irrigation
    };

    const resp: CropRoadmapResponse = {
      id: item.id,
      userId: item.userId,
      crop: item.crop,
      state: item.state,
      district: item.district,
      landSize: item.landSize,
      landUnit: item.landUnit,
      startDate: item.startDate,
      roadmap: item.activities,
      completedDays: item.completedDays
    };

    setActiveRoadmap(resp);
    setRoadmapInput(input);
    setCompletedTasks(item.completedDays || []);

    localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(resp));
    localStorage.setItem(ROADMAP_INPUT_KEY, JSON.stringify(input));
    localStorage.setItem('bharatfarm_roadmap_completed', JSON.stringify(item.completedDays || []));
  };

  const handleGenerate = async (e?: React.FormEvent, forceInput?: CropRoadmapRequest) => {
    if (e) e.preventDefault();

    const requestData: CropRoadmapRequest = forceInput || {
      crop,
      state: stateName,
      district,
      landSize: Number(landSize),
      landUnit,
      startDate,
      soilType: soilType || undefined,
      irrigation: irrigation || undefined
    };

    if (!requestData.crop || !requestData.state || !requestData.district || !requestData.landSize || !requestData.startDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await roadmapApi.generateRoadmap(requestData);

      if (res.success && res.data) {
        setActiveRoadmap(res.data);
        setRoadmapInput(requestData);
        const initialCompleted = res.data.completedDays || [];
        setCompletedTasks(initialCompleted);
        localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(res.data));
        localStorage.setItem(ROADMAP_INPUT_KEY, JSON.stringify(requestData));
        localStorage.setItem('bharatfarm_roadmap_completed', JSON.stringify(initialCompleted));
      } else {
        if (IS_DEVELOPMENT) console.error('[CropRoadmap] Generation failed', res.error);
        setError(res.error?.message || ROADMAP_FAILURE_MESSAGE);
      }
    } catch (generationError) {
      if (IS_DEVELOPMENT) console.error('[CropRoadmap] Generation request failed', generationError);
      setError(ROADMAP_FAILURE_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setActiveRoadmap(null);
    setRoadmapInput(null);
    setCompletedTasks([]);
    setStageAdvisories({});
    localStorage.removeItem(ROADMAP_STORAGE_KEY);
    localStorage.removeItem(ROADMAP_INPUT_KEY);
    localStorage.removeItem('bharatfarm_roadmap_completed');
  };

  const toggleTaskCompletion = async (dayIndex: number) => {
    const newCompleted = completedTasks.includes(dayIndex)
      ? completedTasks.filter(d => d !== dayIndex)
      : [...completedTasks, dayIndex];

    setCompletedTasks(newCompleted);
    localStorage.setItem('bharatfarm_roadmap_completed', JSON.stringify(newCompleted));

    if (activeRoadmap?.id && !activeRoadmap.id.startsWith('seeded-')) {
      try {
        await roadmapApi.updateProgress(activeRoadmap.id, newCompleted);
      } catch (err) {
        console.warn('Failed to sync progress with server:', err);
      }
    }
  };

  const fetchStageAdvisory = async (activity: any) => {
    if (!roadmapInput) return;
    setAdvisoryLoadingDay(activity.day);

    try {
      const res = await roadmapApi.getStageAdvisory({
        roadmapId: activeRoadmap?.id,
        crop: roadmapInput.crop,
        stage: activity.stage,
        day: activity.day,
        taskTitle: activity.title,
        state: roadmapInput.state,
        district: roadmapInput.district,
        startDate: roadmapInput.startDate
      });

      if (res.success && res.data) {
        const data = res.data;
        setStageAdvisories(prev => ({
          ...prev,
          [activity.day]: data
        }));
      }
    } catch (err) {
      console.error('Advisory failed:', err);
    } finally {
      setAdvisoryLoadingDay(null);
    }
  };

  const calculateProgress = () => {
    if (!activeRoadmap) return { percentage: 0, currentDay: 0, totalDays: 0 };

    const start = new Date(roadmapInput!.startDate);
    const today = new Date();

    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const totalDays = getRoadmapDuration(activeRoadmap.roadmap);

    let percentage = Math.round((currentDay / totalDays) * 100);
    percentage = Math.max(0, Math.min(100, percentage));

    return { percentage, currentDay: Math.max(1, currentDay), totalDays };
  };

  const renderForm = () => (
    <div className="roadmap-workspace">
      <Card title="🌱 Create Your Crop Roadmap" subtitle="Get a practical, day-wise AI farming schedule based on your specific conditions.">
        <form onSubmit={handleGenerate} className="roadmap-form">
          <div className="roadmap-form-grid">
            <div className="roadmap-select-field">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Crop *</label>
              <select
                value={crop}
                onChange={e => setCrop(e.target.value)}
                className="input-field"
                style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}
                required
              >
                <option value="">Choose a crop...</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Input label="Cultivation Start Date *" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <Input label="State *" value={stateName} onChange={e => setStateName(e.target.value)} required placeholder="e.g., Punjab" />
            <Input label="District *" value={district} onChange={e => setDistrict(e.target.value)} required placeholder="e.g., Ludhiana" />
            <Input label="Land Size *" type="number" step="0.1" min="0.1" value={landSize} onChange={e => setLandSize(e.target.value === '' ? '' : Number(e.target.value))} required placeholder="2.5" />

            <div className="roadmap-select-field">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Unit *</label>
              <select value={landUnit} onChange={e => setLandUnit(e.target.value as 'acres' | 'hectares')} className="input-field" style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>

            <div className="roadmap-select-field">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Soil Type (Optional)</label>
              <select value={soilType} onChange={e => setSoilType(e.target.value)} className="input-field" style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}>
                <option value="">Unknown / Skip</option>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="roadmap-select-field">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Irrigation (Optional)</label>
              <select value={irrigation} onChange={e => setIrrigation(e.target.value)} className="input-field" style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}>
                <option value="">Unknown / Skip</option>
                {IRRIGATION_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="roadmap-ai-note">
            <span className="material-symbols-outlined">auto_awesome</span>
            Your roadmap is generated from your crop, location, land size, and growing conditions.
          </div>

          {error && (
            <div className="alert-danger roadmap-form-error" role="alert">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="roadmap-ai-note" role="status" aria-live="polite">
              <Spinner />
              <span>{LOADING_MESSAGE}</span>
            </div>
          )}

          <div className="roadmap-form-actions">
            <Button type="submit" size="lg" disabled={isLoading} style={{ minWidth: '220px' }}>
              {isLoading ? (
                <>
                  <Spinner />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">route</span>
                  <span>Generate Roadmap</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Preset Demo Roadmaps Carousel / Picker */}
      {savedRoadmaps.length > 0 && (
        <Card title="🌾 Explore Demo & Saved Crop Schedules" subtitle="Click any pre-calculated roadmap to instantly load full cultivation guidance.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {savedRoadmaps.map(r => (
              <div
                key={r.id}
                onClick={() => selectRoadmapItem(r)}
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{getStageIcon(r.crop)}</span>
                  <span className="badge" style={{ fontSize: '0.65rem', background: r.isSeeded ? 'var(--surface-inset)' : 'var(--signal-lime)', color: r.isSeeded ? 'inherit' : '#000' }}>
                    {r.isSeeded ? 'DEMO' : 'SAVED'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.2rem 0' }}>{r.crop}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {r.district}, {r.state} {'\u2022'} {r.activities.length} steps
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderDashboard = () => {
    if (!activeRoadmap || !roadmapInput) return null;

    const { percentage, currentDay, totalDays } = calculateProgress();
    const allActivities = [...activeRoadmap.roadmap].sort((a, b) => a.day - b.day);

    let todayTasks = allActivities.filter(a => a.day === currentDay);
    if (todayTasks.length === 0 && allActivities.length > 0) {
      const pastUncompleted = allActivities.filter(a => a.day <= currentDay && !completedTasks.includes(a.day));
      if (pastUncompleted.length > 0) {
        todayTasks = [pastUncompleted[pastUncompleted.length - 1]];
      } else {
        const upcoming = allActivities.find(a => a.day > currentDay);
        if (upcoming) todayTasks = [upcoming];
      }
    }

    const upcomingTasks = allActivities.filter(a => a.day > currentDay).slice(0, 3);
    const currentStage = [...allActivities].reverse().find(a => a.day <= currentDay)?.stage || allActivities[0]?.stage || 'Planning';
    const stageCount = new Set(allActivities.map(a => a.stage).filter(Boolean)).size;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>

        {/* Header Actions */}
        <div className="page-header-banner">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{roadmapInput.crop} Cultivation Roadmap</h2>
            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              📍 {roadmapInput.district}, {roadmapInput.state} {'\u2022'} 📏 {roadmapInput.landSize} {roadmapInput.landUnit}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" onClick={handleReset} disabled={isLoading} style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF' }}>
              Change Crop
            </Button>
            <Button onClick={() => handleGenerate(undefined, roadmapInput)} disabled={isLoading} variant="primary">
              {isLoading ? <><Spinner /> Generating...</> : <><span className="material-symbols-outlined">refresh</span> Regenerate</>}
            </Button>
          </div>
        </div>


        {/* Live Weather & Advisory Banner */}
        {activeRoadmap.weatherAdvisory && (
          <div style={{ background: 'var(--surface-inset)', borderLeft: '4px solid var(--emerald-primary)', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--emerald-primary)', fontSize: '24px' }}>thermostat</span>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>Live Climate & Weather Status</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeRoadmap.weatherAdvisory}</span>
            </div>
          </div>
        )}

        <div className="grid-dashboard">
          {/* Main Content (Timeline) */}
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="📅 Day-wise Schedule" subtitle="Your complete farming timeline. Click 'Explain Step' for on-demand AI guidance.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', marginTop: '1rem' }}>
                <div style={{ position: 'absolute', left: '19px', top: '20px', bottom: '20px', width: '2px', background: 'var(--border-strong)', zIndex: 0 }} />

                {allActivities.map((activity, index) => {
                  const isCompleted = completedTasks.includes(activity.day);
                  const isToday = todayTasks.some(t => t.day === activity.day);
                  const isPast = activity.day < currentDay;
                  const stage = activity.stage || 'General';
                  const taskText = activity.task || '';
                  const inputs = Array.isArray(activity.inputs) ? activity.inputs : [];
                  const icon = getStageIcon(stage);
                  const advisoryData = stageAdvisories[activity.day];

                  return (
                    <div key={`${activity.day}-${index}`} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0', position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: isCompleted ? 'var(--success)' : (isToday ? 'var(--signal-lime)' : 'var(--surface-2)'),
                        border: `2px solid ${isCompleted ? 'var(--success)' : (isToday ? 'var(--signal-lime)' : 'var(--border-strong)')}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', color: isCompleted ? '#FFF' : (isToday ? '#000' : 'inherit'),
                        flexShrink: 0, boxShadow: isToday ? '0 0 0 4px var(--signal-lime-soft)' : 'none',
                        transition: 'var(--transition)'
                      }}>
                        {isCompleted ? <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span> : icon}
                      </div>

                      <div style={{
                        flex: 1, background: 'var(--surface-1)',
                        border: isToday ? '1px solid var(--signal-lime)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                        opacity: (isPast && !isCompleted) || isCompleted ? 0.75 : 1,
                        transition: 'var(--transition)',
                        boxShadow: isToday ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="badge" style={{ background: isToday ? 'var(--signal-lime)' : 'var(--surface-inset)', color: isToday ? '#000' : 'var(--text-primary)', fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                              DAY {activity.day} {'\u2022'} {formatActivityDate(activity.date)}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>{stage}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <Button variant="outline" size="sm" onClick={() => fetchStageAdvisory(activity)} disabled={advisoryLoadingDay === activity.day} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              {advisoryLoadingDay === activity.day ? <Spinner /> : <><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span> Explain</>}
                            </Button>
                            <Button variant={isCompleted ? 'outline' : 'primary'} size="sm" onClick={() => toggleTaskCompletion(activity.day)}
                              style={{ background: isCompleted ? 'transparent' : 'var(--surface-2)', border: isCompleted ? '1px solid var(--success)' : '1px solid var(--border-default)', color: isCompleted ? 'var(--success)' : 'var(--text-primary)', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                              {isCompleted ? 'Done' : 'Mark Done'}
                            </Button>
                          </div>
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{activity.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: inputs.length > 0 ? '0.5rem' : 0 }}>{taskText}</p>

                        {/* On-Demand AI Advisory Output */}
                        {advisoryData && (
                          <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.8rem', background: 'var(--surface-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>psychology</span>
                              <span>Shayak AI Stage Guidance</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.35 }}>{advisoryData.advisory}</p>
                            {advisoryData.weatherWarning && (
                              <div style={{ marginTop: '0.35rem', color: 'var(--warning)', fontWeight: 600 }}>{advisoryData.weatherWarning}</div>
                            )}
                          </div>
                        )}

                        {inputs.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inputs:</span>
                            {inputs.map(input => (
                              <span key={input} style={{ background: 'var(--surface-2)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)' }}>{input}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Progress Tracker */}
            <Card title="📈 Crop Progress">
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Day {currentDay} of ~{totalDays}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald-primary)' }}>{percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'var(--surface-inset)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--emerald-primary)', transition: 'width 1s ease-in-out' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <div className="inset-stat" style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>COMPLETED</span>
                    <strong style={{ fontSize: '1.1rem' }}>{completedTasks.length}/{allActivities.length}</strong>
                  </div>
                  <div className="inset-stat" style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>STAGE</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--emerald-primary)' }}>{currentStage}</strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* Platform Cross-Links (Schemes, Products, Pools) */}
            {activeRoadmap.relevantSchemes && activeRoadmap.relevantSchemes.length > 0 && (
              <Card title="🏛️ Relevant Govt Schemes">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {activeRoadmap.relevantSchemes.map((s, idx) => (
                    <a key={idx} href={s.link} style={{ fontSize: '0.85rem', color: 'var(--emerald-primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                      {s.title}
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {activeRoadmap.relevantProducts && activeRoadmap.relevantProducts.length > 0 && (
              <Card title="🛒 Recommended Inputs">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {activeRoadmap.relevantProducts.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.title}</span>
                      <span style={{ color: 'var(--emerald-primary)', fontWeight: 700 }}>₹{p.price}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Today's Task */}
            {todayTasks.length > 0 && (
              <Card
                title="🎯 Action Needed"
                subtitle={todayTasks[0].day === currentDay ? "Today's Task" : "Current/Pending Task"}
                style={{ border: '1px solid var(--signal-lime)', boxShadow: '0 4px 16px var(--signal-lime-soft)' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {todayTasks.map(task => {
                    const stage = task.stage || 'General';
                    const taskText = task.task || '';

                    return (
                      <div key={task.day} style={{ background: 'var(--surface-inset)', padding: '0.9rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{getStageIcon(stage)}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            DAY {task.day} {'\u2022'} {stage}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{task.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{taskText}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <Card title="⏭️ Upcoming">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {upcomingTasks.map(task => {
                    const daysAway = task.day - currentDay;
                    const timeText = daysAway === 1 ? 'Tomorrow' : `In ${daysAway} Days`;

                    return (
                      <div key={task.day} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{
                          width: '45px', height: '45px', borderRadius: '10px',
                          background: 'var(--surface-inset)', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>DAY</span>
                          <span style={{ fontSize: '1rem', fontWeight: 800 }}>{task.day}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>{timeText}</span>
                          <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</h5>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Summary */}
            <Card title="📋 Roadmap Summary">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Activities</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{allActivities.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stages Covered</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stageCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{totalDays} Days</span>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="crop-roadmap-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1480px', margin: '0 auto', width: '100%' }}>
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem', background: '#FFFFFF', color: '#0F5128' }}>AI Agricultural Intelligence</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Crop Cultivation Roadmap
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Generate a personalized, day-wise farming schedule optimized for your crop, land size, and local climate.
          </p>
        </div>
        <div style={{ opacity: 0.2 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '80px' }}>route</span>
        </div>
      </div>

      {activeRoadmap ? (
        renderDashboard()
      ) : (
        renderForm()
      )}
    </div>
  );
};

