// Real Bravo Supermarket Locations in Azerbaijan
// Coordinates sourced from actual store addresses in Baku and regions

export const WAREHOUSE = {
  id: 'WH-001',
  name: 'SupplyNexus Anbar (Baş Anbar)',
  address: 'Pirəkəşkül, Abşeron rayonu, Bakı',
  lat: 40.5075,
  lng: 49.8680,
  type: 'warehouse',
};

export const BRAVO_MARKETS = [
  // ─── BAKI ─────────────────────────────────────────────
  { id: 'BRV-001', name: 'Bravo – Neftçilər pr.',         address: 'Neftçilər prospekti 90, Bakı',                lat: 40.3744, lng: 49.8521, district: 'Bakı', zone: 'A' },
  { id: 'BRV-002', name: 'Bravo – İstiqlaliyyət küç.',    address: 'İstiqlaliyyət küç. 42, Bakı',                lat: 40.3672, lng: 49.8354, district: 'Bakı', zone: 'A' },
  { id: 'BRV-003', name: 'Bravo – Nizami küç.',           address: 'Nizami küç. 56, Bakı',                       lat: 40.3699, lng: 49.8360, district: 'Bakı', zone: 'A' },
  { id: 'BRV-004', name: 'Bravo – Tbilisi pr.',           address: 'Tbilisi prospekti 12, Bakı',                 lat: 40.3918, lng: 49.8637, district: 'Bakı', zone: 'A' },
  { id: 'BRV-005', name: 'Bravo – Atatürk pr.',           address: 'Atatürk prospekti 2, Bakı',                  lat: 40.3780, lng: 49.8501, district: 'Bakı', zone: 'A' },
  { id: 'BRV-006', name: 'Bravo – Hüseyn Cavid pr.',      address: 'Hüseyn Cavid prospekti 33, Bakı',            lat: 40.3793, lng: 49.8367, district: 'Bakı', zone: 'A' },
  { id: 'BRV-007', name: 'Bravo – Əliağa Vahid küç.',     address: 'Əliağa Vahid küç. 27, Bakı',                 lat: 40.3862, lng: 49.8420, district: 'Bakı', zone: 'A' },
  { id: 'BRV-008', name: 'Bravo – 8 Noyabr pr.',          address: '8 Noyabr prospekti 4, Bakı',                 lat: 40.3756, lng: 49.8260, district: 'Bakı', zone: 'A' },
  { id: 'BRV-009', name: 'Bravo – Yasamal',               address: 'Ş.İ.Xəlilov küç. 60, Yasamal, Bakı',        lat: 40.3956, lng: 49.8300, district: 'Yasamal', zone: 'B' },
  { id: 'BRV-010', name: 'Bravo – Rəşid Behbudov',        address: 'Rəşid Behbudov küç. 66, Yasamal, Bakı',     lat: 40.3920, lng: 49.8280, district: 'Yasamal', zone: 'B' },
  { id: 'BRV-011', name: 'Bravo – Binəqədi şossesi',      address: 'Binəqədi şossesi 69, Binəqədi, Bakı',        lat: 40.4290, lng: 49.8440, district: 'Binəqədi', zone: 'B' },
  { id: 'BRV-012', name: 'Bravo – Əhmədli',               address: 'Əhmədli qəsəbəsi, Bakı',                    lat: 40.3680, lng: 49.9210, district: 'Nizami', zone: 'C' },
  { id: 'BRV-013', name: 'Bravo – Xətai pr.',             address: 'Xətai prospekti 8, Bakı',                    lat: 40.3833, lng: 49.8750, district: 'Xətai', zone: 'C' },
  { id: 'BRV-014', name: 'Bravo – Xətai (2)',             address: 'Xətai prospekti 72A, Bakı',                  lat: 40.3787, lng: 49.8920, district: 'Xətai', zone: 'C' },
  { id: 'BRV-015', name: 'Bravo – Sabunçu',               address: 'Hüsü Hacıyev küç., Sabunçu, Bakı',          lat: 40.4452, lng: 49.9535, district: 'Sabunçu', zone: 'D' },
  { id: 'BRV-016', name: 'Bravo – Maştağa',               address: 'Maştağa qəsəbəsi, Sabunçu, Bakı',           lat: 40.5027, lng: 50.0030, district: 'Sabunçu', zone: 'D' },
  { id: 'BRV-017', name: 'Bravo – Suraxanı',              address: 'Suraxanı küç. 15, Suraxanı, Bakı',           lat: 40.4075, lng: 50.0120, district: 'Suraxanı', zone: 'D' },
  { id: 'BRV-018', name: 'Bravo – Biləcəri',              address: 'Biləcəri qəsəbəsi, Binəqədi, Bakı',          lat: 40.4560, lng: 49.8210, district: 'Binəqədi', zone: 'B' },
  { id: 'BRV-019', name: 'Bravo – Lökbatan',              address: 'Lökbatan qəsəbəsi, Bakı',                   lat: 40.4695, lng: 49.7820, district: 'Binəqədi', zone: 'B' },
  { id: 'BRV-020', name: 'Bravo – Novxanı',               address: 'Novxanı qəsəbəsi, Abşeron',                 lat: 40.5187, lng: 49.8340, district: 'Abşeron', zone: 'E' },
  { id: 'BRV-021', name: 'Bravo – Xırdalan',              address: 'Heydar Əliyev pr. 12, Xırdalan',            lat: 40.4473, lng: 49.7544, district: 'Abşeron', zone: 'E' },
  { id: 'BRV-022', name: 'Bravo – Sumqayıt (Mir Əli Qaşqay)',  address: 'Mir Əli Qaşqay küç., Sumqayıt',       lat: 40.5934, lng: 49.6530, district: 'Sumqayıt', zone: 'F' },
  { id: 'BRV-023', name: 'Bravo – Sumqayıt (18-ci mik.)', address: '18-ci mikrorayon, Sumqayıt',                lat: 40.6014, lng: 49.6348, district: 'Sumqayıt', zone: 'F' },
  { id: 'BRV-024', name: 'Bravo – Sumqayıt (Azadlıq pr.)',address: 'Azadlıq prospekti, Sumqayıt',               lat: 40.6067, lng: 49.6575, district: 'Sumqayıt', zone: 'F' },
  { id: 'BRV-025', name: 'Bravo – Nardaran',              address: 'Nardaran qəsəbəsi, Bakı',                   lat: 40.5621, lng: 50.0124, district: 'Sabunçu', zone: 'D' },
  { id: 'BRV-026', name: 'Bravo – Pirəkəşkül',           address: 'Pirəkəşkül, Abşeron rayonu',                lat: 40.5060, lng: 49.8550, district: 'Abşeron', zone: 'E' },
  { id: 'BRV-027', name: 'Bravo – Balaxanı',              address: 'Balaxanı qəsəbəsi, Sabunçu, Bakı',          lat: 40.4720, lng: 49.9480, district: 'Sabunçu', zone: 'D' },
  { id: 'BRV-028', name: 'Bravo – Binə',                  address: 'Binə qəsəbəsi, Sabunçu, Bakı',              lat: 40.4614, lng: 50.0470, district: 'Sabunçu', zone: 'D' },
  { id: 'BRV-029', name: 'Bravo – Keşlə',                 address: 'Keşlə qəsəbəsi, Nizami, Bakı',              lat: 40.4072, lng: 49.8793, district: 'Nizami', zone: 'C' },
  { id: 'BRV-030', name: 'Bravo – Ramana',                address: 'Ramana qəsəbəsi, Sabunçu, Bakı',            lat: 40.4881, lng: 49.9870, district: 'Sabunçu', zone: 'D' },
];

// Zone colors for map display
export const ZONE_COLORS = {
  A: '#C8102E',   // Red – City centre
  B: '#f97316',   // Orange – North-west
  C: '#eab308',   // Yellow – East
  D: '#3b82f6',   // Blue – Far east / north
  E: '#8b5cf6',   // Purple – Abşeron
  F: '#00A651',   // Green – Sumqayıt
};

// ─── Nearest-Neighbour TSP helper ──────────────────────────────────────────
function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function calculateOptimalRoute(markets = BRAVO_MARKETS) {
  // Start from warehouse, greedy nearest-neighbour
  let remaining = [...markets];
  const route = [];
  let current = WAREHOUSE;
  let totalDist = 0;

  while (remaining.length) {
    let nearest = null;
    let minDist = Infinity;
    remaining.forEach((m) => {
      const d = haversine(current, m);
      if (d < minDist) { minDist = d; nearest = m; }
    });
    totalDist += minDist;
    route.push({ ...nearest, distFromPrev: minDist });
    remaining = remaining.filter((m) => m.id !== nearest.id);
    current = nearest;
  }
  // Return to warehouse
  const returnDist = haversine(current, WAREHOUSE);
  totalDist += returnDist;

  // Estimate: avg truck speed 60 km/h in city
  const estimatedHours = totalDist / 60;
  const fuelCost = totalDist * 0.18; // ~$0.18/km for a truck

  return {
    route,
    totalDistance: Math.round(totalDist),
    estimatedHours: Math.round(estimatedHours * 10) / 10,
    fuelCost: Math.round(fuelCost),
    stops: route.length,
    returnDist: Math.round(returnDist),
  };
}
