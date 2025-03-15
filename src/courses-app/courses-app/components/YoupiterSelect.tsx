import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface YoupiterSelectValue {
    id: string;
    name: string;
    image: string;
}

interface DropdownSelectProps {
    values?: YoupiterSelectValue[];
    selectedValue?: YoupiterSelectValue;
    onChange?: (value: YoupiterSelectValue) => void;
}

const defaultValues: YoupiterSelectValue[] = [
    {
        id: "1",
        name: "Mick Poulaz",
        image: "/api/placeholder/24/24"
    },
    {
        id: "2",
        name: "Julien Schiano",
        image: "/api/placeholder/24/24"
    },
    {
        id: "3",
        name: "John Jackson",
        image: "/api/placeholder/24/24"
    }
];

export default function YoupiterSelect({
    values = defaultValues,
    selectedValue: externalSelectedValue = defaultValues[2],
    onChange
}: DropdownSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSelectedValue, setInternalSelectedValue] = useState(externalSelectedValue);

    // Aggiorna lo stato interno quando cambia la prop esterna
    useEffect(() => {
        setInternalSelectedValue(externalSelectedValue);
    }, [externalSelectedValue]);

    const handleSelect = (value: YoupiterSelectValue) => {
        setInternalSelectedValue(value);
        onChange?.(value);
        setIsOpen(false);
    };

    return (
        <div className="w-64">
            <div className="relative mt-1">
                <button
                    type="button"
                    className="relative w-full py-3 pl-3 pr-10 text-left bg-white rounded-md shadow-lg cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="flex items-center">
                        <img
                            src={internalSelectedValue.image}
                            alt={internalSelectedValue.name}
                            className="flex-shrink-0 w-6 h-6 rounded-full"
                        />
                        <span className="block ml-3 truncate">
                            {internalSelectedValue.name}
                        </span>
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 ml-3 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                        <ul
                            tabIndex={-1}
                            role="listbox"
                            aria-labelledby="listbox-label"
                            className="py-1 overflow-auto text-base rounded-md max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        >
                            {values.map((value) => (
                                <li
                                    key={value.id}
                                    role="option"
                                    aria-selected={internalSelectedValue.id === value.id}
                                    className="relative py-2 pl-3 text-gray-900 cursor-default select-none hover:bg-indigo-500 hover:text-white pr-9"
                                    onClick={() => handleSelect(value)}
                                >
                                    <div className="flex items-center">
                                        <img
                                            src={value.image}
                                            alt={value.name}
                                            className="flex-shrink-0 w-6 h-6 rounded-full"
                                        />
                                        <span className="block ml-3 font-normal truncate">
                                            {value.name}
                                        </span>
                                    </div>
                                    {internalSelectedValue.id === value.id && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <Check className="w-5 h-5" />
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};