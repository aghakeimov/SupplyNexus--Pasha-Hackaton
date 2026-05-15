// Bravo Supermarket — Real Historical Data (Apr'25–Mar'26)
// Product families, reception counts, and waste percentages from actual Bravo operations

export const BRAVO_CATEGORIES = [
  { id: 'CAT01', family: 'Dairy Short Life', sku: 'BRV-DS-001', unitCost: 2.8, unit: 'pcs', wasteRate: 0.002, supplier: 'SUP001' },
  { id: 'CAT02', family: 'Bakery', sku: 'BRV-BK-001', unitCost: 1.5, unit: 'pcs', wasteRate: 0.019, supplier: 'SUP002' },
  { id: 'CAT03', family: 'Fruits & Nuts & Fresh Juice', sku: 'BRV-FR-001', unitCost: 3.2, unit: 'kg', wasteRate: 0.044, supplier: 'SUP003' },
  { id: 'CAT04', family: 'Vegetables & Greens', sku: 'BRV-VG-001', unitCost: 2.1, unit: 'kg', wasteRate: 0.071, supplier: 'SUP003' },
  { id: 'CAT05', family: 'Meat & Poultry', sku: 'BRV-MT-001', unitCost: 8.5, unit: 'kg', wasteRate: 0.005, supplier: 'SUP004' },
  { id: 'CAT06', family: 'Soft Drinks', sku: 'BRV-SD-001', unitCost: 1.2, unit: 'pcs', wasteRate: 0.002, supplier: 'SUP005' },
  { id: 'CAT07', family: 'Eggs', sku: 'BRV-EG-001', unitCost: 3.5, unit: 'pcs', wasteRate: 0.021, supplier: 'SUP006' },
  { id: 'CAT08', family: 'Crisps & Snacks', sku: 'BRV-CS-001', unitCost: 1.8, unit: 'pcs', wasteRate: 0.001, supplier: 'SUP005' },
  { id: 'CAT09', family: 'Dairy Long Life', sku: 'BRV-DL-001', unitCost: 2.2, unit: 'pcs', wasteRate: 0.001, supplier: 'SUP001' },
  { id: 'CAT10', family: 'Frozen Food', sku: 'BRV-FF-001', unitCost: 4.5, unit: 'pcs', wasteRate: 0.006, supplier: 'SUP007' },
  { id: 'CAT11', family: 'Personal Care & Cosmetics', sku: 'BRV-PC-001', unitCost: 6.8, unit: 'pcs', wasteRate: 0.008, supplier: 'SUP008' },
  { id: 'CAT12', family: 'Heavy Household', sku: 'BRV-HH-001', unitCost: 12.5, unit: 'pcs', wasteRate: 0.095, supplier: 'SUP008' },
  { id: 'CAT13', family: 'Alcohol Product', sku: 'BRV-AL-001', unitCost: 9.5, unit: 'pcs', wasteRate: 0.003, supplier: 'SUP005' },
  { id: 'CAT14', family: 'Fresh & Smoked Fish', sku: 'BRV-FS-001', unitCost: 7.2, unit: 'kg', wasteRate: 0.000, supplier: 'SUP004' },
  { id: 'CAT15', family: 'Baby Products', sku: 'BRV-BP-001', unitCost: 8.0, unit: 'pcs', wasteRate: 0.023, supplier: 'SUP008' },
  { id: 'CAT16', family: 'Packaged Confectionery', sku: 'BRV-PF-001', unitCost: 3.8, unit: 'pcs', wasteRate: 0.006, supplier: 'SUP005' },
  { id: 'CAT17', family: 'Delikatessen', sku: 'BRV-DK-001', unitCost: 5.5, unit: 'kg', wasteRate: 0.002, supplier: 'SUP004' },
  { id: 'CAT18', family: 'Home Care', sku: 'BRV-HC-001', unitCost: 4.2, unit: 'pcs', wasteRate: 0.006, supplier: 'SUP008' },
  { id: 'CAT19', family: 'Pastry', sku: 'BRV-PA-001', unitCost: 2.0, unit: 'pcs', wasteRate: 0.019, supplier: 'SUP002' },
  { id: 'CAT20', family: 'Food Cupboard - Savoury', sku: 'BRV-FCS-001', unitCost: 3.0, unit: 'pcs', wasteRate: 0.008, supplier: 'SUP007' },
];

// Real monthly reception counts from Bravo operations
export const MONTHLY_RECEPTIONS = {
  '2025-04': 179466, '2025-05': 184006, '2025-06': 171726, '2025-07': 187433,
  '2025-08': 197193, '2025-09': 188614, '2025-10': 193381, '2025-11': 178625,
  '2025-12': 192501, '2026-01': 203955, '2026-02': 185570, '2026-03': 166771,
};

// Real waste/loss % per category per month (from Bravo data)
export const WASTE_DATA = {
  'Dairy Short Life':    [0.0, -0.2, -0.1, -0.1, -0.2, -0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  'Bakery':              [-1.4, -1.5, -1.5, -1.7, -1.7, -1.7, -1.9, -2.0, -2.2, -2.5, -2.6, -2.4],
  'Fruits & Nuts & Fresh Juice': [-4.0, -6.0, -7.1, -5.6, -4.9, -4.6, -4.4, -4.3, -3.5, -4.1, -3.0, -2.9],
  'Vegetables & Greens': [-5.7, -5.7, -6.0, -7.8, -8.9, -8.5, -7.7, -7.2, -7.0, -8.2, -7.1, -6.7],
  'Meat & Poultry':      [-0.6, -0.6, -0.5, -0.6, 0.5, -0.4, -0.6, -0.3, -0.4, -0.3, -0.3, -0.5],
  'Soft Drinks':         [-0.2, -0.2, -0.2, -0.2, -0.2, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1],
  'Eggs':                [-2.3, -2.4, -2.7, -2.4, -1.7, -2.1, -2.0, -1.7, -2.0, -2.7, -2.1, -2.1],
  'Heavy Household':     [-3.5, -7.2, -1.6, -8.6, -10.6, -6.4, -7.8, -4.2, -20.9, -4.9, 0.0, 0.0],
  'Alcohol Product':     [-0.5, -0.2, -0.2, -0.2, -0.2, -0.2, -0.2, -0.2, -0.3, -0.3, -0.4, -0.3],
  'Baby Products':       [-3.0, -1.6, -1.5, -1.8, -1.9, -1.8, -2.0, -1.8, -4.7, -2.3, -3.2, -2.0],
  'Personal Care & Cosmetics': [-0.9, -0.7, -0.7, -0.9, -0.8, -0.6, -0.8, -0.7, -1.6, -0.7, -0.9, -0.8],
  'Frozen Food':         [-0.1, -0.2, -0.2, -0.1, -0.3, -0.2, -0.2, -0.2, -0.5, -0.4, -0.3, -0.3],
};

// Generate Bravo-specific sales history using real reception data
const months = Object.keys(MONTHLY_RECEPTIONS);
const regions = ['Bakı Mərkəz', 'Yasamal-Binəqədi', 'Xətai-Nizami', 'Sabunçu-Suraxanı', 'Abşeron', 'Sumqayıt'];
const regionWeights = [0.30, 0.18, 0.15, 0.17, 0.10, 0.10];
const catWeights = [0.12, 0.08, 0.09, 0.10, 0.11, 0.07, 0.05, 0.04, 0.06, 0.04, 0.03, 0.02, 0.04, 0.03, 0.03, 0.03, 0.02, 0.02, 0.02, 0.03];

function gen() {
  const rows = [];
  months.forEach((m, mi) => {
    const totalRec = MONTHLY_RECEPTIONS[m];
    BRAVO_CATEGORIES.forEach((cat, ci) => {
      const catShare = catWeights[ci] || 0.02;
      regions.forEach((region, ri) => {
        const rw = regionWeights[ri];
        const noise = 0.85 + Math.sin(mi * 2.3 + ci * 1.7 + ri * 0.9) * 0.15;
        const qty = Math.round(totalRec * catShare * rw * noise);
        rows.push({ month: m, sku: cat.sku, name: cat.family, market: region, qtySold: qty, revenue: Math.round(qty * cat.unitCost * 100) / 100 });
      });
    });
  });
  return rows;
}

export const bravoSalesHistory = gen();

export const bravoSupplierLeadTimes = {
  'SUP001': { avgDays: 3, stdDays: 1, name: 'Atena Dairy Azerbaijan' },
  'SUP002': { avgDays: 1, stdDays: 0, name: 'Bravo Bakery (in-house)' },
  'SUP003': { avgDays: 2, stdDays: 1, name: 'AzFruit Distribution' },
  'SUP004': { avgDays: 2, stdDays: 1, name: 'Caspian Meat Group' },
  'SUP005': { avgDays: 7, stdDays: 2, name: 'Coca-Cola Azerbaijan' },
  'SUP006': { avgDays: 2, stdDays: 1, name: 'Azərbaycan Quşçuluq' },
  'SUP007': { avgDays: 5, stdDays: 2, name: 'Tamam Foods Import' },
  'SUP008': { avgDays: 10, stdDays: 3, name: 'P&G Azerbaijan / Henkel' },
};

export const bravoMarketRegions = [
  { id: 'MR001', name: 'Bakı Mərkəz', warehouse: 'WH001', zone: 'A', demandMultiplier: 1.0, stores: 8 },
  { id: 'MR002', name: 'Yasamal-Binəqədi', warehouse: 'WH001', zone: 'B', demandMultiplier: 0.60, stores: 5 },
  { id: 'MR003', name: 'Xətai-Nizami', warehouse: 'WH001', zone: 'C', demandMultiplier: 0.50, stores: 4 },
  { id: 'MR004', name: 'Sabunçu-Suraxanı', warehouse: 'WH002', zone: 'D', demandMultiplier: 0.57, stores: 6 },
  { id: 'MR005', name: 'Abşeron', warehouse: 'WH002', zone: 'E', demandMultiplier: 0.33, stores: 3 },
  { id: 'MR006', name: 'Sumqayıt', warehouse: 'WH003', zone: 'F', demandMultiplier: 0.33, stores: 3 },
];
