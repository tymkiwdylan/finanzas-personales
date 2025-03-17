'use client';

import { Header } from './Header';
import { ReactNode } from 'react';
import { BudgetProvider } from '@/context/BudgetContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <BudgetProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="bg-sky-800 text-white py-4 text-center text-sm">
          <p>© {new Date().getFullYear()} ControlCash</p>
        </footer>
      </div>
    </BudgetProvider>
  );
}
