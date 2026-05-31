import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const SellerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
