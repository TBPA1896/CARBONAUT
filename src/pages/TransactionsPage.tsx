import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  FileCheck2,
  XCircle,
  Download,
  ShieldCheck,
  Building2,
  Scale,
  IndianRupee,
  Truck,
  Eye,
  AlertTriangle,
  History,
  X,
  Sparkles,
} from 'lucide-react';
import { transactionService, VALID_STATUS_TRANSITIONS } from '../services/transactionService';
import { exportService } from '../services/exportService';
import { TransactionRecord, TransactionStatus } from '../types';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);

  // Status transition modal state
  const [transitionTargetTxn, setTransitionTargetTxn] = useState<TransactionRecord | null>(null);
  const [nextStatus, setNextStatus] = useState<TransactionStatus>('Accepted');
  const [statusNote, setStatusNote] = useState('');

  // Rejection modal state
  const [rejectionTargetTxn, setRejectionTargetTxn] = useState<TransactionRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // End-use verification modal state
  const [verificationTargetTxn, setVerificationTargetTxn] = useState<TransactionRecord | null>(null);
  const [endUseCategory, setEndUseCategory] = useState(
    'Precipitated Amorphous Silica for Green Tire Rubber'
  );
  const [endUseFacility, setEndUseFacility] = useState(
    'Telangana Advanced Silicates Calcining Plant #1, Pashamylaram'
  );
  const [simulatedEvidence, setSimulatedEvidence] = useState(
    'Weighbridge Ticket #WB-9042; XRD Amorphous Test 99.1%; LOI < 1.8%'
  );
  const [verificationNotes, setVerificationNotes] = useState(
    'Batch fully calcined. High purity pozzolanic silicate verified. Zero combustion emissions diverted to air scrubber.'
  );

  const loadData = () => {
    setTransactions(transactionService.getAllTransactions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bvm_storage_update', loadData);
    return () => window.removeEventListener('bvm_storage_update', loadData);
  }, []);

  const handleAdvanceClick = (txn: TransactionRecord) => {
    const validNext = VALID_STATUS_TRANSITIONS[txn.status];
    if (validNext && validNext.length > 0) {
      setTransitionTargetTxn(txn);
      setNextStatus(validNext[0]);
      setStatusNote(`Transitioned to ${validNext[0]} via platform operations desk.`);
    }
  };

  const handleConfirmAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (transitionTargetTxn) {
      transactionService.advanceStatus(transitionTargetTxn.id, nextStatus, statusNote);
      setTransitionTargetTxn(null);
      loadData();
    }
  };

  const handleRejectClick = (txn: TransactionRecord) => {
    setRejectionTargetTxn(txn);
    setRejectionReason('Feedstock quality does not meet technical boiler specifications.');
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectionTargetTxn) {
      transactionService.rejectTransaction(rejectionTargetTxn.id, rejectionReason);
      setRejectionTargetTxn(null);
      loadData();
    }
  };

  const handleOpenVerification = (txn: TransactionRecord) => {
    setVerificationTargetTxn(txn);
  };

  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationTargetTxn) {
      transactionService.recordEndUse(verificationTargetTxn.id, {
        endUseCategory,
        endUseFacility,
        simulatedVerificationEvidence: simulatedEvidence,
        verificationNotes,
      });
      setVerificationTargetTxn(null);
      loadData();
    }
  };

  const handleExportCsv = () => {
    exportService.exportTransactionsToCsv(transactions);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Transactions & Verification</h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {transactions.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full simulated lifecycle: Listed → Matched → Buyer Request → Accepted → Scheduled → Delivered → Verified End Use
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Transactions CSV
            </button>
          </div>
        </div>

        <div className="mt-4 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <strong>Simulated Demo Ledger:</strong> No real buyer contacted, and no monetary funds exchanged.
          </span>
          <span className="text-[10px] text-amber-700 font-mono">Academic Proof-of-Concept</span>
        </div>
      </div>

      {/* Transactions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Batch & Residue</th>
                <th className="py-3 px-4">Parties (Supplier → Buyer)</th>
                <th className="py-3 px-4 text-right">Agreed Value</th>
                <th className="py-3 px-4">Processing Route</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => {
                const canAdvance =
                  VALID_STATUS_TRANSITIONS[txn.status] &&
                  VALID_STATUS_TRANSITIONS[txn.status].length > 0 &&
                  txn.status !== 'Delivered';
                const canVerify = txn.status === 'Delivered';
                const isRejected = txn.status === 'Rejected';
                const isCompleted = txn.status === 'End Use Recorded';

                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {txn.id}
                      <div className="text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900">{txn.residueType}</span>
                      <div className="text-[10px] text-slate-500">
                        Batch: <span className="font-mono">{txn.batchId}</span> ({txn.quantityTonnes} t)
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{txn.supplierName}</div>
                      <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        {txn.buyerName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{txn.totalAgreedValue.toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] text-slate-500">
                        @ ₹{txn.agreedPricePerTonne.toLocaleString('en-IN')}/t
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {txn.processingRoute}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRejected
                            ? 'bg-red-100 text-red-800'
                            : txn.status === 'Delivered'
                            ? 'bg-blue-100 text-blue-800'
                            : txn.status === 'Pickup Scheduled' || txn.status === 'In Transit'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="View Audit Trail & Status History"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {canAdvance && (
                          <button
                            onClick={() => handleAdvanceClick(txn)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-700 border border-emerald-200 rounded-lg transition"
                          >
                            Advance Status
                          </button>
                        )}

                        {canVerify && (
                          <button
                            onClick={() => handleOpenVerification(txn)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-2xs"
                          >
                            Record End Use
                          </button>
                        )}

                        {!isRejected && !isCompleted && txn.status !== 'Delivered' && (
                          <button
                            onClick={() => handleRejectClick(txn)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Reject Transaction with Reason"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW AUDIT HISTORY MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setSelectedTxn(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedTxn.id}
              </span>
              <span className="font-semibold text-slate-700">{selectedTxn.status}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Transaction Lifecycle & Verification Record
            </h3>
            <p className="text-slate-500 mb-4">
              Batch {selectedTxn.batchId} • {selectedTxn.quantityTonnes} t of {selectedTxn.residueType}
            </p>

            {/* End Use Verification Evidence Card if available */}
            {selectedTxn.simulatedVerificationEvidence && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1.5 mb-4">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  Simulated End-Use Verification Evidence
                </span>
                <p className="font-semibold text-slate-900">{selectedTxn.endUseCategory}</p>
                <p className="text-slate-600 text-[11px]">Facility: {selectedTxn.endUseFacility}</p>
                <div className="p-2 bg-white rounded border border-blue-100 font-mono text-[10px] text-slate-700">
                  {selectedTxn.simulatedVerificationEvidence}
                </div>
                {selectedTxn.verificationNotes && (
                  <p className="text-slate-600 text-[11px] italic">
                    "{selectedTxn.verificationNotes}"
                  </p>
                )}
              </div>
            )}

            {/* Rejection notice if rejected */}
            {selectedTxn.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 mb-4 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] block">
                  Rejection Reason:
                </span>
                <p className="text-xs">{selectedTxn.rejectionReason}</p>
              </div>
            )}

            {/* Audit Trail Timeline */}
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-3">
                Timestamped Audit Trail:
              </span>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {selectedTxn.statusHistory.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-6">
                    <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{step.status}</strong>
                        <span className="text-[10px] text-slate-400">
                          {new Date(step.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 text-[11px]">{step.note}</p>
                      <span className="text-[10px] text-slate-400">Actor: {step.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCE STATUS MODAL */}
      {transitionTargetTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Advance Transaction Status
            </h3>
            <p className="text-slate-500 mb-4">
              Advance {transitionTargetTxn.id} ({transitionTargetTxn.status})
            </p>

            <form onSubmit={handleConfirmAdvance} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Next Valid Status</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as TransactionStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold focus:outline-none focus:border-emerald-600"
                >
                  {VALID_STATUS_TRANSITIONS[transitionTargetTxn.status].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Audit Note</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransitionTargetTxn(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs"
                >
                  Confirm Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION WORKFLOW MODAL */}
      {rejectionTargetTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <h3 className="text-base font-bold text-red-900 mb-1 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600" />
              Reject Simulated Transaction
            </h3>
            <p className="text-slate-500 mb-4">
              Enter formal rejection reason for audit registry
            </p>

            <form onSubmit={handleConfirmRejection} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Rejection / Technical Non-Compliance:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-red-200 bg-red-50/20 rounded-xl focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Notice: Rejection will release the associated batch back to "Available" status in inventory.
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionTargetTxn(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD END USE & VERIFY MODAL */}
      {verificationTargetTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              Record End-Use & Attach Simulated Evidence
            </h3>
            <p className="text-slate-500 mb-4">
              Verify cargo delivery at destination gate and record circular material conversion
            </p>

            <form onSubmit={handleConfirmVerification} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  End-Use Category
                </label>
                <input
                  type="text"
                  value={endUseCategory}
                  onChange={(e) => setEndUseCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Industrial Processing Facility
                </label>
                <input
                  type="text"
                  value={endUseFacility}
                  onChange={(e) => setEndUseFacility(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Simulated QA / Weighbridge Evidence
                </label>
                <input
                  type="text"
                  value={simulatedEvidence}
                  onChange={(e) => setSimulatedEvidence(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Verification Auditor Notes
                </label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVerificationTargetTxn(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                >
                  Save End-Use Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
