import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import './sidebar.scss'; // Importa lo stile SCSS

// Definizione dei tipi per TypeScript
export interface SidebarItem {
  icon?: React.ReactNode;
  label: string;
  badge?: string | number;
  expandable?: boolean;
  active?: boolean;
  special?: boolean;
  items?: SidebarItem[];
  onClick?: () => void;
  href?: string;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
  expandable?: boolean;
}

export interface SidebarProps {
  id?: string; // Aggiungiamo questa prop
  className?: string;
  sections: SidebarSection[];
  defaultExpandedItems?: Record<string, boolean>;
  onItemClick?: (item: SidebarItem, section?: SidebarSection) => void;
  showIcons?: boolean;
  theme?: 'light' | 'dark' | 'custom';
  customClass?: string;
}

export default function YoupiterSidebar({
  id = 'sidebar', // Valore di default
  className = '',
  sections = [],
  defaultExpandedItems = {},
  onItemClick,
  showIcons = true,
  theme = 'light',
  customClass = ''
}: SidebarProps) {
  // Stato per tenere traccia degli elementi espansi
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(defaultExpandedItems);
  
  // Aggiorna lo stato degli elementi espansi quando cambiano le prop
  useEffect(() => {
    setExpandedItems(prev => ({
      ...prev,
      ...defaultExpandedItems
    }));
  }, [defaultExpandedItems]);

  // Funzione per gestire l'espansione/compressione
  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  // Gestione del click su un elemento
  const handleItemClick = (e: React.MouseEvent, item: SidebarItem, section?: SidebarSection) => {
    // Se l'elemento è espandibile, togliamo il comportamento predefinito
    if (item.expandable) {
      e.preventDefault();
      toggleExpand(item.label);
    }
    
    // Se c'è un handler personalizzato per il click, chiamalo
    if (item.onClick) {
      item.onClick();
    }
    
    // Se c'è un handler globale, chiamalo
    if (onItemClick) {
      onItemClick(item, section);
    }
  };

  // Classe del tema
  const themeClass = theme === 'custom' ? customClass : `sidebar-theme-${theme}`;
  
  return (
    <div id={id} className={`sidebar ${themeClass} ${className}`}>
      <nav className="sidebar__nav">
        {sections.map((section, sectionIndex) => (
          <div key={section.title || `section-${sectionIndex}`} className="nav-group">
            {section.title && (
              <div className="nav-group-title">{section.title}</div>
            )}
            
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={`${section.title}-${item.label}`}>
                <a 
                  className={`nav-item nav-item-main ${item.active ? 'active' : ''} ${item.special ? 'nav-special' : ''}`}
                  href={item.href || "#"}
                  onClick={(e) => handleItemClick(e, item, section)}
                >
                  {showIcons && item.icon && (
                    <span className="item-icon">{item.icon}</span>
                  )}
                  <span className="item-label">{item.label}</span>
                  {item.badge && (
                    <span className="item-badge">{item.badge}</span>
                  )}
                  {item.expandable && (
                    expandedItems[item.label] 
                      ? <ChevronDown size={16} className="item-expand" /> 
                      : <ChevronRight size={16} className="item-expand" />
                  )}
                </a>

                {/* Sottomenu, se l'elemento è espandibile e attualmente espanso */}
                {item.expandable && expandedItems[item.label] && item.items && item.items.length > 0 && (
                  <div className="nav-group-submenu">
                    {item.items.map((subItem, subIndex) => (
                      <a 
                        key={`${item.label}-${subItem.label}`}
                        className={`nav-item ${subItem.active ? 'active' : ''} ${subItem.special ? 'nav-special' : ''}`}
                        href={subItem.href || "#"}
                        onClick={(e) => handleItemClick(e, subItem, section)}
                      >
                        {showIcons && subItem.icon && (
                          <span className="item-icon">{subItem.icon}</span>
                        )}
                        <span className="item-label">{subItem.label}</span>
                        {subItem.badge && (
                          <span className="item-badge">{subItem.badge}</span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}