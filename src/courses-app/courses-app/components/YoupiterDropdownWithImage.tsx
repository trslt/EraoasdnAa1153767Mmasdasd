import React, { useState, useRef, useEffect } from 'react';

// Definizione dell'interfaccia per le opzioni del dropdown
export interface DropdownOption {
  id: string | number;
  icon: React.ReactNode | string; // Può essere un elemento React o un URL dell'immagine
  label: string;
}

interface YoupiterDropdownProps {
  options: DropdownOption[];
  value?: DropdownOption['id'];
  onChange?: (option: DropdownOption) => void;
  placeholder?: string;
  className?: string;
}

export default function YoupiterDropdownWithImage({
  options,
  value,
  onChange,
  placeholder = 'Seleziona un\'opzione',
  className = '',
}: YoupiterDropdownProps) {
  // Stato per tenere traccia dell'opzione selezionata
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(() => 
    options.find(option => option.id === value) || null
  );
  
  // Stato per controllare se il dropdown è aperto o chiuso
  const [isOpen, setIsOpen] = useState(false);
  
  // Riferimento al componente dropdown per la gestione del click esterno
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effetto per gestire i click esterni e chiudere il dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Aggiorna lo stato interno quando cambia il valore da props
  useEffect(() => {
    const newSelectedOption = options.find(option => option.id === value) || null;
    setSelectedOption(newSelectedOption);
  }, [value, options]);

  // Gestisce la selezione di un'opzione
  const handleSelectOption = (option: DropdownOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  // Renderizza l'icona (gestisce sia stringhe URL che componenti React)
  const renderIcon = (icon: React.ReactNode | string) => {
    if (typeof icon === 'string') {
      return <img src={icon} alt="" className="w-5 h-5 rounded-full" />;
    }
    return icon;
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative inline-block text-left ${className}`}
    >
      {/* Pulsante per aprire/chiudere il dropdown */}
      <div>
        <button
          type="button"
          className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? (
            <span className="flex items-center">
              <span className="mr-2">{renderIcon(selectedOption.icon)}</span>
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
          <svg
            className={`ml-2 h-5 w-5 transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Contenuto del dropdown */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.id}
                className={`
                  px-4 py-2 text-sm flex items-center cursor-pointer hover:bg-gray-100
                  ${selectedOption?.id === option.id ? 'bg-gray-50' : ''}
                `}
                onClick={() => handleSelectOption(option)}
              >
                <span className="mr-2">{renderIcon(option.icon)}</span>
                <span className="flex-grow">{option.label}</span>
                {selectedOption?.id === option.id && (
                  <svg 
                    className="h-5 w-5 text-gray-700" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};