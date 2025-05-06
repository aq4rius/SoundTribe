// client/src/components/layout/Layout.tsx

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-2 md:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;