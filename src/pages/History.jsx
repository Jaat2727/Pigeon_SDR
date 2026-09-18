import { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import './History.css';

const MOCK_HISTORY = [
  {
    id: 'PIGN-8921',
    eventName: 'Pigeon SDR Prototype PCB Fabrication',
    billNumber: 'INV-2026-902',
    date: '2026-09-02',
    amount: 26900,
    status: 'paid',
    department: 'Hardware Lab',
    claimant: 'Nishu'
  },
  {
    id: 'PIGN-8840',
    eventName: 'Hackathon Server Infrastructure & Cloud Credits',
    billNumber: 'INV-2026-871',
    date: '2026-09-10',
    amount: 22000,
    status: 'approved',
    department: 'Cloud Services',
    claimant: 'Nishu'
  },
  {
    id: 'PIGN-8712',
    eventName: 'Antenna Mount Kit & Coaxial SDR Adapters',
    billNumber: 'INV-2026-764',
    date: '2026-09-15',
    amount: 5850,
    status: 'pending_review',
    department: 'RF Engineering',
    claimant: 'Nishu'
  },
  {
    id: 'PIGN-8699',
    eventName: 'Workshop Hardware & RF Dongle Components',
    billNumber: 'INV-2026-722',
    date: '2026-09-18',
    amount: 8400,
    status: 'pending_review',
    department: 'Outreach',
    claimant: 'Nishu'
  },
  {
    id: 'PIGN-8551',
    eventName: 'Travel Conveyance for IEEE Field Deployment',
    billNumber: 'TA-2026-102',
    date: '2026-08-25',
    amount: 4200,
    status: 'paid',
    department: 'Field Ops',
    claimant: 'Nishu'
  }
];

export default function History() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const filteredBills = useMemo(() => {
    return MOCK_HISTORY.filter(bill => {
      const matchStatus = filterStatus === 'All' || 
        (filterStatus === 'Paid' && bill.status === 'paid') ||
        (filterStatus === 'Approved' && bill.status === 'approved') ||
        (filterStatus === 'Pending' && bill.status === 'pending_review');

      const matchQuery = 
        bill.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchQuery;
    });
  }, [filterStatus, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Claim ID', 'Project/Event', 'Invoice No', 'Date', 'Amount (INR)', 'Status', 'Division'];
    const rows = filteredBills.map(b => [
      b.id,
      `"${b.eventName}"`,
      b.billNumber,
      b.date,
      b.amount,
      b.status,
      b.department
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pigeon_sdr_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-view">
      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="history-title">Reimbursement Claims History</h1>
          <p className="history-subtitle">Search, track status, and export itemized logs of all Pigeon SDR expense filings.</p>
        </div>

        <button type="button" className="btn-export" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="history-toolbar">
        <div className="search-box">
          <Search size={17} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by event name, claim ID, or bill no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          {['All', 'Pending', 'Approved', 'Paid'].map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-pill ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="pigeon-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Event / Description</th>
                <th>Bill Ref</th>
                <th>Date</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span className="id-badge">{bill.id}</span>
                    </td>
                    <td>
                      <div className="event-cell-name">{bill.eventName}</div>
                    </td>
                    <td>
                      <span className="ref-cell">{bill.billNumber}</span>
                    </td>
                    <td>{bill.date}</td>
                    <td>{bill.department}</td>
                    <td>
                      <strong className="amount-cell">₹ {bill.amount.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className={`table-status-pill pill-${bill.status}`}>
                        {bill.status === 'paid' && 'Reimbursed'}
                        {bill.status === 'approved' && 'Approved'}
                        {bill.status === 'pending_review' && 'Under Review'}
                      </span>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        className="btn-view-claim"
                        onClick={() => setSelectedBill(bill)}
                      >
                        <ExternalLink size={15} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="table-empty-state">
                    <AlertCircle size={32} />
                    <p>No claims found matching the filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBill && (
        <div className="modal-overlay" onClick={() => setSelectedBill(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Claim Detail — {selectedBill.id}</h3>
              <button 
                type="button" 
                className="modal-close"
                onClick={() => setSelectedBill(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content-body">
              <div className="modal-data-row">
                <span className="data-key">Project / Description:</span>
                <span className="data-val font-semibold">{selectedBill.eventName}</span>
              </div>
              <div className="modal-data-row">
                <span className="data-key">Department Division:</span>
                <span className="data-val">{selectedBill.department}</span>
              </div>
              <div className="modal-data-row">
                <span className="data-key">Invoice Number:</span>
                <span className="data-val">{selectedBill.billNumber}</span>
              </div>
              <div className="modal-data-row">
                <span className="data-key">Filing Date:</span>
                <span className="data-val">{selectedBill.date}</span>
              </div>
              <div className="modal-data-row">
                <span className="data-key">Claimant:</span>
                <span className="data-val">{selectedBill.claimant}</span>
              </div>
              <div className="modal-data-row">
                <span className="data-key">Claim Amount:</span>
                <span className="data-val text-primary-lg">₹ {selectedBill.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="modal-data-row">
                <span className="data-key">Current Status:</span>
                <span className={`table-status-pill pill-${selectedBill.status}`}>
                  {selectedBill.status}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setSelectedBill(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
