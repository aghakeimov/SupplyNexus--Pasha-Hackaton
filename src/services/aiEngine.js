// AI Engine — deterministic smart assistant for Supply Chain decisions
import { suppliers, inventory, purchaseOrders, shipments, marketDemand } from '../data/seedData';

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
  if (m.includes('supplier') || m.includes('vendor') || m.includes('find') || m.includes('recommend')) return 'find_supplier';
  if (m.includes('demand') || m.includes('market') || m.includes('forecast')) return 'demand_forecast';
  if (m.includes('stock') || m.includes('inventory') || m.includes('warehouse')) return 'inventory_analysis';
  if (m.includes('shipment') || m.includes('delivery') || m.includes('logistics')) return 'shipment_status';
  if (m.includes('risk') || m.includes('alert') || m.includes('issue')) return 'risk_analysis';
  if (m.includes('purchase') || m.includes('order') || m.includes('po')) return 'po_analysis';
  if (m.includes('spend') || m.includes('cost') || m.includes('budget')) return 'spend_analysis';
  if (m.includes('optimize') || m.includes('improve') || m.includes('suggestion')) return 'optimization';
  return 'general';
}

export async function getAIResponse(message, context = {}) {
  await delay(900 + Math.random() * 600);
  const intent = parseIntent(message);
  const inv = context.inventory || inventory;
  const pos = context.purchaseOrders || purchaseOrders;

  switch (intent) {
    case 'find_supplier': {
      const cats = ['Electronics', 'Packaging', 'Freight', 'Medical', 'IT Equipment', 'Food & Beverage', 'Raw Materials', 'Consumer Goods'];
      const detectedCat = cats.find(c => message.toLowerCase().includes(c.toLowerCase())) || null;
      const top = scoreSuppliers(message);
      if (detectedCat) {
        const rec = getSupplierRec(detectedCat);
        if (rec) {
          return `Based on performance analytics across your supplier network, I recommend **${rec.name}** for **${detectedCat}** requirements:\n\n• **Performance Score:** ${rec.score}/100\n• **On-Time Delivery:** ${rec.onTimeRate}%\n• **Defect Rate:** ${rec.defectRate}%\n• **Country:** ${rec.country}\n• **Contact:** ${rec.contact} (${rec.email})\n• **Payment Terms:** ${rec.payment}\n\nThis supplier has fulfilled ${rec.totalOrders} orders with a total spend of $${rec.spend.toLocaleString()}. ${rec.certified ? '✓ Certified supplier.' : '⚠ Certification pending.'}\n\nAlternatively, you may also onboard a new supplier — I can guide you through the qualification process.`;
        }
      }
      return `Here are your top 3 performing active suppliers based on composite scoring:\n\n${top.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nWould you like me to filter by category, country, or payment terms? I can also initiate an RFQ process for any of these suppliers.`;
    }

    case 'demand_forecast': {
      const { lowItems, outItems } = analyzeDemand(inv);
      const marketInsights = marketDemand.map(m => `• **${m.market}**: Electronics ${m.electronics}%, Food ${m.food}%, Medical ${m.medical}%`).join('\n');
      return `**Market Demand Analysis — May 2024**\n\nBased on outbound stock movements and historical patterns:\n\n${marketInsights}\n\n**Critical Reorder Signals:**\n${outItems.map(i => `• 🔴 **${i.name}** (${i.sku}): OUT OF STOCK — Immediate procurement required`).join('\n') || '• No out-of-stock items'}\n${lowItems.filter(i => i.qty > 0).map(i => `• 🟡 **${i.name}** (${i.sku}): ${i.qty} units remaining (min: ${i.minStock})`).join('\n') || ''}\n\n**Forecast:** Demand is expected to increase 8-12% in June based on Q2 trends. I recommend placing reorders for low-stock items within the next 5 business days to avoid stockouts.`;
    }

    case 'inventory_analysis': {
      const totalValue = inv.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
      const lowStock = inv.filter(i => i.qty > 0 && i.qty <= i.minStock);
      const outStock = inv.filter(i => i.qty === 0);
      const healthy = inv.filter(i => i.qty > i.minStock);
      return `**Inventory Health Report**\n\n• **Total Inventory Value:** $${totalValue.toLocaleString()}\n• **Healthy Stock Items:** ${healthy.length} SKUs (${Math.round(healthy.length/inv.length*100)}%)\n• **Low Stock Alerts:** ${lowStock.length} items\n• **Out of Stock:** ${outStock.length} items\n\n**Items Requiring Immediate Action:**\n${outStock.map(i => `• 🔴 ${i.name} — Out of stock (last seen: ${i.lastMovement})`).join('\n')}\n${lowStock.map(i => `• 🟡 ${i.name} — ${i.qty}/${i.minStock} units (${Math.round(i.qty/i.minStock*100)}% of minimum)`).join('\n')}\n\n**Recommendation:** Initiate purchase orders for the flagged items. I can auto-generate draft POs for the preferred suppliers based on historical data.`;
    }

    case 'shipment_status': {
      const active = shipments.filter(s => s.status !== 'delivered');
      const highRisk = shipments.filter(s => s.risk === 'high');
      return `**Active Shipments Overview (${active.length} in transit)**\n\n${active.map(s => `• **${s.id}** — ${s.carrier} | ${s.mode} | Status: *${s.status}* | ETA: ${s.eta} | Risk: ${s.risk}`).join('\n')}\n\n${highRisk.length > 0 ? `⚠ **High-Risk Shipments:** ${highRisk.map(s => s.id).join(', ')}\nThese shipments may face delays. I recommend proactive communication with ${highRisk[0].carrier}.` : '✓ No high-risk shipments currently flagged.'}\n\nTotal freight cost for active shipments: $${active.reduce((s, sh) => s + sh.cost, 0).toLocaleString()}`;
    }

    case 'risk_analysis': {
      const suspendedSuppliers = suppliers.filter(s => s.status === 'suspended');
      const highRiskShipments = shipments.filter(s => s.risk === 'high');
      const outOfStock = inv.filter(i => i.qty === 0);
      return `**Supply Chain Risk Assessment**\n\n🔴 **Critical Risks:**\n${suspendedSuppliers.map(s => `• Supplier **${s.name}** is suspended — score: ${s.score}/100`).join('\n')}\n${outOfStock.map(i => `• **${i.name}** is out of stock — potential operational disruption`).join('\n')}\n\n🟡 **Medium Risks:**\n${highRiskShipments.map(s => `• Shipment **${s.id}** is high-risk (${s.carrier})`).join('\n')}\n• ${suppliers.filter(s => s.onTimeRate < 85).length} suppliers have below-threshold on-time delivery rates\n\n✅ **Mitigations:**\n• Diversify sourcing away from single-country dependencies\n• Maintain 15-day safety stock for critical items\n• Activate backup carriers for high-volume routes\n\nOverall Risk Score: **Medium** — 3 items require immediate attention.`;
    }

    case 'po_analysis': {
      const pending = pos.filter(p => p.status === 'pending');
      const totalValue = pos.reduce((s, p) => s + p.total, 0);
      return `**Purchase Order Analysis**\n\n• **Total POs:** ${pos.length} | **Total Value:** $${totalValue.toLocaleString()}\n• **Pending Approval:** ${pending.length} POs\n• **Delivered:** ${pos.filter(p => p.status === 'delivered').length} POs\n• **3-Way Matched:** ${pos.filter(p => p.matched).length} POs\n\n**Pending Actions:**\n${pending.map(p => `• **${p.id}** — ${p.supplier} | $${p.total.toLocaleString()} | Priority: ${p.priority}`).join('\n')}\n\nRecommendation: Prioritize approval of high-value pending POs to avoid supplier delays. **${pending.filter(p => p.priority === 'high').length}** high-priority POs are awaiting review.`;
    }

    case 'spend_analysis': {
      const bySupplier = suppliers.map(s => ({ name: s.name, spend: s.spend })).sort((a, b) => b.spend - a.spend);
      const total = bySupplier.reduce((s, x) => s + x.spend, 0);
      return `**Spend Analysis Report**\n\n• **Total Supplier Spend YTD:** $${total.toLocaleString()}\n\n**Top Suppliers by Spend:**\n${bySupplier.slice(0, 4).map((s, i) => `${i + 1}. **${s.name}** — $${s.spend.toLocaleString()} (${Math.round(s.spend / total * 100)}%)`).join('\n')}\n\n**Insights:**\n• Top 2 suppliers account for ${Math.round((bySupplier[0].spend + bySupplier[1].spend) / total * 100)}% of spend — concentration risk\n• Consider negotiating volume discounts with **${bySupplier[0].name}**\n• 3 suppliers have not been re-evaluated in 6+ months\n\nRecommendation: Conduct quarterly business reviews with top-3 suppliers to optimize pricing and terms.`;
    }

    case 'optimization': {
      return `**Supply Chain Optimization Recommendations**\n\n**1. Procurement Efficiency**\n• Consolidate orders from the same supplier to reduce freight costs (estimated saving: 12-18%)\n• Negotiate Net 60 terms with top suppliers to improve cash flow\n\n**2. Inventory Optimization**\n• Implement ABC analysis — A-class items (Electronics, IT) need tighter reorder points\n• Current inventory turnover: ~4.2x — industry benchmark is 6-8x\n• Reduce safety stock for slow-moving C-class items by 20%\n\n**3. Logistics Improvements**\n• Consolidate Dubai-to-Baku air freight into weekly batches — est. saving: $800/month\n• Consider road freight for Turkey-origin goods under 3-ton threshold\n\n**4. Supplier Development**\n• Increase SteelMax Group's performance review frequency (currently suspended)\n• Onboard 1-2 backup suppliers in Electronics and IT categories\n\nPotential annual savings: **$42,000 - $68,000**`;
    }

    default: {
      return `Welcome to **SupplyNexus Intelligence**. I can assist you with:\n\n• 🔍 **Supplier Discovery** — Find and evaluate suppliers by category or performance\n• 📊 **Demand Forecasting** — Analyze market demand and predict reorder needs\n• 📦 **Inventory Intelligence** — Real-time stock health and reorder recommendations\n• 🚚 **Logistics Analysis** — Shipment status and risk assessment\n• ⚠ **Risk Management** — Identify and mitigate supply chain disruptions\n• 💰 **Spend Analytics** — Cost optimization and budget insights\n\nTry asking me:\n*"Find me a supplier for electronics"*\n*"What is the current demand forecast?"*\n*"Which items are running low on stock?"*`;
    }
  }
}
