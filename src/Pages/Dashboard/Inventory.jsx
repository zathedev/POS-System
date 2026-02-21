import React, { useState, useEffect } from "react";
import { db } from "../../Config/Firebaseconfig";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { 
  Edit3, Trash2, Search, AlertTriangle, Package, X, 
  CheckCircle, Ban, Layers, ChevronDown, DollarSign, 
  TrendingUp, ArrowUpRight, Barcode, Tag
} from "lucide-react";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const categories = ["All", "General", "Food", "Beverage", "Electronics"];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    });
    return () => unsubscribe();
  }, []);

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 5).length,
    soldOut: products.filter(p => p.stock <= 0).length,
    valuation: products.reduce((acc, p) => acc + (Number(p.stock) * Number(p.sellingPrice || 0)), 0)
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setEditFormData(product);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, "products", editingProduct);
      await updateDoc(productRef, {
        ...editFormData,
        stock: Number(editFormData.stock),
        sellingPrice: Number(editFormData.sellingPrice),
        costPrice: Number(editFormData.costPrice)
      });
      setEditingProduct(null);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirm permanent deletion from registry?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.includes(searchTerm);
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* --- ELITE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">Inventory <span className="text-blue-600">Master</span></h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-1">Global Stock Registry 2026</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="text-right border-r border-slate-100 pr-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Assets</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
          <div className="pl-2">
             <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><Package size={20}/></div>
          </div>
        </div>
      </div>

      {/* --- SEARCH & FILTRATION --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" placeholder="Search by name or SKU..."
            className="w-full pl-14 pr-8 py-5 bg-white rounded-3xl border-none shadow-sm focus:ring-2 focus:ring-blue-500/20 font-bold transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <select 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-6 pr-12 py-5 bg-white appearance-none rounded-3xl border-none shadow-sm font-black text-sm text-slate-600 cursor-pointer uppercase tracking-tighter"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat} List</option>)}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>

      {/* --- ELEGANT LIST TABLE --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Information</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Inventory Status</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="p-8">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{product.name}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">SKU: {product.sku}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {product.category || 'General'}
                    </span>
                  </td>
                  <td className="p-8">
                    {product.stock <= 0 ? (
                      <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-tighter">
                        <Ban size={14}/> Depleted
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center w-32">
                          <span className="text-[10px] font-black text-slate-400">{product.stock} Units</span>
                          <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                        </div>
                        <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${product.stock < 5 ? 'bg-amber-500' : 'bg-blue-600'}`} 
                            style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-8 text-right">
                    <span className="text-xl font-black text-slate-900 tracking-tighter">${product.sellingPrice}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(product)} className="p-3 bg-white text-slate-400 hover:text-blue-600 hover:shadow-md rounded-2xl border border-slate-100 transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:shadow-md rounded-2xl border border-slate-100 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MASTER EDIT FORM MODAL (All Fields) --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl my-auto animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[3rem]">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Update Registry Item</h2>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">System Ref: {editingProduct}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-4 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                
                {/* Full Width Fields */}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Tag size={12}/> Product Name</label>
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 font-bold" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={12}/> Category</label>
                  <select value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm">
                    {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Barcode size={12}/> SKU/Barcode</label>
                  <input type="text" value={editFormData.sku} onChange={(e) => setEditFormData({...editFormData, sku: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-mono font-bold" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><DollarSign size={12}/> Cost Price</label>
                  <input type="number" step="0.01" value={editFormData.costPrice} onChange={(e) => setEditFormData({...editFormData, costPrice: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-green-600 uppercase tracking-widest ml-1 flex items-center gap-2"><DollarSign size={12}/> Selling Price</label>
                  <input type="number" step="0.01" value={editFormData.sellingPrice} onChange={(e) => setEditFormData({...editFormData, sellingPrice: e.target.value})} className="w-full p-4 bg-green-50 text-green-700 rounded-2xl border-none font-black" required />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Inventory Count</label>
                  <input type="number" value={editFormData.stock} onChange={(e) => setEditFormData({...editFormData, stock: e.target.value})} className="w-full p-5 bg-slate-900 text-white rounded-2xl border-none font-black text-2xl" required />
                </div>

              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3">
                <CheckCircle size={22} /> Synchronize Registry Data
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;