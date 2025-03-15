import React, { useState, useEffect } from 'react';
import "./YoupiterDataTable.scss"

// Tipi per le props del componente
export interface Column {
  id: string;
  label: string;
  accessorKey: string;
  sortable?: boolean;
  renderCell?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

export interface DataTableProps {
  data: Record<string, any>[];
  columns: Column[];
  onRowSelect?: (selectedRows: Record<string, any>[]) => void;
  onRowClick?: (row: Record<string, any>) => void;
  showCheckbox?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  actions?: React.ReactNode;
  emptyStateMessage?: string;
  rowKeyField?: string;
}

// Il componente principale DataTable
export default function YoupiterDataTable({
  data,
  columns,
  onRowSelect,
  onRowClick,
  showCheckbox = true,
  sortable = true,
  searchable = true,
  searchPlaceholder = "Cerca...",
  pagination = true,
  pageSize = 10,
  actions,
  emptyStateMessage = "Nessun dato disponibile",
  rowKeyField = "id"
}: DataTableProps) {
  // Stati per gestire la tabella
  const [filteredData, setFilteredData] = useState<Record<string, any>[]>(data);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);

  // Effetto per aggiornare i dati filtrati quando cambiano i dati o il termine di ricerca
  useEffect(() => {
    let result = [...data];
    
    // Filtraggio
    if (searchTerm) {
      result = result.filter(item => {
        return columns.some(column => {
          const value = item[column.accessorKey];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }
    
    // Ordinamento
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredData(result);
    setCurrentPage(1); // Reset alla prima pagina quando cambia il filtraggio
  }, [data, searchTerm, sortConfig]);

  // Gestione dell'ordinamento
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Gestione della selezione delle righe
  const handleRowSelect = (row: Record<string, any>) => {
    const isSelected = selectedRows.some(
      selectedRow => selectedRow[rowKeyField] === row[rowKeyField]
    );
    
    let newSelectedRows;
    
    if (isSelected) {
      newSelectedRows = selectedRows.filter(
        selectedRow => selectedRow[rowKeyField] !== row[rowKeyField]
      );
    } else {
      newSelectedRows = [...selectedRows, row];
    }
    
    setSelectedRows(newSelectedRows);
    if (onRowSelect) onRowSelect(newSelectedRows);
  };

  // Gestione della selezione di tutte le righe
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const currentPageData = getCurrentPageData();
    
    if (newSelectAll) {
      setSelectedRows(currentPageData);
    } else {
      setSelectedRows([]);
    }
    
    if (onRowSelect) onRowSelect(newSelectAll ? currentPageData : []);
  };

  // Calcola i dati della pagina corrente
  const getCurrentPageData = () => {
    if (!pagination) return filteredData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return filteredData.slice(startIndex, endIndex);
  };

  // Calcola il numero totale di pagine
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Controlla se una riga è selezionata
  const isRowSelected = (row: Record<string, any>) => {
    return selectedRows.some(
      selectedRow => selectedRow[rowKeyField] === row[rowKeyField]
    );
  };

  // Renderizza le icone di ordinamento
  const renderSortIcon = (columnId: string) => {
    if (!sortable) return null;
    
    if (sortConfig?.key === columnId) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    
    return ' ↕';
  };

  return (
    <div className="data-table-container">
      {/* Header con ricerca e azioni */}
      <div className="data-table-header">
        {searchable && (
          <div className="data-table-search">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="data-table-search-input"
            />
          </div>
        )}
        {actions && <div className="data-table-actions">{actions}</div>}
      </div>
      
      {/* Tabella */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {showCheckbox && (
                <th className="data-table-checkbox-header">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`data-table-th ${column.sortable !== false && sortable ? 'sortable' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => {
                    if (column.sortable !== false && sortable) {
                      handleSort(column.accessorKey);
                    }
                  }}
                >
                  {column.label}
                  {column.sortable !== false && sortable && renderSortIcon(column.accessorKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().length > 0 ? (
              getCurrentPageData().map((row, rowIndex) => (
                <tr
                  key={row[rowKeyField] || rowIndex}
                  className={`data-table-row ${isRowSelected(row) ? 'selected' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {showCheckbox && (
                    <td className="data-table-checkbox-cell" onClick={(e) => {
                      e.stopPropagation();
                      handleRowSelect(row);
                    }}>
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={`${row[rowKeyField] || rowIndex}-${column.id}`} className="data-table-td">
                      {column.renderCell
                        ? column.renderCell(row[column.accessorKey], row)
                        : row[column.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (showCheckbox ? 1 : 0)} className="data-table-empty-state">
                  {emptyStateMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginazione */}
      {pagination && totalPages > 1 && (
        <div className="data-table-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="data-table-pagination-button"
          >
            Precedente
          </button>
          <span className="data-table-pagination-info">
            Pagina {currentPage} di {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="data-table-pagination-button"
          >
            Successiva
          </button>
        </div>
      )}
    </div>
  );
};

