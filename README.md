# SupplyNexus — Enterprise Supply Chain Management

**Bravo Supermarket ERP Platform** built with React + Vite

## 🚀 Features

- **Dashboard** — Real-time KPIs, demand forecast charts
- **Sales & Invoices** — Order management, PDF export, email integration
- **Procurement** — Purchase orders, 3-way matching, supplier communication
- **Warehouse** — ABC-XYZ analysis, safety stock, AI reorder recommendations
- **Logistics** — Route planning with Leaflet maps
- **Suppliers** — Vendor scoring, performance tracking
- **Accounting** — P&L, journal entries, chart of accounts, AP/AR
- **Analytics** — Advanced spend & performance analytics
- **AI Assistant** — Built-in supply chain intelligence
- **Data Import** — Excel, CSV, JSON import with auto-column mapping
- **Chat & Email** — Floating chat panel with mailto integration

## 🛠 Tech Stack

- React 19 + Vite 8
- Recharts (data visualization)
- Leaflet (maps)
- jsPDF (PDF generation)
- SheetJS/xlsx (Excel parsing)
- Lucide React (icons)
- localStorage (data persistence)

## 📦 Setup

```bash
npm install
npm run dev
```

## 🏗 Build

```bash
npm run build
npm run preview
```

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the GitHub repository
4. Framework: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click Deploy ✅

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── data/           # Seed data (Bravo Supermarket)
├── pages/          # Module pages
├── services/       # PDF, email, import parsers
├── store/          # React context state management
└── index.css       # Global styles
```

## 📋 License

Private — Pasha Bank Internal
