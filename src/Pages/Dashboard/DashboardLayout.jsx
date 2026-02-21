import React from "react";
import { Outlet, Link } from "react-router";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-8">POS Admin</h2>
        <nav className="space-y-4 flex flex-col">
          <Link to="/dashboard" className="hover:text-blue-300">Overview</Link>
          <Link to="/dashboard/addproduct" className="hover:text-blue-300">Add Product</Link>
          <Link to="/dashboard/inventory" className="hover:text-blue-300">Inventory Management</Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8">
        <Outlet /> 
      </div>
    </div>
  );
};

export default DashboardLayout;