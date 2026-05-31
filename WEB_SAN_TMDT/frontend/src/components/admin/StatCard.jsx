import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = 'red', sub }) {
  const colors = {
    red:    'bg-red-600/10 text-red-400 border-red-600/20',
    blue:   'bg-blue-600/10 text-blue-400 border-blue-600/20',
    green:  'bg-green-600/10 text-green-400 border-green-600/20',
    yellow: 'bg-yellow-600/10 text-yellow-400 border-yellow-600/20',
    purple: 'bg-purple-600/10 text-purple-400 border-purple-600/20',
    orange: 'bg-orange-600/10 text-orange-400 border-orange-600/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg border ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}
