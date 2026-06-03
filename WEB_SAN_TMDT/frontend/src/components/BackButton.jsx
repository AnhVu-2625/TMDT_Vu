import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HIDDEN_PATHS = ['/', '/login', '/register', '/verify-otp'];

export default function BackButton({ className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition ${className}`}
    >
      <FaArrowLeft size={14} />
      <span className="text-sm font-medium">Quay lại</span>
    </motion.button>
  );
}
