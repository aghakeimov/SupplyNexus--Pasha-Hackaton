// Bravo Supermarket — Seed Data for SupplyNexus ERP
import { BRAVO_CATEGORIES } from './bravoData';

export const suppliers = [
  { id: 'SUP001', name: 'Atena Dairy Azerbaijan', category: 'Dairy', country: 'Azerbaijan', contact: 'Nihad Aliyev', email: 'nihad@atenadairy.az', phone: '+994 12 555 0101', status: 'active', score: 94, totalOrders: 120, onTimeRate: 97, defectRate: 0.5, spend: 485000, since: '2020-01-10', payment: 'Net 15', certified: true },
  { id: 'SUP002', name: 'Bravo Bakery (in-house)', category: 'Bakery', country: 'Azerbaijan', contact: 'Leyla Hasanova', email: 'leyla@bravo.az', phone: '+994 12 555 0202', status: 'active', score: 98, totalOrders: 365, onTimeRate: 99, defectRate: 0.2, spend: 320000, since: '2018-03-01', payment: 'Internal', certified: true },
  { id: 'SUP003', name: 'AzFruit Distribution', category: 'Fresh Produce', country: 'Azerbaijan', contact: 'Rashad Mammadov', email: 'rashad@azfruit.az', phone: '+994 55 555 0303', status: 'active', score: 82, totalOrders: 200, onTimeRate: 88, defectRate: 3.2, spend: 610000, since: '2019-06-15', payment: 'Net 7', certified: true },
  { id: 'SUP004', name: 'Caspian Meat Group', category: 'Meat & Fish', country: 'Azerbaijan', contact: 'Tural Quliyev', email: 'tural@caspianmeat.az', phone: '+994 50 555 0404', status: 'active', score: 91, totalOrders: 150, onTimeRate: 95, defectRate: 1.0, spend: 780000, since: '2019-11-01', payment: 'Net 15', certified: true },
  { id: 'SUP005', name: 'Coca-Cola Azerbaijan / Distributors', category: 'Beverages & FMCG', country: 'Azerbaijan', contact: 'Samir Huseynov', email: 'samir@ccaz.az', phone: '+994 12 555 0505', status: 'active', score: 96, totalOrders: 95, onTimeRate: 98, defectRate: 0.3, spend: 520000, since: '2020-02-20', payment: 'Net 30', certified: true },
  { id: 'SUP006', name: 'Azerbaijan Poultry', category: 'Eggs & Poultry', country: 'Azerbaijan', contact: 'Elvin Nasirov', email: 'elvin@azpoultry.az', phone: '+994 55 555 0606', status: 'active', score: 85, totalOrders: 180, onTimeRate: 90, defectRate: 2.0, spend: 290000, since: '2021-01-05', payment: 'Net 7', certified: true },
  { id: 'SUP007', name: 'Tamam Foods Import', category: 'Frozen & Packaged', country: 'Turkey', contact: 'Mehmet Yilmaz', email: 'mehmet@tamamfoods.tr', phone: '+90 212 555 0707', status: 'active', score: 88, totalOrders: 72, onTimeRate: 92, defectRate: 1.5, spend: 340000, since: '2020-08-10', payment: 'Net 30', certified: true },
  { id: 'SUP008', name: 'P&G Azerbaijan / Henkel', category: 'Non-Food FMCG', country: 'Azerbaijan', contact: 'Aynur Babayeva', email: 'aynur@pgaz.az', phone: '+994 12 555 0808', status: 'active', score: 93, totalOrders: 60, onTimeRate: 96, defectRate: 0.4, spend: 410000, since: '2019-05-15', payment: 'Net 45', certified: true },
];

export const warehouses = [
  { id: 'WH001', name: 'Bravo Central Warehouse', location: 'Pirekeshkul, Absheron', zone: 'A', capacity: 15000, occupied: 11200, manager: 'Rashad Huseynov', type: 'Central DC', active: true },
  { id: 'WH002', name: 'Bravo East Warehouse', location: 'Sabunchu, Baku', zone: 'D', capacity: 6000, occupied: 4100, manager: 'Samira Rzayeva', type: 'Regional DC', active: true },
  { id: 'WH003', name: 'Bravo Sumgait Warehouse', location: 'Sumgait', zone: 'F', capacity: 4000, occupied: 2800, manager: 'Tural Isgandarov', type: 'Regional DC', active: true },
  { id: 'WH004', name: 'Bravo Cold Chain Warehouse', location: 'Khirdalan, Absheron', zone: 'E', capacity: 3000, occupied: 2400, manager: 'Aysel Mammadova', type: 'Cold Chain', active: true },
];

export const inventory = BRAVO_CATEGORIES.map((cat, i) => {
  const bases = [4500,3200,2800,3500,1800,5200,2100,4800,3600,1500,1200,400,2200,600,900,2600,800,1600,2000,3000];
  const mins =  [1500,1000,800,1000,500,1500,600,1500,1000,400,300,100,600,150,200,700,200,400,500,800];
  const maxs =  [8000,6000,5000,6000,3000,9000,4000,8000,6000,3000,2500,800,4000,1200,1800,5000,1500,3000,4000,5500];
  const whs =   ['WH004','WH001','WH001','WH001','WH004','WH001','WH001','WH001','WH001','WH004','WH001','WH001','WH001','WH004','WH001','WH001','WH004','WH001','WH001','WH001'];
  const qty = bases[i] || 1000;
  const min = mins[i] || 300;
  return {
    id: `INV${String(i+1).padStart(3,'0')}`, sku: cat.sku, name: cat.family, category: cat.family,
    warehouse: whs[i] || 'WH001', qty, minStock: min, maxStock: maxs[i] || 5000,
    unitCost: cat.unitCost, unit: cat.unit, location: `${String.fromCharCode(65+(i%6))}-${String(Math.floor(i/6)+1).padStart(2,'0')}-${String((i%4)+1).padStart(2,'0')}`,
    lastMovement: '2026-05-15', supplier: cat.supplier,
    status: qty === 0 ? 'out_of_stock' : qty <= min ? 'low_stock' : 'in_stock',
    expiryDate: ['WH004'].includes(whs[i]) ? '2026-08-30' : null,
  };
});

export const purchaseOrders = [
  { id: 'PO-2026-0201', supplier: 'Atena Dairy Azerbaijan', supplierId: 'SUP001', items: [{ name: 'Dairy Short Life', qty: 3000, unit: 'pcs', unitPrice: 2.8, total: 8400 }], total: 8400, status: 'delivered', priority: 'high', created: '2026-05-01', delivery: '2026-05-04', category: 'Dairy', department: 'Procurement', approver: 'Elchin Babayev', notes: 'Weekly dairy order', matched: true },
  { id: 'PO-2026-0202', supplier: 'AzFruit Distribution', supplierId: 'SUP003', items: [{ name: 'Fruits & Nuts & Fresh Juice', qty: 2000, unit: 'kg', unitPrice: 3.2, total: 6400 },{ name: 'Vegetables & Greens', qty: 2500, unit: 'kg', unitPrice: 2.1, total: 5250 }], total: 11650, status: 'approved', priority: 'high', created: '2026-05-10', delivery: '2026-05-13', category: 'Fresh Produce', department: 'Procurement', approver: 'Elchin Babayev', notes: '', matched: false },
  { id: 'PO-2026-0203', supplier: 'Caspian Meat Group', supplierId: 'SUP004', items: [{ name: 'Meat & Poultry', qty: 1200, unit: 'kg', unitPrice: 8.5, total: 10200 }], total: 10200, status: 'pending', priority: 'high', created: '2026-05-12', delivery: '2026-05-15', category: 'Meat & Fish', department: 'Procurement', approver: '', notes: '', matched: false },
  { id: 'PO-2026-0204', supplier: 'Coca-Cola Azerbaijan / Distributors', supplierId: 'SUP005', items: [{ name: 'Soft Drinks', qty: 5000, unit: 'pcs', unitPrice: 1.2, total: 6000 },{ name: 'Crisps & Snacks', qty: 3000, unit: 'pcs', unitPrice: 1.8, total: 5400 }], total: 11400, status: 'approved', priority: 'medium', created: '2026-05-08', delivery: '2026-05-16', category: 'Beverages', department: 'Procurement', approver: 'Sevinc Quliyeva', notes: '', matched: false },
  { id: 'PO-2026-0205', supplier: 'Tamam Foods Import', supplierId: 'SUP007', items: [{ name: 'Frozen Food', qty: 800, unit: 'pcs', unitPrice: 4.5, total: 3600 }], total: 3600, status: 'pending', priority: 'medium', created: '2026-05-13', delivery: '2026-05-20', category: 'Frozen', department: 'Procurement', approver: '', notes: 'Frozen products', matched: false },
  { id: 'PO-2026-0206', supplier: 'P&G Azerbaijan / Henkel', supplierId: 'SUP008', items: [{ name: 'Personal Care & Cosmetics', qty: 600, unit: 'pcs', unitPrice: 6.8, total: 4080 },{ name: 'Home Care', qty: 800, unit: 'pcs', unitPrice: 4.2, total: 3360 }], total: 7440, status: 'draft', priority: 'low', created: '2026-05-14', delivery: '2026-05-25', category: 'Non-Food', department: 'Procurement', approver: '', notes: '', matched: false },
  { id: 'PO-2026-0207', supplier: 'Bravo Bakery (in-house)', supplierId: 'SUP002', items: [{ name: 'Bakery', qty: 4000, unit: 'pcs', unitPrice: 1.5, total: 6000 },{ name: 'Pastry', qty: 2000, unit: 'pcs', unitPrice: 2.0, total: 4000 }], total: 10000, status: 'delivered', priority: 'high', created: '2026-05-15', delivery: '2026-05-15', category: 'Bakery', department: 'Production', approver: 'Elchin Babayev', notes: 'Daily production', matched: true },
];

export const shipments = [
  { id: 'SHP-2026-0101', poId: 'PO-2026-0201', origin: 'Atena Factory, Baku', destination: 'Bravo Central Warehouse', carrier: 'Bravo Fleet', mode: 'Road', status: 'delivered', dispatched: '2026-05-03', eta: '2026-05-04', tracking: 'BRV-TRK-0101', weight: '2.4 t', cost: 180, items: 1, risk: 'low' },
  { id: 'SHP-2026-0102', poId: 'PO-2026-0202', origin: 'AzFruit Warehouse, Baku', destination: 'Bravo Central Warehouse', carrier: 'Bravo Fleet', mode: 'Road', status: 'in_transit', dispatched: '2026-05-12', eta: '2026-05-13', tracking: 'BRV-TRK-0102', weight: '4.5 t', cost: 250, items: 2, risk: 'medium' },
  { id: 'SHP-2026-0103', poId: 'PO-2026-0204', origin: 'Coca-Cola Baku', destination: 'Bravo Central Warehouse', carrier: 'Coca-Cola Logistics', mode: 'Road', status: 'processing', dispatched: null, eta: '2026-05-16', tracking: null, weight: '6.2 t', cost: 320, items: 2, risk: 'low' },
  { id: 'SHP-2026-0104', poId: 'PO-2026-0205', origin: 'Istanbul, Turkey', destination: 'Bravo Cold Chain Warehouse', carrier: 'Turkish Cargo', mode: 'Road', status: 'customs', dispatched: '2026-05-10', eta: '2026-05-18', tracking: 'TC-482920', weight: '1.8 t', cost: 1800, items: 1, risk: 'high' },
  { id: 'SHP-2026-0105', poId: 'PO-2026-0207', origin: 'Bravo Bakery, Baku', destination: 'Bravo Central Warehouse', carrier: 'Internal', mode: 'Road', status: 'delivered', dispatched: '2026-05-15', eta: '2026-05-15', tracking: 'INT-0105', weight: '1.2 t', cost: 50, items: 2, risk: 'low' },
];

export const stockMovements = [
  { id: 'MOV001', type: 'in', sku: 'BRV-DS-001', item: 'Dairy Short Life', qty: 3000, warehouse: 'WH004', date: '2026-05-04', ref: 'PO-2026-0201', user: 'Rashad H.' },
  { id: 'MOV002', type: 'out', sku: 'BRV-DS-001', item: 'Dairy Short Life', qty: 1800, warehouse: 'WH004', date: '2026-05-05', ref: 'DIST-BRV-011', user: 'Rashad H.' },
  { id: 'MOV003', type: 'in', sku: 'BRV-BK-001', item: 'Bakery', qty: 4000, warehouse: 'WH001', date: '2026-05-15', ref: 'PO-2026-0207', user: 'Rashad H.' },
  { id: 'MOV004', type: 'out', sku: 'BRV-BK-001', item: 'Bakery', qty: 2500, warehouse: 'WH001', date: '2026-05-15', ref: 'DIST-BRV-012', user: 'Rashad H.' },
  { id: 'MOV005', type: 'out', sku: 'BRV-FR-001', item: 'Fruits & Nuts & Fresh Juice', qty: 1200, warehouse: 'WH001', date: '2026-05-14', ref: 'DIST-BRV-013', user: 'Samira R.' },
  { id: 'MOV006', type: 'transfer', sku: 'BRV-SD-001', item: 'Soft Drinks', qty: 800, warehouse: 'WH003', date: '2026-05-13', ref: 'TRF-0031', user: 'Tural I.' },
  { id: 'MOV007', type: 'out', sku: 'BRV-MT-001', item: 'Meat & Poultry', qty: 600, warehouse: 'WH004', date: '2026-05-14', ref: 'DIST-BRV-014', user: 'Aysel M.' },
  { id: 'MOV008', type: 'in', sku: 'BRV-EG-001', item: 'Eggs', qty: 1500, warehouse: 'WH001', date: '2026-05-12', ref: 'PO-2026-0208', user: 'Rashad H.' },
];

export const demandForecast = [
  { month: 'Apr', actual: 179466, forecast: 175000 },
  { month: 'May', actual: 184006, forecast: 180000 },
  { month: 'Jun', actual: 171726, forecast: 178000 },
  { month: 'Jul', actual: 187433, forecast: 182000 },
  { month: 'Aug', actual: 197193, forecast: 190000 },
  { month: 'Sep', actual: 188614, forecast: 192000 },
  { month: 'Oct', actual: 193381, forecast: 188000 },
  { month: 'Nov', actual: 178625, forecast: 185000 },
  { month: 'Dec', actual: 192501, forecast: 195000 },
  { month: 'Jan', actual: 203955, forecast: 198000 },
  { month: 'Feb', actual: 185570, forecast: 190000 },
  { month: 'Mar', actual: 166771, forecast: 180000 },
];

export const kpiData = {
  totalSpend: 3755000, pendingPOs: 3, activeSuppliers: 8, onTimeDelivery: 94.2,
  inventoryValue: 186400, stockAlerts: 4, openShipments: 3, avgLeadTime: 4.5,
};

export const marketDemand = [
  { market: 'Baku Central', dairy: 92, bakery: 88, produce: 85, meat: 78, beverages: 91 },
  { market: 'Yasamal-Binagadi', dairy: 75, bakery: 80, produce: 72, meat: 68, beverages: 82 },
  { market: 'Khatai-Nizami', dairy: 68, bakery: 72, produce: 65, meat: 61, beverages: 74 },
  { market: 'Sabunchu-Surakhani', dairy: 71, bakery: 74, produce: 78, meat: 65, beverages: 70 },
  { market: 'Absheron', dairy: 45, bakery: 50, produce: 55, meat: 42, beverages: 48 },
  { market: 'Sumgait', dairy: 52, bakery: 55, produce: 50, meat: 48, beverages: 58 },
];

export const customers = [
  { id: 'BRV-STR-001', name: 'Bravo – Neftchilar Ave.', type: 'store', contact: 'Farid Aliyev', email: 'neftchiler@bravo.az', phone: '+994 12 310 0001', address: 'Neftchilar Ave. 90, Baku', segment: 'flagship', creditLimit: 0, balance: 0, status: 'active', since: '2018-01-01', rating: 5 },
  { id: 'BRV-STR-002', name: 'Bravo – Nizami St.', type: 'store', contact: 'Kamil Aliyev', email: 'nizami@bravo.az', phone: '+994 55 310 0002', address: 'Nizami St. 56, Baku', segment: 'flagship', creditLimit: 0, balance: 0, status: 'active', since: '2018-03-15', rating: 5 },
  { id: 'BRV-STR-003', name: 'Bravo – Tbilisi Ave.', type: 'store', contact: 'Rauf Aliyev', email: 'tbilisi@bravo.az', phone: '+994 12 310 0003', address: 'Tbilisi Ave. 12, Baku', segment: 'standard', creditLimit: 0, balance: 0, status: 'active', since: '2019-06-01', rating: 4 },
  { id: 'BRV-STR-004', name: 'Bravo – Yasamal', type: 'store', contact: 'Dilek Yildiz', email: 'yasamal@bravo.az', phone: '+994 12 310 0004', address: 'Sh.I.Khalilov St. 60, Baku', segment: 'standard', creditLimit: 0, balance: 0, status: 'active', since: '2019-09-20', rating: 4 },
  { id: 'BRV-STR-005', name: 'Bravo – Sumgait (Central)', type: 'store', contact: 'Elnur Huseynov', email: 'sumqayit@bravo.az', phone: '+994 18 310 0005', address: 'Mir Ali Gashgay St., Sumgait', segment: 'regional', creditLimit: 0, balance: 0, status: 'active', since: '2020-02-01', rating: 4 },
  { id: 'BRV-STR-006', name: 'Bravo – Khatai Ave.', type: 'store', contact: 'Seymur Rahimov', email: 'xetai@bravo.az', phone: '+994 12 310 0006', address: 'Khatai Ave. 8, Baku', segment: 'standard', creditLimit: 0, balance: 0, status: 'active', since: '2020-05-10', rating: 4 },
  { id: 'BRV-STR-007', name: 'Bravo – Sabunchu', type: 'store', contact: 'Gunel Nasibova', email: 'sabuncu@bravo.az', phone: '+994 12 310 0007', address: 'Husu Hajiyev St., Sabunchu', segment: 'standard', creditLimit: 0, balance: 0, status: 'active', since: '2021-01-15', rating: 3 },
  { id: 'BRV-STR-008', name: 'Bravo – Khirdalan', type: 'store', contact: 'Vahid Mustafayev', email: 'xirdalan@bravo.az', phone: '+994 12 310 0008', address: 'H.Aliyev Ave. 12, Khirdalan', segment: 'regional', creditLimit: 0, balance: 0, status: 'active', since: '2021-04-01', rating: 3 },
];

export const salesOrders = [
  { id: 'SO-2026-0301', customerId: 'BRV-STR-001', customer: 'Bravo – Neftchilar Ave.', items: [{ name: 'Dairy Short Life', qty: 400, unitPrice: 3.5, total: 1400 },{ name: 'Bakery', qty: 600, unitPrice: 2.0, total: 1200 }], subtotal: 2600, discount: 0, tax: 468, total: 3068, status: 'delivered', priority: 'high', date: '2026-05-15', deliveryDate: '2026-05-15', paymentStatus: 'internal', paymentMethod: 'internal', notes: 'Daily store order', rep: 'Murad A.' },
  { id: 'SO-2026-0302', customerId: 'BRV-STR-002', customer: 'Bravo – Nizami St.', items: [{ name: 'Fruits & Nuts & Fresh Juice', qty: 300, unitPrice: 4.0, total: 1200 },{ name: 'Vegetables & Greens', qty: 350, unitPrice: 2.8, total: 980 }], subtotal: 2180, discount: 0, tax: 392.4, total: 2572.4, status: 'processing', priority: 'high', date: '2026-05-15', deliveryDate: '2026-05-16', paymentStatus: 'internal', paymentMethod: 'internal', notes: '', rep: 'Elchin B.' },
  { id: 'SO-2026-0303', customerId: 'BRV-STR-005', customer: 'Bravo – Sumgait (Central)', items: [{ name: 'Soft Drinks', qty: 800, unitPrice: 1.5, total: 1200 },{ name: 'Crisps & Snacks', qty: 500, unitPrice: 2.2, total: 1100 }], subtotal: 2300, discount: 0, tax: 414, total: 2714, status: 'approved', priority: 'medium', date: '2026-05-14', deliveryDate: '2026-05-16', paymentStatus: 'internal', paymentMethod: 'internal', notes: '', rep: 'Sevinc G.' },
  { id: 'SO-2026-0304', customerId: 'BRV-STR-004', customer: 'Bravo – Yasamal', items: [{ name: 'Meat & Poultry', qty: 150, unitPrice: 11.0, total: 1650 }], subtotal: 1650, discount: 0, tax: 297, total: 1947, status: 'delivered', priority: 'high', date: '2026-05-14', deliveryDate: '2026-05-14', paymentStatus: 'internal', paymentMethod: 'internal', notes: '', rep: 'Murad A.' },
  { id: 'SO-2026-0305', customerId: 'BRV-STR-006', customer: 'Bravo – Khatai Ave.', items: [{ name: 'Eggs', qty: 200, unitPrice: 4.2, total: 840 },{ name: 'Dairy Long Life', qty: 300, unitPrice: 2.8, total: 840 }], subtotal: 1680, discount: 0, tax: 302.4, total: 1982.4, status: 'processing', priority: 'medium', date: '2026-05-15', deliveryDate: '2026-05-16', paymentStatus: 'internal', paymentMethod: 'internal', notes: '', rep: 'Elchin B.' },
  { id: 'SO-2026-0306', customerId: 'BRV-STR-007', customer: 'Bravo – Sabunchu', items: [{ name: 'Personal Care & Cosmetics', qty: 100, unitPrice: 8.5, total: 850 }], subtotal: 850, discount: 0, tax: 153, total: 1003, status: 'approved', priority: 'low', date: '2026-05-13', deliveryDate: '2026-05-17', paymentStatus: 'internal', paymentMethod: 'internal', notes: '', rep: 'Sevinc G.' },
  { id: 'SO-2026-0307', customerId: 'BRV-STR-003', customer: 'Bravo – Tbilisi Ave.', items: [{ name: 'Alcohol Product', qty: 200, unitPrice: 12.0, total: 2400 },{ name: 'Packaged Confectionery', qty: 400, unitPrice: 4.5, total: 1800 }], subtotal: 4200, discount: 0, tax: 756, total: 4956, status: 'delivered', priority: 'medium', date: '2026-05-12', deliveryDate: '2026-05-13', paymentStatus: 'internal', paymentMethod: 'internal', notes: '', rep: 'Murad A.' },
];

// Re-exports for backward compatibility
export { bravoSalesHistory as salesHistory, bravoSupplierLeadTimes as supplierLeadTimes, bravoMarketRegions as marketRegions } from './bravoData';
