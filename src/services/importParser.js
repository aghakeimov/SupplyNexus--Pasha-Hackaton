// Import parser — reads Excel/CSV/JSON and maps columns to module schema
import * as XLSX from 'xlsx';

const MODULE_SCHEMAS = {
  inventory: {
    fields: ['sku','name','category','warehouse','qty','minStock','maxStock','unitCost','unit','location','supplier','status'],
    aliases: { sku: ['sku','SKU','code','Code'], name: ['name','Name','item','Item','Product','family','Family'], category: ['category','Category','family','Family'], warehouse: ['warehouse','Warehouse','wh'], qty: ['qty','Qty','quantity','Quantity','stock','Stock'], minStock: ['minStock','min','Min','minimum'], maxStock: ['maxStock','max','Max','maximum'], unitCost: ['unitCost','cost','Cost','price','Price','unit_cost','unitPrice'], unit: ['unit','Unit'], location: ['location','Location'], supplier: ['supplier','Supplier'], status: ['status','Status'] },
    defaults: { warehouse: 'WH001', unit: 'pcs', minStock: 0, maxStock: 9999, status: 'in_stock' },
    transform: (row) => ({ id: `INV${Date.now()}${Math.random().toString(36).slice(2,5)}`, ...row, qty: Number(row.qty) || 0, unitCost: Number(row.unitCost) || 0, minStock: Number(row.minStock) || 0, maxStock: Number(row.maxStock) || 9999, lastMovement: new Date().toISOString().split('T')[0], expiryDate: null, status: (Number(row.qty)||0) === 0 ? 'out_of_stock' : (Number(row.qty)||0) <= (Number(row.minStock)||0) ? 'low_stock' : 'in_stock' }),
  },
  suppliers: {
    fields: ['name','category','country','contact','email','phone','status','score','onTimeRate','spend'],
    aliases: { name: ['name','Name','Supplier','supplier','company','Company'], category: ['category','Category','type','Type'], country: ['country','Country'], contact: ['contact','Contact','person','Person'], email: ['email','Email','e-mail','E-mail'], phone: ['phone','Phone','tel','Tel'], status: ['status','Status'], score: ['score','Score','Rating','rating'], onTimeRate: ['onTimeRate','onTime','on_time','delivery_rate'], spend: ['spend','Spend','total','Total'] },
    defaults: { country: 'Azerbaijan', status: 'active', score: 70, onTimeRate: 85, spend: 0 },
    transform: (row) => ({ id: `SUP${Date.now()}${Math.random().toString(36).slice(2,5)}`, ...row, score: Number(row.score) || 70, onTimeRate: Number(row.onTimeRate) || 85, defectRate: 1.0, totalOrders: 0, spend: Number(row.spend) || 0, since: new Date().toISOString().split('T')[0], payment: 'Net 30', certified: false }),
  },
  purchaseOrders: {
    fields: ['supplier','total','status','priority','delivery','category','notes'],
    aliases: { supplier: ['supplier','Supplier','vendor','Vendor'], total: ['total','Total','amount','Amount'], status: ['status','Status'], priority: ['priority','Priority'], delivery: ['delivery','Delivery','deliveryDate','eta','ETA'], category: ['category','Category'], notes: ['notes','Notes','comment','Comment'] },
    defaults: { status: 'draft', priority: 'medium', category: 'General' },
    transform: (row) => ({ id: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, supplierId: '', items: [{ name: row.category || 'Item', qty: 1, unit: 'pcs', unitPrice: Number(row.total) || 0, total: Number(row.total) || 0 }], ...row, total: Number(row.total) || 0, created: new Date().toISOString().split('T')[0], department: 'Procurement', approver: '', matched: false }),
  },
  salesOrders: {
    fields: ['customer','total','status','priority','deliveryDate','paymentStatus','notes'],
    aliases: { customer: ['customer','Customer','client','Client'], total: ['total','Total','amount','Amount'], status: ['status','Status'], priority: ['priority','Priority'], deliveryDate: ['deliveryDate','delivery','Delivery'], paymentStatus: ['paymentStatus','payment','Payment'], notes: ['notes','Notes'] },
    defaults: { status: 'draft', priority: 'medium', paymentStatus: 'pending' },
    transform: (row) => ({ id: `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, customerId: '', items: [{ name: 'Imported Item', qty: 1, unitPrice: Number(row.total) || 0, total: Number(row.total) || 0 }], subtotal: Number(row.total) || 0, discount: 0, tax: (Number(row.total) || 0) * 0.18, ...row, total: Number(row.total) || 0, date: new Date().toISOString().split('T')[0], paymentMethod: 'bank_transfer', rep: 'Import' }),
  },
};

function mapColumns(headers, schema) {
  const mapping = {};
  headers.forEach((h, idx) => {
    const clean = h.trim();
    for (const [field, aliases] of Object.entries(schema.aliases)) {
      if (aliases.some(a => a.toLowerCase() === clean.toLowerCase())) {
        mapping[idx] = field;
        break;
      }
    }
  });
  return mapping;
}

function applyDefaults(row, schema) {
  const result = { ...row };
  for (const [k, v] of Object.entries(schema.defaults)) {
    if (!result[k] && result[k] !== 0) result[k] = v;
  }
  return result;
}

export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let rows;
        if (ext === 'json') {
          const data = JSON.parse(e.target.result);
          rows = Array.isArray(data) ? data : [data];
          resolve({ headers: rows.length > 0 ? Object.keys(rows[0]) : [], rows });
        } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (jsonData.length < 2) { resolve({ headers: [], rows: [] }); return; }
          const headers = jsonData[0].map(String);
          const dataRows = jsonData.slice(1).filter(r => r.some(c => c != null && c !== ''));
          const rows = dataRows.map(r => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = r[i] != null ? String(r[i]) : ''; });
            return obj;
          });
          resolve({ headers, rows });
        } else {
          reject(new Error('Unsupported file type'));
        }
      } catch (err) { reject(err); }
    };

    reader.onerror = () => reject(new Error('File read error'));
    if (ext === 'json') reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
}

export function transformData(headers, rows, moduleType) {
  const schema = MODULE_SCHEMAS[moduleType];
  if (!schema) return rows;

  const colMap = mapColumns(headers, schema);
  return rows.map(row => {
    const mapped = {};
    if (Array.isArray(headers)) {
      headers.forEach((h, i) => {
        const field = colMap[i];
        if (field) mapped[field] = row[h] || row[Object.keys(row)[i]] || '';
      });
    } else {
      Object.entries(row).forEach(([k, v]) => {
        for (const [field, aliases] of Object.entries(schema.aliases)) {
          if (aliases.some(a => a.toLowerCase() === k.toLowerCase())) { mapped[field] = v; break; }
        }
      });
    }
    const withDefaults = applyDefaults(mapped, schema);
    return schema.transform(withDefaults);
  });
}

export function getModuleSchema(moduleType) {
  return MODULE_SCHEMAS[moduleType] || null;
}
