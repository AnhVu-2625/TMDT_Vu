import React from 'react';
import { motion } from 'framer-motion';

export const Dashboard = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
    <h1 className="text-3xl font-bold">Seller Dashboard</h1>
  </motion.div>
);

export const Products = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
    <h1 className="text-3xl font-bold">Seller Products</h1>
  </motion.div>
);

export const Orders = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
    <h1 className="text-3xl font-bold">Seller Orders</h1>
  </motion.div>
);
