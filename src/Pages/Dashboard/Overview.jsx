import React, { useState, useEffect } from "react";
import { db } from "../../Config/Firebaseconfig";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  TrendingUp, DollarSign, Package, ShoppingCart, 
  Wallet, Calendar, Clock, CheckCircle2, AlertTriangle, 
  XCircle, BarChart3, ArrowUpRight, Activity, Zap
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";

const Overview = () => {
  const [salesData, setSalesData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [specificDate, setSpecificDate] = useState("");
  const [stats, setStats] = useState({
    revenue: 0,
    investment: 0,
    profit: 0,
    soldCount: 0,
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    // 1. INVENTORY INTELLIGENCE
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      let currentStockValue = 0;
      let low = 0;
      let out = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const stock = Number(data.stock || 0);
        const cost = Number(data.costPrice || 0);
        currentStockValue += (cost * stock);
        if (stock === 0) out++;
        else if (stock < 5) low++;
      });
      
      setStats(prev => ({ 
        ...prev, 
        totalProducts: snapshot.docs.length, 
        investment: currentStockValue,
        lowStock: low,
        outOfStock: out
      }));
    });

    // 2. SALES & PERFORMANCE
    const unsubSales = onSnapshot(collection(db, "sales"), (snapshot) => {
      let rev = 0; let prof = 0; let sold = 0;
      const chartMap = {};
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const allSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      allSales.forEach(sale => {
        const saleDate = sale.date; 
        const sDateObj = new Date(saleDate);
        let isIncluded = false;

        if (dateFilter === "all") isIncluded = true;
        else if (dateFilter === "today" && saleDate === todayStr) isIncluded = true;
        else if (dateFilter === "month" && sDateObj.getMonth() === now.getMonth()) isIncluded = true;
        else if (dateFilter === "year" && sDateObj.getFullYear() === now.getFullYear()) isIncluded = true;
        else if (dateFilter === "custom" && saleDate === specificDate) isIncluded = true;

        if (isIncluded) {
          rev += Number(sale.totalAmount || 0);
          prof += Number(sale.profit || 0);
          sold += Number(sale.itemsCount || 0);
          chartMap[saleDate] = (chartMap[saleDate] || 0) + Number(sale.totalAmount || 0);
        }
      });

      const formattedChart = Object.keys(chartMap).map(date => ({ date, amount: chartMap[date] }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setSalesData(formattedChart);
      setRecentSales(allSales.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
      setStats(prev => ({ ...prev, revenue: rev, profit: prof, soldCount: sold }));
    });

    return () => { unsubProducts(); unsubSales(); };
  }, [dateFilter, specificDate]);

  return (
    <div className="p-3 md:p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* COMPACT TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Admin <span className="text-blue-600">Terminal</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time POS Metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent border-none text-[11px] font-black uppercase tracking-wider focus:ring-0 cursor-pointer pr-8"
          >
            <option value="all">Lifetime</option>
            <option value="today">Today</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
            <option value="custom">Date Range</option>
          </select>
          {dateFilter === "custom" && (
            <input type="date" className="text-[11px] font-bold border-none bg-white rounded-lg px-2 py-1" onChange={(e)=>setSpecificDate(e.target.value)} />
          )}
        </div>
      </div>

      {/* CORE FINANCIALS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenue", val: stats.revenue, icon: <DollarSign size={18}/>, color: "blue", trend: "+12%" },
          { label: "Net Profit", val: stats.profit, icon: <TrendingUp size={18}/>, color: "emerald", trend: "Active" },
          { label: "Invested", val: stats.investment, icon: <Wallet size={18}/>, color: "slate", trend: "Stock" },
          { label: "Sales Count", val: stats.soldCount, icon: <ShoppingCart size={18}/>, color: "rose", trend: "Units" },
        ].map((card, i) => (
          <div key={i} className={`p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:border-${card.color}-200 transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>{card.icon}</div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-${card.color}-50 text-${card.color}-600 uppercase`}>{card.trend}</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{card.label}</p>
            <p className="text-2xl font-black tracking-tighter mt-1">
              {card.label === "Sales Count" ? "" : "$"}{card.val.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* MAIN ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART: VISUAL OVERVIEW */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-blue-600" /> Revenue Stream
            </h3>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="text-[10px] font-bold text-slate-400">Sales</span></div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fill="url(#colorArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INVENTORY ALERTS: IMMEDIATE ACTION */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Inventory Status</h3>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                   <div className="flex items-center gap-3">
                      <AlertTriangle className="text-amber-400" size={20} />
                      <span className="text-sm font-bold">Low Stock</span>
                   </div>
                   <span className="text-xl font-black">{stats.lowStock}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                   <div className="flex items-center gap-3">
                      <XCircle className="text-rose-400" size={20} />
                      <span className="text-sm font-bold">Out of Stock</span>
                   </div>
                   <span className="text-xl font-black">{stats.outOfStock}</span>
                </div>
             </div>
             <div className="mt-6 flex justify-between items-center opacity-60">
                <span className="text-[10px] font-bold">Total Items: {stats.totalProducts}</span>
                <ArrowUpRight size={14} />
             </div>
          </div>

          {/* QUICK RECENT ACTIVITY */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4">Latest Orders</h3>
            <div className="space-y-3">
              {recentSales.map((sale, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-[11px] font-black text-slate-700">#{sale.id?.slice(-4).toUpperCase()}</span>
                  </div>
                  <span className="text-[11px] font-black">${sale.totalAmount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;