import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white">
                <div className="p-4">
                    <h2 className="text-2xl font-bold">Admin Panel</h2>
                </div>
                <nav className="mt-8">
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-700">
                        Dashboard
                    </Link>
                    <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-700">
                        Users
                    </Link>
                    <Link to="/admin/reports" className="block px-4 py-2 hover:bg-gray-700">
                        Reports
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <header className="bg-white shadow">
                    <div className="px-8 py-4">
                        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                    </div>
                </header>
                <main className="p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
