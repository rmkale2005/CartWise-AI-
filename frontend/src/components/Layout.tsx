import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  GitFork,
  ShoppingCart,
  BrainCircuit,
  Users,
  LineChart,
  Lightbulb,
  BookOpen,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { api } from '../services/api';
import { DatasetMeta } from '../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Dataset Management', path: '/dataset', icon: Database },
  { name: 'Data Exploration (EDA)', path: '/eda', icon: BarChart3 },
  { name: 'Customer Behaviour', path: '/behaviour', icon: GitFork, tag: 'Mining' },
  { name: 'Cart Abandonment', path: '/abandonment', icon: ShoppingCart },
  { name: 'Abandonment Prediction', path: '/prediction', icon: BrainCircuit, tag: 'ML' },
  { name: 'Customer Segmentation', path: '/segmentation', icon: Users, tag: 'K-Means' },
  { name: 'Model Performance', path: '/model-performance', icon: LineChart },
  { name: 'Business Insights', path: '/insights', icon: Lightbulb },
  { name: 'About & Academic Report', path: '/about', icon: BookOpen },
];

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDataset, setActiveDataset] = useState<DatasetMeta | null>(null);
  const location = useLocation();

  useEffect(() => {
    api.getActiveDataset()
      .then((res) => {
        if (res.active) setActiveDataset(res.active);
      })
      .catch(() => {});
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-indigo-600/30">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">
                CartWise <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest -mt-1">
                Analytics Platform
              </span>
            </div>
          </NavLink>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Analytics Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {item.tag}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            External & Docs
          </div>
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <Layers className="w-4 h-4" />
            <span>Landing Page</span>
          </NavLink>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 group"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4" />
              <span>FastAPI Swagger UI</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">REST API</span>
          </a>
        </nav>

        {/* Dataset Status in Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Dataset</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {activeDataset?.name || 'Loading active dataset...'}
          </div>
          {activeDataset && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {activeDataset.session_count.toLocaleString()} sessions &bull; {activeDataset.row_count.toLocaleString()} events
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">CartWise AI</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {navItems.find((n) => n.path === location.pathname)?.name || 'Platform'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeDataset?.is_demo === 1 && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-3 h-3" />
                REES46 Demo Synthetic Data
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
