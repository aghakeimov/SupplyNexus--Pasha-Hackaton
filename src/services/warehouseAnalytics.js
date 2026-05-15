// ─── Warehouse Analytics Engine ────────────────────────────────────────────
// Pure computation functions for ABC-XYZ analysis, safety stock, stock-out risk,
// and smart reorder recommendations.

/**
 * ABC Analysis — Classify items by cumulative revenue contribution (Pareto)
 * A = top 80% of revenue, B = next 15%, C = bottom 5%
 */
export function computeABCAnalysis(inventory, salesHistory) {
  // Aggregate total revenue per SKU
  const revenueMap = {};
  salesHistory.forEach(s => {
    revenueMap[s.sku] = (revenueMap[s.sku] || 0) + s.revenue;
  });

  const items = inventory.map(inv => ({
    ...inv,
    totalRevenue: revenueMap[inv.sku] || 0,
    totalQtySold: salesHistory.filter(s => s.sku === inv.sku).reduce((sum, s) => sum + s.qtySold, 0),
  }));

  // Sort descending by revenue
  items.sort((a, b) => b.totalRevenue - a.totalRevenue);

  const grandTotal = items.reduce((s, i) => s + i.totalRevenue, 0);
  let cumulative = 0;

  return items.map(item => {
    cumulative += item.totalRevenue;
    const cumulativePct = grandTotal > 0 ? (cumulative / grandTotal) * 100 : 0;
    const revenuePct = grandTotal > 0 ? (item.totalRevenue / grandTotal) * 100 : 0;
    let abcClass;
    if (cumulativePct <= 80) abcClass = 'A';
    else if (cumulativePct <= 95) abcClass = 'B';
    else abcClass = 'C';

    return { ...item, abcClass, cumulativePct, revenuePct };
  });
}

/**
 * XYZ Analysis — Classify items by demand variability (coefficient of variation)
 * X = CV < 0.25 (stable), Y = 0.25–0.5 (moderate), Z = CV > 0.5 (erratic)
 */
export function computeXYZAnalysis(inventory, salesHistory) {
  const results = {};

  inventory.forEach(inv => {
    const monthlySales = {};
    salesHistory.filter(s => s.sku === inv.sku).forEach(s => {
      monthlySales[s.month] = (monthlySales[s.month] || 0) + s.qtySold;
    });

    const values = Object.values(monthlySales);
    if (values.length === 0) {
      results[inv.sku] = { cv: 1, xyzClass: 'Z', mean: 0, stdDev: 0, monthlySales: {} };
      return;
    }

    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 1;

    let xyzClass;
    if (cv < 0.25) xyzClass = 'X';
    else if (cv < 0.5) xyzClass = 'Y';
    else xyzClass = 'Z';

    results[inv.sku] = { cv: Math.round(cv * 100) / 100, xyzClass, mean: Math.round(mean), stdDev: Math.round(stdDev), monthlySales };
  });

  return results;
}

/**
 * Build the combined ABC-XYZ Matrix
 */
export function buildABCXYZMatrix(abcResults, xyzResults) {
  const matrix = {};
  const cells = ['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ'];
  cells.forEach(c => { matrix[c] = { items: [], totalRevenue: 0, count: 0 }; });

  abcResults.forEach(item => {
    const xyz = xyzResults[item.sku];
    if (!xyz) return;
    const cell = item.abcClass + xyz.xyzClass;
    if (!matrix[cell]) return;
    matrix[cell].items.push({ ...item, ...xyz, cell });
    matrix[cell].totalRevenue += item.totalRevenue;
    matrix[cell].count++;
  });

  return matrix;
}

/**
 * Cell metadata for the ABC-XYZ matrix
 */
export const MATRIX_META = {
  AX: { label: 'High Value, Stable', risk: 'low', color: '#00A651', strategy: 'Just-in-Time replenishment, minimal safety stock needed' },
  AY: { label: 'High Value, Variable', risk: 'medium', color: '#eab308', strategy: 'Regular monitoring, moderate safety stock, demand forecasting required' },
  AZ: { label: 'High Value, Erratic', risk: 'critical', color: '#C8102E', strategy: '⚠️ CRITICAL — Maximum safety stock, frequent reorder, contingency suppliers needed' },
  BX: { label: 'Medium Value, Stable', risk: 'low', color: '#22c55e', strategy: 'Standard reorder with fixed intervals' },
  BY: { label: 'Medium Value, Variable', risk: 'medium', color: '#f97316', strategy: 'Periodic review with adjusted safety stock' },
  BZ: { label: 'Medium Value, Erratic', risk: 'high', color: '#ef4444', strategy: 'Careful monitoring, consider buffer stock or alternative suppliers' },
  CX: { label: 'Low Value, Stable', risk: 'low', color: '#86efac', strategy: 'Bulk ordering to minimize procurement cost' },
  CY: { label: 'Low Value, Variable', risk: 'low', color: '#fbbf24', strategy: 'Periodic bulk orders with safety margin' },
  CZ: { label: 'Low Value, Erratic', risk: 'medium', color: '#fb923c', strategy: 'Consider dropping or finding substitutes' },
};

/**
 * Analyze demand per market/region
 */
export function analyzeMarketDemand(salesHistory, marketRegions) {
  const results = {};

  marketRegions.forEach(region => {
    const marketData = salesHistory.filter(s => s.market === region.name);

    // Per-SKU breakdown
    const skuBreakdown = {};
    marketData.forEach(s => {
      if (!skuBreakdown[s.sku]) {
        skuBreakdown[s.sku] = { sku: s.sku, name: s.name, totalQty: 0, totalRevenue: 0, monthly: {} };
      }
      skuBreakdown[s.sku].totalQty += s.qtySold;
      skuBreakdown[s.sku].totalRevenue += s.revenue;
      skuBreakdown[s.sku].monthly[s.month] = (skuBreakdown[s.sku].monthly[s.month] || 0) + s.qtySold;
    });

    // Monthly totals
    const monthlyTotals = {};
    marketData.forEach(s => {
      monthlyTotals[s.month] = (monthlyTotals[s.month] || 0) + s.revenue;
    });

    // Trend: compare last 3 months vs first 3 months
    const monthKeys = Object.keys(monthlyTotals).sort();
    const firstQ = monthKeys.slice(0, 3).reduce((s, k) => s + (monthlyTotals[k] || 0), 0);
    const lastQ = monthKeys.slice(-3).reduce((s, k) => s + (monthlyTotals[k] || 0), 0);
    const trend = firstQ > 0 ? ((lastQ - firstQ) / firstQ * 100) : 0;

    results[region.name] = {
      ...region,
      totalRevenue: marketData.reduce((s, d) => s + d.revenue, 0),
      totalQty: marketData.reduce((s, d) => s + d.qtySold, 0),
      skuBreakdown: Object.values(skuBreakdown).sort((a, b) => b.totalRevenue - a.totalRevenue),
      monthlyTotals,
      trend: Math.round(trend),
      avgMonthlyRevenue: Math.round(marketData.reduce((s, d) => s + d.revenue, 0) / 12),
    };
  });

  return results;
}

/**
 * Compute safety stock and reorder point for each SKU
 * Safety Stock = Z-score × σ(daily demand) × √(lead time)
 * Reorder Point = (avg daily demand × lead time) + safety stock
 */
export function computeSafetyStock(inventory, salesHistory, leadTimes) {
  const SERVICE_LEVEL_Z = 1.65; // ~95% service level

  return inventory.map(inv => {
    // Monthly total demand across all markets
    const monthlySales = {};
    salesHistory.filter(s => s.sku === inv.sku).forEach(s => {
      monthlySales[s.month] = (monthlySales[s.month] || 0) + s.qtySold;
    });

    const monthlyValues = Object.values(monthlySales);
    if (monthlyValues.length === 0) {
      return { ...inv, safetyStock: 0, reorderPoint: 0, daysOfSupply: 0, avgDailyDemand: 0, status: 'no_data' };
    }

    const avgMonthly = monthlyValues.reduce((s, v) => s + v, 0) / monthlyValues.length;
    const avgDaily = avgMonthly / 30;
    const variance = monthlyValues.reduce((s, v) => s + (v - avgMonthly) ** 2, 0) / monthlyValues.length;
    const stdMonthly = Math.sqrt(variance);
    const stdDaily = stdMonthly / Math.sqrt(30);

    const lt = leadTimes[inv.supplier] || { avgDays: 14, stdDays: 3 };
    const safetyStock = Math.ceil(SERVICE_LEVEL_Z * stdDaily * Math.sqrt(lt.avgDays));
    const reorderPoint = Math.ceil(avgDaily * lt.avgDays + safetyStock);
    const daysOfSupply = avgDaily > 0 ? Math.round(inv.qty / avgDaily) : 999;

    let status;
    if (inv.qty <= 0) status = 'stockout';
    else if (inv.qty < safetyStock) status = 'critical';
    else if (inv.qty < reorderPoint) status = 'reorder';
    else if (inv.qty > inv.maxStock * 0.9) status = 'overstock';
    else status = 'adequate';

    return {
      ...inv,
      safetyStock,
      reorderPoint,
      daysOfSupply,
      avgDailyDemand: Math.round(avgDaily * 10) / 10,
      avgMonthlyDemand: Math.round(avgMonthly),
      stdMonthlyDemand: Math.round(stdMonthly),
      leadTimeDays: lt.avgDays,
      supplierName: lt.name || inv.supplier,
      status,
    };
  });
}

/**
 * Predict stock-out risk for each SKU
 */
export function predictStockOutRisk(safetyStockResults, salesHistory) {
  return safetyStockResults.map(item => {
    // Get last 3 months trend
    const recentSales = salesHistory
      .filter(s => s.sku === item.sku)
      .sort((a, b) => b.month.localeCompare(a.month));

    const last3MonthsQty = recentSales.slice(0, 12).reduce((s, r) => s + r.qtySold, 0); // last 3 months across 4 markets
    const prev3MonthsQty = recentSales.slice(12, 24).reduce((s, r) => s + r.qtySold, 0);
    const demandTrend = prev3MonthsQty > 0 ? ((last3MonthsQty - prev3MonthsQty) / prev3MonthsQty * 100) : 0;

    // Adjusted daily demand (factor in trend)
    const trendFactor = 1 + Math.max(-0.3, Math.min(0.3, demandTrend / 100));
    const adjustedDailyDemand = item.avgDailyDemand * trendFactor;
    const daysUntilStockout = adjustedDailyDemand > 0 ? Math.round(item.qty / adjustedDailyDemand) : 999;

    let riskLevel;
    if (item.qty <= 0) riskLevel = 'stockout';
    else if (daysUntilStockout <= 3) riskLevel = 'critical';
    else if (daysUntilStockout <= 7) riskLevel = 'high';
    else if (daysUntilStockout <= 14) riskLevel = 'medium';
    else riskLevel = 'low';

    // Projected depletion curve (next 30 days)
    const depletionCurve = [];
    let projected = item.qty;
    for (let day = 0; day <= 30; day++) {
      depletionCurve.push({ day, qty: Math.max(0, Math.round(projected)) });
      projected -= adjustedDailyDemand;
    }

    return {
      ...item,
      daysUntilStockout,
      riskLevel,
      demandTrend: Math.round(demandTrend),
      adjustedDailyDemand: Math.round(adjustedDailyDemand * 10) / 10,
      depletionCurve,
      trendDirection: demandTrend > 5 ? 'increasing' : demandTrend < -5 ? 'decreasing' : 'stable',
    };
  }).sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}

/**
 * Generate smart reorder recommendations
 * Uses EOQ (Economic Order Quantity) formula
 */
export function generateReorderRecommendations(stockOutRisk, abcxyzMatrix, leadTimes) {
  const HOLDING_COST_RATE = 0.20; // 20% of unit cost annually
  const ORDER_COST = 150; // Fixed cost per order ($)

  return stockOutRisk
    .filter(item => item.riskLevel !== 'low' || item.status === 'reorder' || item.status === 'critical')
    .map(item => {
      // Find ABC-XYZ cell
      let cell = null;
      Object.entries(abcxyzMatrix).forEach(([key, val]) => {
        if (val.items.find(i => i.sku === item.sku)) cell = key;
      });

      const annualDemand = item.avgDailyDemand * 365;
      const holdingCost = item.unitCost * HOLDING_COST_RATE;

      // EOQ = √(2DS/H)
      const eoq = holdingCost > 0 ? Math.ceil(Math.sqrt((2 * annualDemand * ORDER_COST) / holdingCost)) : item.maxStock;

      // Suggested quantity: max of EOQ and gap to reorder point + safety stock
      const gap = Math.max(0, item.reorderPoint - item.qty + item.safetyStock);
      const suggestedQty = Math.max(eoq, gap);

      // Urgency
      let urgency;
      if (item.riskLevel === 'stockout' || item.riskLevel === 'critical') urgency = 'IMMEDIATE';
      else if (item.riskLevel === 'high' || item.status === 'critical') urgency = 'URGENT';
      else if (item.status === 'reorder') urgency = 'PLANNED';
      else urgency = 'MONITOR';

      const lt = leadTimes[item.supplier] || { avgDays: 14, name: 'Unknown' };
      const estimatedCost = suggestedQty * item.unitCost;

      return {
        ...item,
        cell: cell || '??',
        cellMeta: MATRIX_META[cell] || {},
        eoq,
        suggestedQty,
        urgency,
        estimatedCost,
        supplierName: lt.name,
        expectedDelivery: lt.avgDays,
        orderByDate: new Date(Date.now() + Math.max(0, (item.daysUntilStockout - lt.avgDays)) * 86400000).toISOString().split('T')[0],
      };
    })
    .sort((a, b) => {
      const urgencyOrder = { IMMEDIATE: 0, URGENT: 1, PLANNED: 2, MONITOR: 3 };
      return (urgencyOrder[a.urgency] || 4) - (urgencyOrder[b.urgency] || 4);
    });
}

/**
 * Generate AI insights text from all analytics
 */
export function generateAIInsights(abcResults, xyzResults, matrix, safetyStockResults, stockOutRisk, recommendations) {
  const insights = [];

  // Critical AZ products
  const azItems = matrix['AZ']?.items || [];
  if (azItems.length > 0) {
    insights.push({
      type: 'critical',
      icon: '🔴',
      title: 'Critical AZ Products Detected',
      text: `${azItems.length} product(s) classified as AZ (high-value, erratic demand): ${azItems.map(i => i.name).join(', ')}. These require maximum safety stock, frequent monitoring, and contingency supplier agreements.`,
    });
  }

  // Immediate reorders
  const immediateOrders = recommendations.filter(r => r.urgency === 'IMMEDIATE');
  if (immediateOrders.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⚡',
      title: 'Immediate Reorder Required',
      text: `${immediateOrders.length} product(s) need immediate reorder: ${immediateOrders.map(r => `${r.name} (${r.daysUntilStockout} days left)`).join(', ')}. Total estimated cost: $${immediateOrders.reduce((s, r) => s + r.estimatedCost, 0).toLocaleString()}.`,
    });
  }

  // Stockout items
  const stockouts = stockOutRisk.filter(i => i.riskLevel === 'stockout');
  if (stockouts.length > 0) {
    insights.push({
      type: 'critical',
      icon: '🚫',
      title: 'Active Stock-Outs',
      text: `${stockouts.length} product(s) are currently out of stock: ${stockouts.map(i => i.name).join(', ')}. Revenue loss is ongoing. Emergency procurement recommended.`,
    });
  }

  // Items below safety stock
  const belowSafety = safetyStockResults.filter(i => i.qty > 0 && i.qty < i.safetyStock);
  if (belowSafety.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Below Safety Stock Level',
      text: `${belowSafety.length} product(s) are below calculated safety stock levels. These items are at high risk of stock-out before the next replenishment cycle.`,
    });
  }

  // Increasing demand trends
  const increasing = stockOutRisk.filter(i => i.trendDirection === 'increasing');
  if (increasing.length > 0) {
    insights.push({
      type: 'info',
      icon: '📈',
      title: 'Rising Demand Detected',
      text: `${increasing.length} product(s) showing increasing demand trends: ${increasing.map(i => `${i.name} (+${i.demandTrend}%)`).join(', ')}. Consider adjusting reorder quantities upward.`,
    });
  }

  // Stable products — good news
  const stableA = abcResults.filter(i => i.abcClass === 'A' && xyzResults[i.sku]?.xyzClass === 'X');
  if (stableA.length > 0) {
    insights.push({
      type: 'success',
      icon: '✅',
      title: 'Well-Managed AX Products',
      text: `${stableA.length} high-value product(s) with stable demand (AX): ${stableA.map(i => i.name).join(', ')}. These are ideal candidates for JIT replenishment to reduce holding costs.`,
    });
  }

  // Cost optimization
  const totalReorderCost = recommendations.reduce((s, r) => s + r.estimatedCost, 0);
  if (totalReorderCost > 0) {
    insights.push({
      type: 'info',
      icon: '💰',
      title: 'Projected Reorder Investment',
      text: `Total estimated cost for all pending reorder recommendations: $${totalReorderCost.toLocaleString()}. ${recommendations.length} orders across ${new Set(recommendations.map(r => r.supplier)).size} supplier(s).`,
    });
  }

  return insights;
}
