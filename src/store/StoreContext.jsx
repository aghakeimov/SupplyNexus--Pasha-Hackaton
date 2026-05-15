import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { suppliers as seedSuppliers, purchaseOrders as seedPOs, inventory as seedInventory, shipments as seedShipments, stockMovements as seedMovements, warehouses as seedWarehouses, salesOrders as seedSalesOrders, customers as seedCustomers } from '../data/seedData';

const StoreContext = createContext(null);

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

const initialState = {
  suppliers: load('sn_suppliers', seedSuppliers),
  purchaseOrders: load('sn_pos', seedPOs),
  inventory: load('sn_inventory', seedInventory),
  shipments: load('sn_shipments', seedShipments),
  stockMovements: load('sn_movements', seedMovements),
  warehouses: load('sn_warehouses', seedWarehouses),
  salesOrders: load('sn_sales', seedSalesOrders),
  customers: load('sn_customers', seedCustomers),
  notifications: [],
  aiHistory: load('sn_ai', []),
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_SUPPLIER': return { ...state, suppliers: [action.payload, ...state.suppliers] };
    case 'UPDATE_SUPPLIER': return { ...state, suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SUPPLIER': return { ...state, suppliers: state.suppliers.filter(s => s.id !== action.payload) };

    case 'ADD_PO': return { ...state, purchaseOrders: [action.payload, ...state.purchaseOrders] };
    case 'UPDATE_PO': return { ...state, purchaseOrders: state.purchaseOrders.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PO': return { ...state, purchaseOrders: state.purchaseOrders.filter(p => p.id !== action.payload) };

    case 'ADD_INVENTORY': return { ...state, inventory: [action.payload, ...state.inventory] };
    case 'UPDATE_INVENTORY': return { ...state, inventory: state.inventory.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INVENTORY': return { ...state, inventory: state.inventory.filter(i => i.id !== action.payload) };

    case 'ADD_SHIPMENT': return { ...state, shipments: [action.payload, ...state.shipments] };
    case 'UPDATE_SHIPMENT': return { ...state, shipments: state.shipments.map(s => s.id === action.payload.id ? action.payload : s) };

    case 'ADD_MOVEMENT': return { ...state, stockMovements: [action.payload, ...state.stockMovements] };

    case 'ADD_SALE': return { ...state, salesOrders: [action.payload, ...state.salesOrders] };
    case 'UPDATE_SALE': return { ...state, salesOrders: state.salesOrders.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SALE': return { ...state, salesOrders: state.salesOrders.filter(s => s.id !== action.payload) };

    case 'ADD_CUSTOMER': return { ...state, customers: [action.payload, ...state.customers] };
    case 'UPDATE_CUSTOMER': return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CUSTOMER': return { ...state, customers: state.customers.filter(c => c.id !== action.payload) };

    case 'PUSH_NOTIF': return { ...state, notifications: [...state.notifications, { ...action.payload, id: Date.now() }] };
    case 'POP_NOTIF': return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };

    case 'ADD_AI_MSG': return { ...state, aiHistory: [...state.aiHistory, action.payload] };
    case 'CLEAR_AI': return { ...state, aiHistory: [] };

    default: return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => { localStorage.setItem('sn_suppliers', JSON.stringify(state.suppliers)); }, [state.suppliers]);
  useEffect(() => { localStorage.setItem('sn_pos', JSON.stringify(state.purchaseOrders)); }, [state.purchaseOrders]);
  useEffect(() => { localStorage.setItem('sn_inventory', JSON.stringify(state.inventory)); }, [state.inventory]);
  useEffect(() => { localStorage.setItem('sn_shipments', JSON.stringify(state.shipments)); }, [state.shipments]);
  useEffect(() => { localStorage.setItem('sn_movements', JSON.stringify(state.stockMovements)); }, [state.stockMovements]);
  useEffect(() => { localStorage.setItem('sn_sales', JSON.stringify(state.salesOrders)); }, [state.salesOrders]);
  useEffect(() => { localStorage.setItem('sn_customers', JSON.stringify(state.customers)); }, [state.customers]);
  useEffect(() => { localStorage.setItem('sn_ai', JSON.stringify(state.aiHistory)); }, [state.aiHistory]);

  const notify = (msg, type = 'info') => {
    const id = Date.now();
    dispatch({ type: 'PUSH_NOTIF', payload: { msg, type, id } });
    setTimeout(() => dispatch({ type: 'POP_NOTIF', payload: id }), 4000);
  };

  return <StoreContext.Provider value={{ state, dispatch, notify }}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
