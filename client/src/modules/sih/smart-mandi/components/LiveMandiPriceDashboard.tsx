import React, { useEffect, useMemo, useState } from 'react';
import { LiveMandiPriceRecord, SmartMandiService } from '../smartMandi.service.js';

const PAGE_SIZE = 20;
const LATEST = '__latest__';
const ALL = '';
const normalize = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase('en-IN');
const unique = (records: LiveMandiPriceRecord[], key: keyof LiveMandiPriceRecord) => [...new Set(records.map(r => String(r[key] ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en-IN'));
const currency = (price: number | null) => price === null ? '—' : `₹${price.toLocaleString('en-IN')}/Quintal`;

export const LiveMandiPriceDashboard: React.FC = () => {
  const [records, setRecords] = useState<LiveMandiPriceRecord[]>([]);
  const [fetchedAt, setFetchedAt] = useState('');
  const [latestDate, setLatestDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commodity, setCommodity] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [market, setMarket] = useState(ALL);
  const [date, setDate] = useState(LATEST);
  const [variety, setVariety] = useState(ALL);
  const [grade, setGrade] = useState(ALL);
  const [advanced, setAdvanced] = useState(false);
  const [sort, setSort] = useState('modal-desc');
  const [page, setPage] = useState(1);

  const load = async (force = false) => {
    if (force) setRefreshing(true); else setLoading(true);
    setError(null);
    try { const data = await SmartMandiService.getLivePrices(force); setRecords(data.records); setFetchedAt(data.fetchedAt); setLatestDate(data.latestArrivalDate || ''); setPage(1); }
    catch (err: any) { setError(err?.message || 'Unable to retrieve official mandi prices.'); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { void load(); }, []);
  const districts = useMemo(() => unique(records, 'district'), [records]);
  const scopedRecords = useMemo(() => records.filter(r =>
    (!commodity || normalize(r.commodity) === normalize(commodity)) &&
    (!district || normalize(r.district) === normalize(district)) &&
    (!market || normalize(r.market) === normalize(market))
  ), [records, commodity, district, market]);
  const markets = useMemo(() => unique(records.filter(r =>
    (!commodity || normalize(r.commodity) === normalize(commodity)) &&
    (!district || normalize(r.district) === normalize(district))
  ), 'market'), [records, commodity, district]);
  const varieties = useMemo(() => unique(scopedRecords, 'variety'), [scopedRecords]);
  const grades = useMemo(() => unique(scopedRecords.filter(r => !variety || normalize(r.variety) === normalize(variety)), 'grade'), [scopedRecords, variety]);
  const dates = useMemo(() => unique(records, 'arrivalDate'), [records]);
  const filtered = useMemo(() => {
    const selectedDate = date === LATEST ? normalize(latestDate) : normalize(date);
    return records.filter(r => (!commodity || normalize(r.commodity) === normalize(commodity)) && (!district || normalize(r.district) === normalize(district)) && (!market || normalize(r.market) === normalize(market)) && (!selectedDate || normalize(r.arrivalDate) === selectedDate) && (!variety || normalize(r.variety) === normalize(variety)) && (!grade || normalize(r.grade) === normalize(grade))).sort((a, b) => sort === 'modal-asc' ? (a.modalPrice ?? -1) - (b.modalPrice ?? -1) : sort === 'date-desc' ? normalize(b.arrivalDate).localeCompare(normalize(a.arrivalDate)) : (b.modalPrice ?? -1) - (a.modalPrice ?? -1));
  }, [records, commodity, district, market, date, latestDate, variety, grade, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const priceRecords = records.filter(r => r.modalPrice !== null);
  const highest = [...priceRecords].sort((a, b) => (b.modalPrice || 0) - (a.modalPrice || 0))[0];
  const lowest = [...priceRecords].sort((a, b) => (a.modalPrice || 0) - (b.modalPrice || 0))[0];
  const clear = () => { setCommodity(ALL); setDistrict(ALL); setMarket(ALL); setDate(LATEST); setVariety(ALL); setGrade(ALL); setSort('modal-desc'); setPage(1); };
  const updateCommodity = (value: string) => { setCommodity(value); setMarket(ALL); setVariety(ALL); setGrade(ALL); setPage(1); };
  const updateDistrict = (value: string) => { setDistrict(value); setMarket(ALL); setVariety(ALL); setGrade(ALL); setPage(1); };
  const updateMarket = (value: string) => { setMarket(value); setVariety(ALL); setGrade(ALL); setPage(1); };
  if (loading) return <div style={panel}>Loading official West Bengal mandi prices…</div>;
  if (error) return <div style={panel}><b>Official mandi prices are unavailable.</b><p>{error}</p><button style={primary} onClick={() => void load(true)}>Try again</button></div>;
  return <section style={{ display: 'grid', gap: 14 }}>
    <div style={{ ...panel, background: 'linear-gradient(120deg, #F0FDF4 0%, #FFFFFF 56%, #ECFDF5 100%)', borderColor: '#BBF7D0' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 900, letterSpacing: '.04em' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A' }} />OFFICIAL DAILY DATA</div><h2 style={{ margin: '8px 0 2px', color: '#14532D', fontSize: 26 }}>Live Mandi Prices</h2><p style={{ margin: '5px 0', color: '#475569' }}>West Bengal agricultural market intelligence, powered by official reported prices.</p><small style={{ color: '#64748B' }}>Source: Government of India — Ministry of Agriculture & Farmers Welfare, <a href="https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noreferrer">data.gov.in</a>.</small></div><button style={{ ...primary, minWidth: 112, alignSelf: 'center' }} disabled={refreshing} onClick={() => void load(true)}>{refreshing ? 'Refreshing…' : '↻ Refresh'}</button></div><div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 14 }}><span style={metaChip}>Latest report: <b>{latestDate || '—'}</b></span><span style={metaChip}>Last fetched: <b>{fetchedAt ? new Date(fetchedAt).toLocaleString('en-IN') : '—'}</b></span><span style={metaChip}>{records.length} verified records</span></div></div>
    <div style={grid}>{stat('Total Price Records', records.length)}{stat('Districts Covered', districts.length)}{stat('Markets Covered', unique(records, 'market').length)}{stat('Commodities Listed', unique(records, 'commodity').length)}</div>
    <div style={{ ...panel, ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))' }}><Insight title="Highest modal price" record={highest} color="#15803D"/><Insight title="Lowest modal price" record={lowest} color="#B45309"/><div style={{ borderLeft: '1px solid #D1FAE5', paddingLeft: 14 }}><small style={{ color:'#64748B', fontWeight:800 }}>MARKET COVERAGE</small><div style={{ fontWeight:800 }}>{unique(records, 'market').length} reported markets</div><div style={{ color:'#475569', fontSize:12 }}>{districts.length} districts · {unique(records, 'commodity').length} commodities</div></div></div>
    <SmartMandiFinder records={records} commodities={unique(records, 'commodity')} districts={districts} />
    <div style={{ ...panel, borderColor: '#D1FAE5' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}><div><b style={{ color: '#14532D' }}>Find a market price</b><div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>Choose from available official records only.</div></div><span style={{ color: '#15803D', fontSize: 12, fontWeight: 800 }}>{filtered.length} records currently match</span></div><div style={{ ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))' }}><Picker label="Commodity" all="All Commodities" value={commodity} options={unique(records, 'commodity')} onChange={updateCommodity}/><Picker label="District" all="All Districts" value={district} options={districts} onChange={updateDistrict}/><Picker label="Market" all="All Markets" value={market} options={markets} onChange={updateMarket}/><label style={label}>Reporting Date<select style={control} value={date} onChange={e => { setDate(e.target.value); setPage(1); }}><option value={LATEST}>Latest Available</option>{dates.map(v => <option key={v}>{v}</option>)}</select></label><label style={label}>Sort By<select style={control} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="modal-desc">Modal Price: High to Low</option><option value="modal-asc">Modal Price: Low to High</option><option value="date-desc">Reporting Date</option></select></label></div><div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}><button style={secondary} onClick={() => setAdvanced(v => !v)}>{advanced ? 'Hide Advanced Filters' : 'Advanced Filters'}</button><button style={{ ...secondary, borderColor: '#86EFAC' }} onClick={clear}>Clear Filters</button></div>{advanced && <div style={{ ...grid, marginTop: 12, paddingTop: 12, borderTop: '1px solid #D1FAE5' }}><Picker label="Variety" all="All Varieties" value={variety} options={varieties} onChange={v => { setVariety(v); setGrade(ALL); setPage(1); }}/><Picker label="Grade" all="All Grades" value={grade} options={grades} onChange={v => { setGrade(v); setPage(1); }}/></div>}</div>
    <div style={{ ...panel, overflowX: 'auto', padding: 0 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}><div><b style={{ color: '#14532D' }}>Market price records</b><div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{filtered.length} matching records · prices per Quintal</div></div><span style={{ padding: '4px 8px', background: '#F0FDF4', borderRadius: 999, color: '#166534', fontSize: 11, fontWeight: 800 }}>WEST BENGAL</span></div><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}><thead><tr>{['Commodity','Market','District','Min Price','Max Price','Modal Price','Reporting Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={`${r.district}-${r.market}-${r.commodity}-${r.arrivalDate}-${i}`} style={{ background: i % 2 ? '#FCFDFD' : '#fff' }}><td style={{ ...td, fontWeight: 800 }}>{r.commodity}</td><td style={td}>{r.market}</td><td style={td}>{r.district}</td><td style={td}>{currency(r.minPrice)}</td><td style={td}>{currency(r.maxPrice)}</td><td style={{ ...td, color: '#15803D', fontWeight: 900 }}>{currency(r.modalPrice)}</td><td style={td}>{r.arrivalDate || '—'}</td></tr>)}</tbody></table></div>{!rows.length && <p style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>No records match these filters. Try Clear Filters or another crop.</p>}<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #E2E8F0' }}><button style={secondary} disabled={page === 1} onClick={() => setPage(v => v - 1)}>← Previous</button><span style={{ fontSize: 13, fontWeight: 700 }}>Page {page} of {pageCount}</span><button style={secondary} disabled={page === pageCount} onClick={() => setPage(v => v + 1)}>Next →</button></div></div>
  </section>;
};

const Picker: React.FC<{label:string; all:string; value:string; options:string[]; onChange:(value:string)=>void}> = ({ label: name, all, value, options, onChange }) => <label style={label}>{name}<select value={value} style={control} onChange={e => onChange(e.target.value)}><option value="">{all}</option>{options.map(v => <option key={v} value={v}>{v}</option>)}</select></label>;
type FinderRow = LiveMandiPriceRecord & { varietyLabel: string };
const SmartMandiFinder: React.FC<{ records: LiveMandiPriceRecord[]; commodities: string[]; districts: string[] }> = ({ records, commodities, districts }) => {
  const [commodity, setCommodity] = useState('');
  const [district, setDistrict] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const finderRows = useMemo<FinderRow[]>(() => {
    if (!submitted || !commodity || !district) return [];
    const matches = records.filter(record => normalize(record.commodity) === normalize(commodity) && normalize(record.district) === normalize(district));
    const latestByMarket = new Map<string, string>();
    for (const record of matches) {
      const current = latestByMarket.get(normalize(record.market));
      if (!current || dateStamp(record.arrivalDate) > dateStamp(current)) latestByMarket.set(normalize(record.market), record.arrivalDate);
    }
    const grouped = new Map<string, FinderRow>();
    for (const record of matches) {
      if (record.arrivalDate !== latestByMarket.get(normalize(record.market))) continue;
      const key = `${normalize(record.market)}|${normalize(record.variety)}|${normalize(record.grade)}`;
      const current = grouped.get(key);
      if (!current || (record.modalPrice ?? -1) > (current.modalPrice ?? -1)) grouped.set(key, { ...record, varietyLabel: [record.variety, record.grade].filter(value => value && value !== '—').join(' · ') || 'Variety not reported' });
    }
    return [...grouped.values()].sort((a, b) => (b.modalPrice ?? -1) - (a.modalPrice ?? -1));
  }, [records, commodity, district, submitted]);
  return <section style={{ ...panel, borderColor:'#86EFAC' }}><div style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:12 }}><div><div style={{ display:'inline-flex', padding:'4px 8px', borderRadius:999, background:'#DCFCE7', color:'#166534', fontSize:11, fontWeight:900 }}>SMART MANDI FINDER</div><h3 style={{ margin:'7px 0 2px', color:'#14532D' }}>Find the best reported mandi price</h3><div style={{ color:'#64748B', fontSize:13 }}>Compare markets by latest available modal price for your crop and district.</div></div></div><div style={{ ...grid, gridTemplateColumns:'minmax(210px,2fr) minmax(170px,1fr) auto', alignItems:'end' }}><label style={label}>Crop / Commodity<input list="finder-commodities" value={commodity} placeholder="Search crop e.g. Potato, Rice" style={control} onChange={e => { setCommodity(e.target.value); setSubmitted(false); }}/><datalist id="finder-commodities">{commodities.map(value => <option key={value} value={value}/>)}</datalist></label><Picker label="District" all="Select district" value={district} options={districts} onChange={value => { setDistrict(value); setSubmitted(false); }}/><button style={{ ...primary, minHeight:38 }} disabled={!commodity || !district} onClick={() => setSubmitted(true)}>Find Best Mandi</button></div>{submitted && !finderRows.length && <div style={{ marginTop:14, padding:14, background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, color:'#92400E' }}>No latest mandi records were found for this crop and district. Try another official commodity or district.</div>}{submitted && finderRows.length > 0 && <div style={{ marginTop:16, overflowX:'auto' }}><div style={{ color:'#166534', fontSize:13, fontWeight:800, marginBottom:8 }}>{finderRows.length} matching mandi {finderRows.length === 1 ? 'record' : 'records'} · ranked by modal price</div><table style={{ width:'100%', minWidth:730, borderCollapse:'collapse' }}><thead><tr>{['Rank','Mandi / Market','District','Min Price','Max Price','Modal Price','Reporting Date'].map(head => <th style={th} key={head}>{head}</th>)}</tr></thead><tbody>{finderRows.map((row, index) => <tr key={`${row.market}-${row.varietyLabel}-${row.arrivalDate}`} style={{ background:index === 0 ? '#F0FDF4' : '#fff' }}><td style={{ ...td, fontWeight:900, color:index === 0 ? '#15803D' : '#475569' }}>#{index + 1}</td><td style={td}><b>{row.market}</b><div style={{ fontSize:12, color:'#64748B' }}>{row.varietyLabel}</div>{index === 0 && <span style={{ display:'inline-block', marginTop:4, padding:'3px 6px', borderRadius:999, background:'#BBF7D0', color:'#166534', fontSize:10, fontWeight:900 }}>BEST PRICE FOUND</span>}</td><td style={td}>{row.district}</td><td style={td}>{currency(row.minPrice)}</td><td style={td}>{currency(row.maxPrice)}</td><td style={{ ...td, color:'#15803D', fontWeight:900 }}>{currency(row.modalPrice)}</td><td style={td}>{row.arrivalDate || '—'}</td></tr>)}</tbody></table><p style={{ margin:'10px 0 0', color:'#64748B', fontSize:12 }}>Prices are based on the latest reported mandi data and may change. A higher modal price does not guarantee the highest farmer profit after transport, quality, and other costs.</p></div>}</section>;
};
const dateStamp = (value: string) => { const [day, month, year] = value.split('/').map(Number); return Date.UTC(year || 0, (month || 1) - 1, day || 1); };
const Insight: React.FC<{title:string; record?:LiveMandiPriceRecord; color:string}> = ({ title, record, color }) => <div><small style={{ color:'#64748B', fontWeight:800 }}>{title.toUpperCase()}</small><div style={{ fontWeight:800 }}>{record ? `${record.commodity} · ${record.market}` : '—'}</div><div style={{ color, fontWeight:900 }}>{record ? currency(record.modalPrice) : '—'}</div></div>;
const stat = (name:string, value:number) => <div style={{ ...panel, padding:12 }}><small style={{ color:'#64748B', fontWeight:700 }}>{name}</small><div style={{ color:'#14532D', fontSize:22, fontWeight:900 }}>{value.toLocaleString('en-IN')}</div></div>;
const panel:React.CSSProperties = { background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'1rem', boxShadow:'0 2px 8px rgba(15,23,42,.04)' };
const grid:React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 };
const label:React.CSSProperties = { display:'grid', gap:5, fontSize:12, fontWeight:800, color:'#475569' };
const control:React.CSSProperties = { width:'100%', boxSizing:'border-box', padding:'9px 10px', border:'1px solid #CBD5E1', borderRadius:8, background:'#F8FAFC' };
const primary:React.CSSProperties = { padding:'9px 13px', border:0, borderRadius:8, background:'#15803D', color:'#fff', fontWeight:800, cursor:'pointer' };
const secondary:React.CSSProperties = { padding:'8px 11px', border:'1px solid #BBF7D0', borderRadius:8, background:'#fff', color:'#166534', fontWeight:800, cursor:'pointer' };
const th:React.CSSProperties = { padding:10, textAlign:'left', color:'#475569', borderBottom:'1px solid #E2E8F0', whiteSpace:'nowrap' };
const td:React.CSSProperties = { padding:10, borderBottom:'1px solid #F1F5F9', verticalAlign:'top' };
const metaChip:React.CSSProperties = { padding:'5px 8px', borderRadius:999, background:'#fff', border:'1px solid #D1FAE5', color:'#475569', fontSize:12 };
