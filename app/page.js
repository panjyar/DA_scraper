'use client';

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Calendar, MapPin, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

// Supabase Configuration\
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TABLE_NAME = process.env.NEXT_PUBLIC_TABLE_NAME;

const DARecordsViewer = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDecision, setSelectedDecision] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();
      setRecords(data);
      setFilteredRecords(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(records.map(r => r.Categories).filter(Boolean))];
  const decisions = ['All', ...new Set(records.map(r => r.Decision).filter(Boolean))];

  useEffect(() => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.DA_Number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Property_Address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Applicant?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(record => record.Categories === selectedCategory);
    }

    if (selectedDecision !== 'All') {
      filtered = filtered.filter(record => record.Decision === selectedDecision);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedDecision, records]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading DA Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Connection Error</h2>
          <p style={styles.errorMessage}>{error}</p>
          <div style={styles.warningBox}>
            <p style={styles.warningText}>
              <strong>Setup Required:</strong> Please update SUPABASE_URL and SUPABASE_ANON_KEY in the code.
            </p>
          </div>
          <button onClick={fetchRecords} style={styles.retryButton}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>Shoalhaven City Council</h1>
              <p style={styles.subtitle}>Development Application Records - September 2025</p>
            </div>
            <div style={styles.recordCount}>
              {filteredRecords.length} Records
            </div>
          </div>

          <div style={styles.controls}>
            <div style={styles.searchWrapper}>
              <Search style={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search by DA Number, Description, Address, or Applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.select}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              style={styles.select}
            >
              {decisions.map(dec => (
                <option key={dec} value={dec}>{dec}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {currentRecords.length === 0 ? (
          <div style={styles.noResults}>
            <FileText style={{ color: '#999', marginBottom: '20px' }} size={64} />
            <h3 style={styles.noResultsTitle}>No Records Found</h3>
            <p style={styles.noResultsText}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div style={styles.recordsGrid}>
            {currentRecords.map((record, index) => (
              <div key={index} style={styles.recordCard}>
                <div style={styles.recordHeader}>
                  <div>
                    <h3 style={styles.daNumber}>
                      {record.DA_Number || 'N/A'}
                    </h3>
                    {record.Categories && (
                      <span style={styles.categoryBadge}>
                        {record.Categories}
                      </span>
                    )}
                  </div>
                  <div style={styles.headerActions}>
                    {record.Decision && (
                      <span style={{
                        ...styles.badge,
                        ...getDecisionStyle(record.Decision)
                      }}>
                        {record.Decision}
                      </span>
                    )}
                    {record.Detail_URL && (
                      <a
                        href={record.Detail_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.viewButton}
                      >
                        View Details <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                {record.Description && (
                  <p style={styles.description}>{record.Description}</p>
                )}

                <div style={styles.infoGrid}>
                  {record.Property_Address && (
                    <div style={styles.infoItem}>
                      <MapPin style={styles.icon} size={20} />
                      <div>
                        <p style={styles.infoLabel}>Property Address</p>
                        <p style={styles.infoValue}>{record.Property_Address}</p>
                      </div>
                    </div>
                  )}
                  {record.Applicant && (
                    <div style={styles.infoItem}>
                      <User style={styles.icon} size={20} />
                      <div>
                        <p style={styles.infoLabel}>Applicant</p>
                        <p style={styles.infoValue}>{record.Applicant}</p>
                      </div>
                    </div>
                  )}
                  {record.Submitted_Date && (
                    <div style={styles.infoItem}>
                      <Calendar style={styles.icon} size={20} />
                      <div>
                        <p style={styles.infoLabel}>Submitted Date</p>
                        <p style={styles.infoValue}>{record.Submitted_Date}</p>
                      </div>
                    </div>
                  )}
                  {record.Fees && record.Fees !== 'Not required' && (
                    <div style={styles.infoItem}>
                      <FileText style={styles.icon} size={20} />
                      <div>
                        <p style={styles.infoLabel}>Fees</p>
                        <p style={styles.infoValue}>{record.Fees}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.pageButton,
                ...(currentPage === 1 ? styles.pageButtonDisabled : {})
              }}
            >
              <ChevronLeft size={20} /> Previous
            </button>

            <div style={styles.pageNumbers}>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      ...styles.pageButton,
                      ...(currentPage === pageNum ? styles.pageButtonActive : {})
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.pageButton,
                ...(currentPage === totalPages ? styles.pageButtonDisabled : {})
              }}
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p>Shoalhaven City Council Development Applications | Data Period: September 2025</p>
      </footer>
    </div>
  );
};

const getDecisionStyle = (decision) => {
  const lower = decision?.toLowerCase() || '';
  if (lower.includes('approved')) {
    return { backgroundColor: '#d1fae5', color: '#065f46' };
  }
  if (lower.includes('refused')) {
    return { backgroundColor: '#fee2e2', color: '#991b1b' };
  }
  return { backgroundColor: '#e5e7eb', color: '#374151' };
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  spinner: {
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '500',
  },
  errorCard: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  errorMessage: {
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  warningText: {
    color: '#92400e',
    fontSize: '0.9rem',
    margin: 0,
  },
  retryButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  header: {
    background: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem',
    margin: 0,
  },
  recordCount: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: 'bold',
  },
  controls: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1',
    minWidth: '300px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  select: {
    padding: '12px 20px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  noResults: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    padding: '60px 20px',
    textAlign: 'center',
  },
  noResultsTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  noResultsText: {
    color: '#666',
    fontSize: '1.1rem',
  },
  recordsGrid: {
    display: 'grid',
    gap: '24px',
  },
  recordCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
  },
  recordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  daNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#667eea',
    margin: '0 0 8px 0',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: '#e0e7ff',
    color: '#4c51bf',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  viewButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.2s',
  },
  description: {
    color: '#444',
    lineHeight: '1.6',
    marginBottom: '16px',
    fontSize: '1.05rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
  },
  infoItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  icon: {
    color: '#667eea',
    flexShrink: 0,
    marginTop: '2px',
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '4px',
    margin: 0,
  },
  infoValue: {
    color: '#333',
    fontWeight: '500',
    margin: 0,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '40px',
    flexWrap: 'wrap',
  },
  pageNumbers: {
    display: 'flex',
    gap: '8px',
  },
  pageButton: {
    background: 'white',
    color: '#333',
    border: '2px solid #ddd',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
  },
  pageButtonActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: 'transparent',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  footer: {
    background: 'white',
    borderTop: '1px solid #e5e7eb',
    padding: '24px',
    textAlign: 'center',
    color: '#666',
  },
};

export default DARecordsViewer;