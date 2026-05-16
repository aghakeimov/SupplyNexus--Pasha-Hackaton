// AI Engine — deterministic smart assistant for Supply Chain decisions
import { suppliers, inventory, purchaseOrders, shipments, marketDemand, stockMovements, warehouses, salesOrders, customers, demandForecast } from '../data/seedData';
import { bravoSalesHistory, bravoSupplierLeadTimes, BRAVO_CATEGORIES, WASTE_DATA } from '../data/bravoData';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

function scoreSuppliers(query) {
  const q = query.toLowerCase();
  return [...suppliers]
    .filter(s => s.status === 'active')
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => `**${s.name}** (${s.country}) — Score: ${s.score}/100, On-time: ${s.onTimeRate}%, Category: ${s.category}`);
}

function analyzeDemand(currentInventory) {
  const lowItems = currentInventory.filter(i => i.qty <= i.minStock);
  const outItems = currentInventory.filter(i => i.qty === 0);
  return { lowItems, outItems };
}

function getSupplierRec(category) {
  const matched = suppliers.filter(s => s.category.toLowerCase().includes(category.toLowerCase()) && s.status === 'active');
  if (matched.length === 0) return null;
  return matched.sort((a, b) => b.score - a.score)[0];
}

function parseIntent(message) {
  const m = message.toLowerCase();
  // Specific intents first (most specific match wins)
  if (m.includes('waste') || m.includes('loss') || m.includes('spoil') || m.includes('expir')) return 'waste_analysis';
  if (m.includes('abc') || m.includes('pareto') || m.includes('classification')) return 'abc_analysis';
  if (m.includes('safety stock') || m.includes('reorder point') || m.includes('eoq')) return 'safety_stock';
  if (m.includes('customer') || m.includes('store') || m.includes('branch') || m.includes('bravo market')) return 'customer_analysis';
  if (m.includes('sales') || m.includes('revenue') || m.includes('turnover') || m.includes('sold')) return 'sales_analysis';
  if (m.includes('warehouse') && (m.includes('capacity') || m.includes('utiliz') || m.includes('space'))) return 'warehouse_capacity';
  if (m.includes('movement') || m.includes('inbound') || m.includes('outbound') || m.includes('transfer')) return 'stock_movements';
  if (m.includes('lead time') || m.includes('leadtime') || m.includes('how long') || m.includes('delivery time')) return 'lead_time';
  if (m.includes('category') || m.includes('product') || m.includes('sku') || m.includes('item')) return 'category_analysis';
  if (m.includes('kpi') || m.includes('dashboard') || m.includes('overview') || m.includes('summary') || m.includes('status')) return 'kpi_overview';
  if (m.includes('compare') || m.includes('vs') || m.includes('versus') || m.includes('benchmark')) return 'comparison';
  if (m.includes('supplier') || m.includes('vendor') || m.includes('find') || m.includes('recommend')) return 'find_supplier';
  if (m.includes('demand') || m.includes('market') || m.includes('forecast')) return 'demand_forecast';
  if ((m.includes('stock') || m.includes('inventory')) && !m.includes('movement')) return 'inventory_analysis';
  if (m.includes('shipment') || m.includes('logistics') || m.includes('freight') || m.includes('cargo')) return 'shipment_status';
  if (m.includes('risk') || m.includes('alert') || m.includes('issue') || m.includes('problem') || m.includes('warning')) return 'risk_analysis';
  if (m.includes('purchase') || m.includes('order') || m.includes('po') || m.includes('procurement')) return 'po_analysis';
  if (m.includes('spend') || m.includes('cost') || m.includes('budget') || m.includes('expense') || m.includes('price')) return 'spend_analysis';
  if (m.includes('optimi') || m.includes('improve') || m.includes('suggest') || m.includes('advice') || m.includes('how can') || m.includes('what should')) return 'optimization';
  if (m.includes('help') || m.includes('what can') || m.includes('hello') || m.includes('hi') || m.includes('hey')) return 'general';
  // Fallback: try to match any data-related keyword
  if (m.includes('deliver')) return 'shipment_status';
  if (m.includes('buy') || m.includes('procur')) return 'po_analysis';
  if (m.includes('money') || m.includes('pay')) return 'spend_analysis';
  return 'smart_answer';
}

export async function getAIResponse(message, context = {}) {
  await delay(900 + Math.random() * 600);
  const intent = parseIntent(message);
  const inv = context.inventory || inventory;
  const pos = context.purchaseOrders || purchaseOrders;
  const moves = context.stockMovements || stockMovements;
  const sales = context.salesOrders || salesOrders;

  switch (intent) {
    case 'waste_analysis': {
      const totalWaste = WASTE_DATA.reduce((sum, item) => sum + item.loss_value, 0);
      const topWaste = [...WASTE_DATA].sort((a, b) => b.loss_value - a.loss_value).slice(0, 3);
      return `**Waste & Spoilage Analysis**\n\n• **Total Waste Value:** $${totalWaste.toLocaleString()}\n• **Top Waste Categories:**\n${topWaste.map(w => `  - **${w.category}**: $${w.loss_value.toLocaleString()} (${w.reason})`).join('\n')}\n\n**Recommendation:** Improve cold chain logistics for ${topWaste[0].category} and review shelf-life management policies.`;
    }
    case 'abc_analysis': {
      return `**ABC Inventory Classification**\n\n• **Class A (80% Revenue):** Electronics, Fresh Produce, Meat.\n• **Class B (15% Revenue):** Dairy, Beverages.\n• **Class C (5% Revenue):** Bakery, Household Goods.\n\n**Actionable Insight:** Implement tighter inventory controls and cycle counting for Class A items to prevent high-value stockouts.`;
    }
    case 'customer_analysis': {
      const storesCount = customers ? customers.length : 30;
      return `**Customer & Store Analysis**\n\n• **Total Stores:** ${storesCount} Bravo Markets.\n• **Top Regions:** Baku, Sumqayit, Ganja.\n\nStores require frequent replenishment. Optimizing delivery routes can reduce lead times and improve on-shelf availability.`;
    }
    case 'sales_analysis': {
      const totalRevenue = sales ? sales.reduce((sum, s) => sum + s.total, 0) : 0;
      return `**Sales & Revenue Overview**\n\n• **Total Sales Value:** $${totalRevenue.toLocaleString()}\n• **Recent Orders:** ${sales ? sales.length : 0}\n\nDemand is strong across core categories. Review stock levels to ensure order fulfillment rates remain above 95%.`;
    }
    case 'warehouse_capacity': {
      const wh = warehouses && warehouses[0] ? warehouses[0] : { name: 'Main Distribution Center', capacity: 10000, currentStock: 8500 };
      const utilization = Math.round((wh.currentStock / wh.capacity) * 100) || 85;
      return `**Warehouse Capacity Overview**\n\n• **Facility:** ${wh.name}\n• **Total Capacity:** ${wh.capacity.toLocaleString()} pallets\n• **Current Utilization:** ${utilization}%\n\n${utilization > 80 ? '⚠️ **High Utilization Alert:** Space is becoming constrained. Consider expediting outbound shipments.' : 'Capacity is within optimal operational limits.'}`;
    }
    case 'stock_movements': {
      const recent = moves ? moves.slice(0, 5) : [];
      return `**Recent Stock Movements**\n\n${recent.map(m => `• **${m.type.toUpperCase()}**: ${m.qty}x ${m.sku} at ${m.date}`).join('\n')}\n\nMonitor inbound flows to ensure put-away operations are not bottlenecked.`;
    }
    case 'lead_time': {
      const avgLeadTime = 14;
      return `**Supplier Lead Time Analysis**\n\n• **Average Lead Time:** ${avgLeadTime} days.\n• **Longest Lead Times:** International suppliers average 25-30 days.\n\n**Insight:** Buffer stock should be maintained for items with high lead time variability.`;
    }
    case 'category_analysis': {
      return `**Category Performance**\n\n• **Top Categories:** Electronics, Fresh Produce, Dairy.\n• **Highest Margin:** Electronics.\n• **Highest Turnover:** Fresh Produce.\n\nEnsure rapid cross-docking for high-turnover perishables to minimize waste.`;
    }
    case 'find_supplier': {
      const top = scoreSuppliers(message);
      return `Here are your top performing active suppliers based on composite scoring:\n\n${top.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nI can also initiate an RFQ process for any of these suppliers.`;
    }
    case 'demand_forecast': {
      const { lowItems, outItems } = analyzeDemand(inv);
      return `**Demand Forecast & Market Insights**\n\n• **Trending Categories:** Dairy, Beverages, Produce.\n\n**Critical Reorder Signals:**\n${outItems.map(i => `• 🔴 **${i.name}** (${i.sku}): OUT OF STOCK`).join('\n') || '• No out-of-stock items'}\n${lowItems.filter(i => i.qty > 0).map(i => `• 🟡 **${i.name}** (${i.sku}): ${i.qty} units remaining`).join('\n') || ''}\n\n**Forecast:** Demand is expected to increase by 5% next month. Place reorders now.`;
    }
    case 'inventory_analysis': {
      const totalValue = inv.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
      const lowStock = inv.filter(i => i.qty > 0 && i.qty <= i.minStock);
      const outStock = inv.filter(i => i.qty === 0);
      return `**Inventory Health Report**\n\n• **Total Inventory Value:** $${totalValue.toLocaleString()}\n• **Low Stock Alerts:** ${lowStock.length} items\n• **Out of Stock:** ${outStock.length} items\n\n**Recommendation:** Initiate purchase orders for flagged items. I can auto-generate draft POs based on historical data.`;
    }
    case 'shipment_status': {
      const active = shipments.filter(s => s.status !== 'delivered');
      const highRisk = shipments.filter(s => s.risk === 'high');
      return `**Active Shipments Overview (${active.length} in transit)**\n\n${active.slice(0, 3).map(s => `• **${s.id}** — Status: *${s.status}* | ETA: ${s.eta} | Risk: ${s.risk}`).join('\n')}\n\n${highRisk.length > 0 ? `⚠ **High-Risk Shipments:** ${highRisk.map(s => s.id).join(', ')}\nThese shipments may face delays.` : '✓ No high-risk shipments currently flagged.'}`;
    }
    case 'risk_analysis': {
      const suspendedSuppliers = suppliers.filter(s => s.status === 'suspended');
      const outOfStock = inv.filter(i => i.qty === 0);
      return `**Supply Chain Risk Assessment**\n\n🔴 **Critical Risks:**\n${suspendedSuppliers.map(s => `• Supplier **${s.name}** is suspended`).join('\n')}\n${outOfStock.map(i => `• **${i.name}** is out of stock`).join('\n')}\n\nOverall Risk Score: **Medium** — Immediate attention required for stockouts.`;
    }
    case 'po_analysis': {
      const pending = pos.filter(p => p.status === 'pending');
      const totalValue = pos.reduce((s, p) => s + p.total, 0);
      return `**Purchase Order Analysis**\n\n• **Total POs:** ${pos.length} | **Total Value:** $${totalValue.toLocaleString()}\n• **Pending Approval:** ${pending.length} POs\n\nRecommendation: Prioritize approval of pending POs to avoid supplier delays.`;
    }
    case 'spend_analysis': {
      const bySupplier = suppliers.map(s => ({ name: s.name, spend: s.spend })).sort((a, b) => b.spend - a.spend);
      const total = bySupplier.reduce((s, x) => s + x.spend, 0);
      return `**Spend Analysis Report**\n\n• **Total Supplier Spend YTD:** $${total.toLocaleString()}\n\n**Top Suppliers by Spend:**\n${bySupplier.slice(0, 3).map((s, i) => `${i + 1}. **${s.name}** — $${s.spend.toLocaleString()}`).join('\n')}\n\nRecommendation: Conduct quarterly business reviews with top suppliers to optimize pricing.`;
    }
    case 'optimization': {
      return `**Supply Chain Optimization Recommendations**\n\n**1. Procurement Efficiency**\n• Consolidate orders to reduce freight costs.\n\n**2. Inventory Optimization**\n• Implement ABC analysis to adjust reorder points.\n• Reduce safety stock for slow-moving C-class items.\n\n**3. Logistics Improvements**\n• Consolidate regional shipments into weekly batches.\n\nPotential annual savings: **$42,000 - $68,000**`;
    }
    case 'kpi_overview': {
       return `**Executive KPI Dashboard**\n\n• **Inventory Value:** $${inv.reduce((sum, i) => sum + i.qty * i.unitCost, 0).toLocaleString()}\n• **Active Shipments:** ${shipments.filter(s => s.status !== 'delivered').length}\n• **Open POs:** ${pos.filter(p => p.status === 'pending').length}\n• **Stockout Items:** ${inv.filter(i => i.qty === 0).length}\n\nAll systems operational. Focus needed on pending POs and stockouts.`;
    }
    case 'smart_answer': {
       return `I analyzed your query across our supply chain databases. Based on the latest data:\n\n• We currently have **${inv.length}** active SKUs in inventory.\n• There are **${pos.filter(p => p.status === 'pending').length}** purchase orders waiting for approval.\n• **${shipments.filter(s => s.risk === 'high').length}** shipments are flagged as high risk.\n\nCould you be more specific? You can ask about *inventory levels, specific suppliers, shipment risks, or demand forecasting*.`;
    }
    case 'safety_stock': {
       return `**Safety Stock & EOQ Analysis**\n\nSafety stock levels should be maintained based on lead time variability and demand fluctuations. \n\nFor critical Class A items, I recommend maintaining a **15-day buffer**. For items with highly variable supplier lead times, increasing safety stock by 20% will mitigate stockout risks during transit delays.`;
    }
    case 'comparison': {
       return `**Benchmark Comparison**\n\n• **On-Time Delivery Rate:** Our network averages 92% (Target: 95%).\n• **Inventory Turnover:** Currently 4.5x annually (Industry standard: 6.0x).\n• **Order Accuracy:** 98.5% (Exceeds target of 98%).\n\nFocus on improving inventory turnover by reducing excess stock of Class C items.`;
    }
    default: {
      return `Welcome to **SupplyNexus Intelligence**. I can assist you with:\n\n• 🔍 **Supplier Discovery**\n• 📊 **Demand Forecasting & Sales**\n• 📦 **Inventory & Warehouse**\n• 🚚 **Logistics & Shipments**\n• ⚠ **Risk & Waste Analysis**\n• 💰 **Spend & PO Analytics**\n\nTry asking me:\n*"What is the current demand forecast?"*\n*"Show me waste analysis"*\n*"Warehouse capacity overview"*`;
    }
  }
}
