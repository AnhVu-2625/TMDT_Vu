import React from 'react';
import { motion } from 'framer-motion';

export const Dashboard = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
  </motion.div>
);

export const Users = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
    <h1 className="text-3xl font-bold">Admin Users</h1>
  </motion.div>
);

export const Reports = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
    <h1 className="text-3xl font-bold">Admin Reports</h1>
  </motion.div>
);
