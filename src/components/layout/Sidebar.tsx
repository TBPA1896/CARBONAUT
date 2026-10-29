import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  FlaskConical,
  Building2,
  Cpu,
  Truck,
  CheckCircle,
  BarChart3,
  Info,
  Leaf,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  onOpenReset: () => void;
  onOpenScenario: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenReset, onOpenScenario }) => {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Residue Inventory', path: '/inventory', icon: Boxes },
    { name: 'Add Residue Batch', path: '/add-batch', icon: PlusCircle },
    { name: 'Material Recovery Lab', path: '/recovery-lab', icon: FlaskConical },
    { name: 'Industry Buyer Network', path: '/buyers', icon: Building2 },
    { name: 'Smart Matching', path: '/matching', icon: Cpu },
    { name: 'Collection & Logistics', path: '/logistics', icon: Truck },
    { name: 'Transactions & Verification', path: '/transactions', icon: CheckCircle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Project Information', path: '/project-info', icon: Info },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Leaf className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              Biomass Value Match
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium">
              Valorization Platform
            </p>
          </div>
        </div>
        <div className="mt-2.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Anurag University
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
            PSE-I Proto
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Guided Walkthrough Banner */}
      <div className="p-3 mx-3 mb-3 bg-gradient-to-r from-emerald-950/80 to-slate-800/90 rounded-xl border border-emerald-800/40">
        <div className="flex items-center gap-2 mb-1.5 text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Presentation Guide
        </div>
        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
          8-step guided walkthrough prepared for college evaluation.
        </p>
        <button
          onClick={onOpenScenario}
          className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition text-center shadow-xs cursor-pointer"
        >
          Open Presentation Tour
        </button>
      </div>

      {/* Academic Simulation Notice & Reset */}
      <div className="p-3 border-t border-slate-800/90 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Simulated Prototype
          </span>
          <button
            onClick={onOpenReset}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium hover:underline cursor-pointer"
          >
            Reset Data
          </button>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          External Project • Dept. of Chemical / AI Engineering, AU.
        </div>
      </div>
    </aside>
  );
};
