import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { WAREHOUSE, BRAVO_MARKETS, ZONE_COLORS } from '../data/bravoMarkets';
import {
  Zap, Navigation, RefreshCw, ChevronDown, ChevronUp,
  Truck, Clock, MapPin, CheckCircle, AlertTriangle, Wifi,
} from 'lucide-react';

// ─── Fix Leaflet icon paths ────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom icons ──────────────────────────────────────────────────────────
const warehouseIcon = L.divIcon({
  className: '',
  html: `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#C8102E,#ff1a3c);border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 16px rgba(200,16,46,0.7);">🏭</div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

const makeMarketIcon = (zone, label, active) => L.divIcon({
  className: '',
  html: `<div style="
    width:${active ? 34 : 28}px;height:${active ? 34 : 28}px;border-radius:50%;
    background:${ZONE_COLORS[zone] || '#00A651'};
    border:2px solid ${active ? '#fff' : 'rgba(255,255,255,0.6)'};
    display:flex;align-items:center;justify-content:center;
    font-size:10px;font-weight:700;color:#fff;
    box-shadow:0 2px ${active ? 14 : 6}px ${ZONE_COLORS[zone]}90;
    ${active ? 'transform:scale(1.1);' : ''}
  ">${label}</div>`,
  iconSize: [active ? 34 : 28, active ? 34 : 28],
  iconAnchor: [active ? 17 : 14, active ? 17 : 14],
});

// ─── Fit map to bounds ────────────────────────────────────────────────────
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
}

// ─── OSRM Trip API call ────────────────────────────────────────────────────
// Uses public OSRM demo server — real Azerbaijan road network, no API key needed
async function fetchOsrmRoute(points) {
  // OSRM accepts lng,lat order
  const coordStr = points.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/trip/v1/driving/${coordStr}` +
    `?roundtrip=true&source=first&geometries=geojson&overview=full&steps=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = await res.json();
  if (data.code !== 'Ok') throw new Error(data.message || 'OSRM error');

  // Extract road geometry [lat, lng] for Leaflet Polyline
  const geoCoords = data.trips[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const distKm    = Math.round(data.trips[0].distance / 1000);
  const durMin    = Math.round(data.trips[0].duration / 60);
  const durHr     = (durMin / 60).toFixed(1);

  // Map optimised waypoint order back to our points array
  // data.waypoints[i].waypoint_index = position in optimised trip for input point i
  const ordered = new Array(points.length);
  data.waypoints.forEach((wp, inputIdx) => {
    ordered[wp.waypoint_index] = points[inputIdx];
  });

  return { geoCoords, distKm, durHr, durMin, ordered };
}

// ─── Main component ────────────────────────────────────────────────────────
export default function RouteMapPanel() {
  const [routeResult, setRouteResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError]             = useState(null);
  const [selectedMarkets, setSelected] = useState(new Set(BRAVO_MARKETS.map(m => m.id)));
  const [activeStop, setActiveStop]   = useState(null);
  const [showList, setShowList]       = useState(true);
  const [filterZone, setFilterZone]   = useState('ALL');

  const zones = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F'];
  const zoneNames = { ALL:'All', A:'Central', B:'North-West', C:'East', D:'Far / North', E:'Absheron', F:'Sumgait' };

  const visibleMarkets = BRAVO_MARKETS.filter(m => filterZone === 'ALL' || m.zone === filterZone);

  const toggleMarket = id => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setRouteResult(null); setError(null);
  };

  const toggleZoneAll = () => {
    const allSel = visibleMarkets.every(m => selectedMarkets.has(m.id));
    setSelected(prev => {
      const n = new Set(prev);
      visibleMarkets.forEach(m => allSel ? n.delete(m.id) : n.add(m.id));
      return n;
    });
    setRouteResult(null); setError(null);
  };

  const handleCalculate = async () => {
    setCalculating(true); setError(null); setRouteResult(null);
    const targets = BRAVO_MARKETS.filter(m => selectedMarkets.has(m.id));
    const points  = [WAREHOUSE, ...targets];
    try {
      const result = await fetchOsrmRoute(points);
      // Build ordered market list (skip warehouse at index 0)
      const orderedMarkets = result.ordered
        .filter(p => p && p.id !== WAREHOUSE.id)
        .map((p, i) => ({ ...p, stopIndex: i + 1 }));
      setRouteResult({
        geoCoords:  result.geoCoords,
        distKm:     result.distKm,
        durHr:      result.durHr,
        durMin:     result.durMin,
        fuelCost:   Math.round(result.distKm * 0.18),
        stops:      targets.length,
        orderedMarkets,
      });
    } catch (e) {
      setError(`Failed to connect to OSRM server: ${e.message}`);
    } finally {
      setCalculating(false);
    }
  };

  // routeIndexMap: market id → stop order number
  const routeIndexMap = {};
  if (routeResult) {
    routeResult.orderedMarkets.forEach(m => { routeIndexMap[m.id] = m.stopIndex; });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Panel Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)', borderRadius: 'var(--radius) var(--radius) 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,rgba(200,16,46,0.2),rgba(0,166,81,0.2))',
            border: '1px solid rgba(0,166,81,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Navigation size={18} color="var(--green)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Optimal Route Planning</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              <Wifi size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Real roads — OSRM Navigator Engine (OpenStreetMap)
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            disabled={calculating || selectedMarkets.size === 0}
            style={{ gap: 6, minWidth: 170, justifyContent: 'center' }}
          >
            {calculating ? (
              <>
                <div style={{
                  width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                Finding route...
              </>
            ) : (
              <><Zap size={14} /> AI Navigator Route</>
            )}
          </button>
          {routeResult && (
            <button className="btn btn-ghost" onClick={() => { setRouteResult(null); setError(null); }}>
              <RefreshCw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          padding: '10px 20px', background: 'rgba(200,16,46,0.1)',
          borderBottom: '1px solid rgba(200,16,46,0.3)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ff6b6b',
        }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Route Summary Bar ── */}
      {routeResult && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg,rgba(0,166,81,0.09),rgba(200,16,46,0.05))',
        }}>
          {[
            { icon: <Navigation size={14}/>, label: 'Real Road Distance', value: `${routeResult.distKm} km`,       color: 'var(--green)' },
            { icon: <Clock size={14}/>,      label: 'Driving Time',   value: `${routeResult.durHr} hrs`,      color: '#3b82f6' },
            { icon: <MapPin size={14}/>,     label: 'Market Count',        value: `${routeResult.stops} stops`, color: '#eab308' },
            { icon: <Truck size={14}/>,      label: 'Fuel Cost',      value: `$${routeResult.fuelCost}`,       color: '#f97316' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${item.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color, flexShrink: 0,
              }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: item.color }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Map + Sidebar ── */}
      <div style={{ display: 'flex', height: 560 }}>

        {/* Sidebar */}
        <div style={{
          width: 275, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg2)', overflowY: 'hidden',
        }}>
          {/* Zone filter pills */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
              Zone Filter
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {zones.map(z => (
                <button key={z} onClick={() => setFilterZone(z)} style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${filterZone===z ? (ZONE_COLORS[z]||'var(--green)') : 'var(--border)'}`,
                  background: filterZone===z ? `${ZONE_COLORS[z]||'var(--green)'}22` : 'var(--bg3)',
                  color: filterZone===z ? (ZONE_COLORS[z]||'var(--green)') : 'var(--text2)',
                  transition: 'all 0.15s',
                }}>
                  {z==='ALL' ? 'All' : `${z}`}
                </button>
              ))}
            </div>
          </div>

          {/* Count + toggle all */}
          <div style={{
            padding: '7px 12px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>
              {visibleMarkets.filter(m => selectedMarkets.has(m.id)).length}/{visibleMarkets.length} selected
            </span>
            <button className="btn btn-ghost btn-sm" onClick={toggleZoneAll} style={{ fontSize: 11, padding: '3px 8px' }}>
              {visibleMarkets.every(m => selectedMarkets.has(m.id)) ? 'Deselect' : 'Select All'}
            </button>
          </div>

          {/* Market list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {visibleMarkets.map(m => {
              const isSelected = selectedMarkets.has(m.id);
              const routeIdx   = routeIndexMap[m.id];
              const isActive   = activeStop === m.id;
              return (
                <div key={m.id}
                  onClick={() => toggleMarket(m.id)}
                  onMouseEnter={() => setActiveStop(m.id)}
                  onMouseLeave={() => setActiveStop(null)}
                  style={{
                    padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: isActive ? 'var(--bg3)' : 'transparent',
                    borderBottom: '1px solid rgba(42,47,66,0.4)',
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: ZONE_COLORS[m.zone], flexShrink: 0 }} />
                  <div style={{
                    width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${isSelected ? ZONE_COLORS[m.zone] : 'var(--border)'}`,
                    background: isSelected ? ZONE_COLORS[m.zone] : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <CheckCircle size={9} color="#fff" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{m.district} · Zone {m.zone}</div>
                  </div>
                  {routeIdx && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: ZONE_COLORS[m.zone],
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, flexShrink: 0,
                    }}>{routeIdx}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer center={[40.4093, 49.8671]} zoom={11} style={{ width:'100%', height:'100%' }} zoomControl>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-fit when route ready */}
            {routeResult && <FitBounds coords={routeResult.geoCoords} />}

            {/* REAL ROAD polyline from OSRM */}
            {routeResult && (
              <Polyline
                positions={routeResult.geoCoords}
                pathOptions={{ color: '#00A651', weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }}
              />
            )}

            {/* Warehouse */}
            <Marker position={[WAREHOUSE.lat, WAREHOUSE.lng]} icon={warehouseIcon}>
              <Popup>
                <div style={{ fontFamily:'Inter,sans-serif', minWidth:180 }}>
                  <div style={{ fontWeight:700, color:'#C8102E', marginBottom:4 }}>🏭 {WAREHOUSE.name}</div>
                  <div style={{ fontSize:11, color:'#666' }}>{WAREHOUSE.address}</div>
                  {routeResult && <div style={{ marginTop:6, fontSize:11, color:'#00A651', fontWeight:600 }}>✅ Route starting point</div>}
                </div>
              </Popup>
            </Marker>

            {/* Bravo Market markers */}
            {BRAVO_MARKETS.filter(m => selectedMarkets.has(m.id)).map(m => {
              const idx   = routeIndexMap[m.id];
              const isAct = activeStop === m.id;
              return (
                <Marker key={m.id} position={[m.lat, m.lng]}
                  icon={makeMarketIcon(m.zone, idx || '●', isAct)}
                  eventHandlers={{ mouseover:()=>setActiveStop(m.id), mouseout:()=>setActiveStop(null) }}
                >
                  <Popup>
                    <div style={{ fontFamily:'Inter,sans-serif', minWidth:200 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:ZONE_COLORS[m.zone] }} />
                        <strong style={{ fontSize:13 }}>{m.name}</strong>
                      </div>
                      <div style={{ fontSize:11, color:'#666', marginBottom:3 }}>{m.address}</div>
                      <div style={{ fontSize:11, color:'#888' }}>Zone {m.zone} · {m.district}</div>
                      {idx && <div style={{ marginTop:6, fontSize:12, fontWeight:700, color: ZONE_COLORS[m.zone] }}>#{idx}. stop</div>}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Calculating overlay */}
          {calculating && (
            <div style={{
              position:'absolute', inset:0, background:'rgba(13,15,20,0.78)',
              backdropFilter:'blur(5px)', zIndex:1000,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
            }}>
              <div style={{
                width:68, height:68, borderRadius:'50%',
                background:'linear-gradient(135deg,rgba(0,166,81,0.2),rgba(200,16,46,0.2))',
                border:'2px solid rgba(0,166,81,0.5)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Navigation size={30} color="var(--green)" className="pulse" />
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Calculating Route via Real Roads</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>
                  Fetching road data from OSRM for {selectedMarkets.size} Bravo Markets...
                </div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>
                  (Azerbaijan road network • OpenStreetMap data)
                </div>
              </div>
              <div className="ai-thinking">
                <div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/>
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{
            position:'absolute', bottom:16, right:16, zIndex:900,
            background:'rgba(13,15,20,0.92)', border:'1px solid var(--border)',
            borderRadius:10, padding:'10px 14px', backdropFilter:'blur(8px)',
          }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>Zone</div>
            {Object.entries(ZONE_COLORS).map(([z, color]) => (
              <div key={z} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                <span style={{ fontSize:11, color:'var(--text2)' }}>{z} – {zoneNames[z]}</span>
              </div>
            ))}
            {routeResult && (
              <div style={{ marginTop:6, paddingTop:6, borderTop:'1px solid var(--border)', fontSize:11, color:'var(--green)', display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:18, height:3, background:'var(--green)', borderRadius:2 }}/>
                Real road route
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stop timeline ── */}
      {routeResult && (
        <div style={{ borderTop:'1px solid var(--border)', background:'var(--bg2)' }}>
          <button onClick={() => setShowList(v => !v)} style={{
            width:'100%', padding:'10px 20px', background:'none', border:'none',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            cursor:'pointer', color:'var(--text)',
          }}>
            <span style={{ fontWeight:600, fontSize:13 }}>
              <Truck size={13} style={{ marginRight:6, verticalAlign:'middle' }} />
              Delivery Order (real road) — {routeResult.stops} stops · {routeResult.distKm} km · {routeResult.durHr} hrs
            </span>
            {showList ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>

          {showList && (
            <div style={{ display:'flex', overflowX:'auto', padding:'0 16px 16px', alignItems:'center' }}>
              {/* Start */}
              <div style={{ display:'flex', alignItems:'center', gap:0, flexShrink:0 }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%',
                  background:'linear-gradient(135deg,#C8102E,#ff1a3c)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16, border:'2px solid #fff',
                }}>🏭</div>
                <div style={{ width:28, height:3, background:'var(--green)', flexShrink:0 }}/>
              </div>

              {routeResult.orderedMarkets.map((m, i) => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <div style={{
                      width:28, height:28, borderRadius:'50%',
                      background:ZONE_COLORS[m.zone], color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:700, border:'2px solid rgba(255,255,255,0.3)',
                    }}>{i+1}</div>
                    <div style={{ fontSize:9, color:'var(--text3)', maxWidth:65, textAlign:'center', lineHeight:1.2, marginTop:2 }}>
                      {m.name.replace('Bravo – ','')}
                    </div>
                  </div>
                  {i < routeResult.orderedMarkets.length-1 && (
                    <div style={{ width:22, height:3, background:'var(--green)', opacity:0.5, flexShrink:0 }}/>
                  )}
                </div>
              ))}

              {/* Return */}
              <div style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                <div style={{ width:28, height:3, background:'var(--red)', opacity:0.5 }}/>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background:'rgba(200,16,46,0.2)', border:'2px solid var(--red)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                }}>🏭</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
