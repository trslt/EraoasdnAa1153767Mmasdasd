import React, { useState } from 'react';
import './YoupiterTable.scss';

// Definizione dei tipi
export interface ProjectData {
  id: string;
  [key: string]: any;
  subRows?: ProjectData[];
  isCollapsible?: boolean;
  subRowColumns?: Column[]; // Colonne personalizzate per le sottorighe
}

interface Column {
  key: string;
  title: string;
  width?: string;
  render?: (value: any, row: ProjectData) => React.ReactNode;
  sortable?: boolean;
}

interface YoupiterTableProps {
  columns: Column[];
  data: ProjectData[];
  className?: string;
}

// Icone per le frecce e gli indicatori
const ArrowUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function YoupiterTable({ columns, data, className }: YoupiterTableProps)  {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Gestisce l'espansione/chiusura delle righe
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Gestisce l'ordinamento delle colonne
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Applica l'ordinamento ai dati
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Renderizza la riga della tabella
  const renderRow = (row: ProjectData, level: number = 0, customColumns?: Column[]) => {
    const isExpanded = !!expandedRows[row.id];
    const columnsToUse = customColumns || columns;
    
    return (
      <React.Fragment key={row.id}>
        <tr className={`project-table__row ${level > 0 ? 'project-table__row--child' : ''}`}>
          {row.isCollapsible && (
            <td className="project-table__toggle-cell">
              <button 
                className="project-table__toggle-button"
                onClick={() => toggleRowExpansion(row.id)}
              >
                {isExpanded ? <ChevronDown /> : <ChevronRight />}
              </button>
            </td>
          )}
          
          {!row.isCollapsible && level === 0 && (
            <td className="project-table__spacer-cell"></td>
          )}
          
          {level > 0 && !row.isCollapsible && (
            <td className="project-table__indent-cell"></td>
          )}
          
          {columnsToUse.map(column => (
            <td 
              key={column.key} 
              className="project-table__cell"
              style={{ width: column.width }}
            >
              {column.render 
                ? column.render(row[column.key], row) 
                : row[column.key]}
            </td>
          ))}
        </tr>
        
        {row.isCollapsible && isExpanded && row.subRows && row.subRows.length > 0 && (
          <>
            {row.subRowColumns && (
              <tr className="project-table__subheader-row">
                <td className="project-table__spacer-cell"></td>
                {row.subRowColumns.map(column => (
                  <td 
                    key={column.key} 
                    className="project-table__subheader-cell"
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </td>
                ))}
              </tr>
            )}
            {row.subRows.map(subRow => (
              renderRow(subRow, level + 1, row.subRowColumns || columnsToUse)
            ))}
          </>
        )}
      </React.Fragment>
    );
  };

  // Renderizza l'indicatore di ordinamento
  const renderSortIndicator = (columnKey: string) => {
    if (sortConfig && sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? <ArrowUp /> : <ArrowDown />;
    }
    return null;
  };

  return (
    <div className={`project-table-container ${className || ''}`}>
      <table className="project-table">
        <thead>
          <tr>
            <th className="project-table__toggle-header"></th>
            {columns.map(column => (
              <th 
                key={column.key} 
                className={`project-table__header ${column.sortable ? 'project-table__header--sortable' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{ width: column.width }}
              >
                <div className="project-table__header-content">
                  {column.title}
                  {column.sortable && (
                    <span className="project-table__sort-indicator">
                      {renderSortIndicator(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map(row => renderRow(row))}
        </tbody>
      </table>
    </div>
  );
};
