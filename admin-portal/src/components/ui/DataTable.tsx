import React, { useState } from 'react';

export default function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  pageSize = 10,
  showPagination = true,
  className = '',
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = showPagination ? data.slice(startIndex, startIndex + pageSize) : data;

  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg)' }}>
              {columns.map((col: any, i: number) => (
                <th
                  key={i}
                  style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--color-border)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '80px 20px',
                    textAlign: 'center',
                  }}
                >
                  {EmptyIcon && (
                    <EmptyIcon
                      size={48}
                      style={{ color: 'var(--color-border)', margin: '0 auto 16px', display: 'block' }}
                    />
                  )}
                  <p style={{ fontSize: 15, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    {emptyMessage}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row: any, rowIdx: number) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  onMouseEnter={() => setHoveredRow(rowIdx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: hoveredRow === rowIdx ? 'var(--color-bg)' : 'var(--color-surface)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  {columns.map((col: any, colIdx: number) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: '14px 20px',
                        fontSize: 14,
                        fontFamily: 'var(--font-body)',
                        color: 'var(--color-text)',
                        borderBottom: '1px solid var(--color-border)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render ? col.render(row, hoveredRow === rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, data.length)} of {data.length}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <PaginationBtn onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</PaginationBtn>
            <PaginationBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</PaginationBtn>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <PaginationBtn key={page} onClick={() => setCurrentPage(page)} active={currentPage === page}>
                  {page}
                </PaginationBtn>
              );
            })}
            <PaginationBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</PaginationBtn>
            <PaginationBtn onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</PaginationBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationBtn({ children, onClick, disabled, active }: any) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: active ? 'var(--color-primary)' : hovered ? 'var(--color-bg)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-muted)',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transition: 'all var(--transition-fast)',
      }}
    >
      {children}
    </button>
  );
}
