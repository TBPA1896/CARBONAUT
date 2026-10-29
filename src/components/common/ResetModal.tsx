import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSuccess: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onResetSuccess }) => {
  if (!isOpen) return null;

  const handleReset = () => {
    storageService.resetToSeedData();
    onResetSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-amber-600 mb-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Reset Demo Data?</h3>
            <p className="text-xs text-slate-500">Restore factory baseline state</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          This will restore all <strong className="text-slate-800">18 residue batches</strong>,{' '}
          <strong className="text-slate-800">16 buyer profiles</strong>, and sample simulated transactions to their initial presentation state. Any custom batches or records you created will be reset.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Confirm & Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
