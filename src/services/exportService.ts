import { ResidueBatch, TransactionRecord } from '../types';

export const exportService = {
  exportBatchesToCsv(batches: ResidueBatch[]) {
    const headers = [
      'Batch ID',
      'Residue Type',
      'Supplier Name',
      'Supplier Type',
      'Location',
      'District',
      'Quantity (t)',
      'Quantity (kg)',
      'Moisture (%)',
      'Ash (%)',
      'Carbon (%)',
      'Contamination',
      'Storage Condition',
      'Preferred Route',
      'Status',
      'Data Confidence',
      'Collection Distance (km)',
      'Available Date',
    ];

    const rows = batches.map((b) => [
      b.id,
      `"${b.residueType}"`,
      `"${b.supplierName}"`,
      b.supplierType,
      `"${b.location}"`,
      b.district,
      b.quantityTonnes,
      b.quantityKg,
      b.moisturePercent !== null ? b.moisturePercent : 'Not measured',
      b.ashPercent !== null ? b.ashPercent : 'Not measured',
      b.carbonContentPercent !== null ? b.carbonContentPercent : 'Not measured',
      `"${b.contaminationStatus}"`,
      `"${b.storageCondition}"`,
      `"${b.preferredRoute}"`,
      b.status,
      `"${b.dataConfidence}"`,
      b.estimatedCollectionDistanceKm,
      b.availableDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `biomass_inventory_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  },

  exportTransactionsToCsv(transactions: TransactionRecord[]) {
    const headers = [
      'Transaction ID',
      'Batch ID',
      'Residue Type',
      'Supplier',
      'Buyer',
      'Quantity (t)',
      'Agreed Price / t (INR)',
      'Total Agreed Value (INR)',
      'Transport Cost (INR)',
      'Net Value (INR)',
      'Processing Route',
      'Transporter',
      'Pickup Date',
      'Delivery Date',
      'Status',
      'End Use Category',
      'End Use Facility',
      'Simulated Evidence',
      'Rejection Reason',
    ];

    const rows = transactions.map((t) => [
      t.id,
      t.batchId,
      `"${t.residueType}"`,
      `"${t.supplierName}"`,
      `"${t.buyerName}"`,
      t.quantityTonnes,
      t.agreedPricePerTonne,
      t.totalAgreedValue,
      t.estimatedTransportCost,
      t.netSimulatedValue,
      `"${t.processingRoute}"`,
      `"${t.transporterName}"`,
      t.proposedPickupDate,
      t.deliveryDate || 'N/A',
      t.status,
      `"${t.endUseCategory || 'N/A'}"`,
      `"${t.endUseFacility || 'N/A'}"`,
      `"${t.simulatedVerificationEvidence || 'N/A'}"`,
      `"${t.rejectionReason || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `biomass_transactions_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  },

  downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
