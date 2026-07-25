import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import { tokens } from '../../theme/tokens';
import Chip from './Chip';

/**
 * DataTable Component
 * 
 * Glassmorphic data table with:
 * - Sortable columns
 * - Active row neon stripe
 * - Hover effects
 * - Responsive design
 * 
 * Props:
 * - columns: Array - Column definitions
 * - data: Array - Row data
 * - sortBy: string - Initial sort column
 * - sortDirection: 'asc' | 'desc' - Initial sort direction
 * - onRowClick: function - Row click handler
 * - selectedRow: string - Currently selected row ID
 * - className: string - Additional CSS classes
 */

const DataTable = ({
  columns,
  data,
  sortBy: initialSortBy,
  sortDirection: initialSortDirection = 'desc',
  onRowClick,
  selectedRow,
  className = '',
}) => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;
  
  // Only auto-sort by a column that opted into sorting — cell values are often
  // React elements, which must never reach the comparator by default.
  const [sortBy, setSortBy] = useState(
    initialSortBy || columns.find((c) => c.sortable)?.key,
  );
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  // React elements (and other cyclic objects) can't be JSON.stringify'd
  const toSortableString = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val !== 'object') return String(val);
    try {
      return JSON.stringify(val) ?? '';
    } catch {
      return '';
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      const aStr = toSortableString(aVal);
      const bStr = toSortableString(bVal);
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortDirection]);

  // Toggle sort
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortDirection('desc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (columnKey) => {
    if (sortBy !== columnKey) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  return (
    <div className={`data-table-container ${className}`} style={{
      width: '100%',
      overflowX: 'auto',
      borderRadius: 'var(--rounded-default)',
      background: currentTokens.surfaceContainerLow,
      border: `1px solid ${currentTokens.borderGlass}`,
    }}>
      <table className="table" style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}>
        {/* Table Header */}
        <thead>
          <tr style={{
            background: currentTokens.surfaceContainerLow,
          }}>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  textAlign: column.align || 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: '500',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--on-surface-variant)',
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  position: 'relative',
                  borderBottom: `1px solid ${currentTokens.borderGlass}`,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {column.header}
                  {column.sortable && (
                    <span style={{
                      color: currentTokens.primaryContainer,
                      fontSize: '10px',
                    }}>
                      {getSortIndicator(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--on-surface-variant)',
              }}>
                No data available
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const isSelected = selectedRow === row.id;
              const rowId = row.id || rowIndex;

              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * 0.05, duration: 0.3 }}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    borderBottom: `1px solid ${currentTokens.borderGlass}`,
                    position: 'relative',
                    transition: 'all var(--transition-fast)',
                  }}
                  whileHover={{
                    background: currentTokens.surfaceGlass,
                    scale: 1,
                  }}
                >
                  {/* Active row glow effect */}
                  {isSelected && (
                    <td colSpan={columns.length} style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: 'none',
                      background: 'linear-gradient(90deg, transparent, rgba(0, 255, 163, 0.05), transparent)',
                    }} />
                  )}
                  
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        textAlign: column.align || 'left',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: 'var(--on-surface)',
                        borderLeft: isSelected ? '2px solid var(--primary-container)' : 'none',
                      }}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

// Simplified DataTable without sorting (for simpler use cases)
export const SimpleDataTable = ({ columns, data, ...props }) => (
  <DataTable
    columns={columns.map(c => ({ ...c, sortable: false }))}
    data={data}
    sortBy={null}
    {...props}
  />
);

export default DataTable;
