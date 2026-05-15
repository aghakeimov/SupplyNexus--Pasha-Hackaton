import React, { useState } from 'react';
import { StoreProvider } from './store/StoreContext';
import Layout from './components/Layout';
import Notifications from './components/Notifications';
import ChatEmailPanel from './components/ChatEmailPanel';
import Dashboard from './pages/Dashboard';
import Procurement from './pages/Procurement';
import Warehouse from './pages/Warehouse';
import Logistics from './pages/Logistics';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Sales from './pages/Sales';
import Accounting from './pages/Accounting';
import AssistantPage from './pages/AssistantPage';

const pages = {
  dashboard: Dashboard,
  procurement: Procurement,
  warehouse: Warehouse,
  logistics: Logistics,
  suppliers: Suppliers,
  sales: Sales,
  accounting: Accounting,
  analytics: Analytics,
  assistant: AssistantPage,
};

function AppContent() {
  const [page, setPage] = useState('dashboard');
  const Page = pages[page] || Dashboard;
  return (
    <Layout page={page} setPage={setPage}>
      <Page />
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
      <Notifications />
      <ChatEmailPanel />
    </StoreProvider>
  );
}
