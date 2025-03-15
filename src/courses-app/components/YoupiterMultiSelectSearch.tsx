import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface MultiSelectSearchboxProps<T> {
    // Array of items to select from
    items: T[];
    // Function to get unique identifier for each item
    getItemId: (item: T) => string;
    // Function to get the string to search/filter on
    getSearchableText: (item: T) => string;
    // Optional custom render functions
    renderSelectedItem?: (item: T, onRemove: () => void) => React.ReactNode;
    renderDropdownItem?: (item: T, isSelected: boolean) => React.ReactNode;
    // Optional callback when selection changes
    onSelectionChange?: (selectedItems: T[]) => void;
    // Optional placeholder text
    placeholder?: string;
    initialSelection?: T[];
}

export default function YoupiterMultiSelectSearch<T>({
    items,
    getItemId,
    getSearchableText,
    renderSelectedItem,
    renderDropdownItem,
    onSelectionChange,
    placeholder = "Search...",
    initialSelection = []
}: MultiSelectSearchboxProps<T>) {
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredItems = items.filter(item =>
        !selectedItems.some(selected => getItemId(selected) === getItemId(item)) &&
        getSearchableText(item).toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {

        if (initialSelection && initialSelection.length > 0) {
            setSelectedItems(initialSelection);
        }
        
    }, [initialSelection]);

    const handleItemSelect = (item: T) => {
        const newSelectedItems = [...selectedItems, item];
        setSelectedItems(newSelectedItems);
        onSelectionChange?.(newSelectedItems);
        setSearchTerm('');
    };

    const handleItemRemove = (itemId: string) => {
        const newSelectedItems = selectedItems.filter(item => getItemId(item) !== itemId);
        setSelectedItems(newSelectedItems);
        onSelectionChange?.(newSelectedItems);
    };

    // Default render function for selected items
    const defaultRenderSelectedItem = (item: T, onRemove: () => void) => (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-2 pr-2 py-1">
            <span className="text-sm">{getSearchableText(item)}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="hover:bg-gray-200 rounded-full p-1"
            >
                <X size={14} />
            </button>
        </div>
    );

    // Default render function for dropdown items
    const defaultRenderDropdownItem = (item: T, isSelected: boolean) => (
        <div className="flex items-center justify-between p-2 hover:bg-gray-50">
            <span className="text-sm">{getSearchableText(item)}</span>
            {isSelected && <Check size={16} className="text-gray-500" />}
        </div>
    );

    return (
        <div className="w-full max-w-md relative" ref={containerRef}>
            <div
                className="min-h-12 p-2 border rounded-lg bg-white flex flex-wrap gap-2 cursor-text"
                onClick={() => setIsOpen(true)}
            >
                {selectedItems.map(item => (
                    <React.Fragment key={getItemId(item)}>
                        {(renderSelectedItem || defaultRenderSelectedItem)(
                            item,
                            () => handleItemRemove(getItemId(item))
                        )}
                    </React.Fragment>
                ))}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    className="flex-1 min-w-[100px] outline-none bg-transparent"
                    placeholder={selectedItems.length === 0 ? placeholder : ""}
                />
            </div>

            {isOpen && filteredItems.length > 0 && (
                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                    {filteredItems.map(item => (
                        <div
                            key={getItemId(item)}
                            className="cursor-pointer"
                            onClick={() => handleItemSelect(item)}
                        >
                            {(renderDropdownItem || defaultRenderDropdownItem)(
                                item,
                                selectedItems.some(selected => getItemId(selected) === getItemId(item))
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function renderUserItem(user: { id: string, name: string, email: string }, onRemove: () => void) {
    return (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-1 pr-2 py-1">
            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm">
                {user.name.charAt(0)}
            </div>
            <span className="text-sm">{user.name}</span>
            <button onClick={onRemove} className="hover:bg-gray-200 rounded-full p-1">
                <X size={14} />
            </button>
        </div>
    )
}

export function renderUserDropdownItem(user: { id: string, name: string, email: string }, isSelected: boolean) {
    return (
        <div className="p-2 hover:bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                    {user.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                </div>
            </div>
            {isSelected && <Check size={16} className="text-gray-500" />}
        </div>
    )
}

// Example usage with different types of data
const ExampleUsage = () => {
    // Example with users
    const users = [
        { id: '1', name: 'Sarah Chen', email: 'schen@company.com' },
        { id: '2', name: 'David Harrison', email: 'david@example.com' },
    ];

    const renderUserItem = (user: typeof users[0], onRemove: () => void) => (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-1 pr-2 py-1">
            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm">
                {user.name.charAt(0)}
            </div>
            <span className="text-sm">{user.name}</span>
            <button onClick={onRemove} className="hover:bg-gray-200 rounded-full p-1">
                <X size={14} />
            </button>
        </div>
    );

    const renderUserDropdownItem = (user: typeof users[0], isSelected: boolean) => (
        <div className="p-2 hover:bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                    {user.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                </div>
            </div>
            {isSelected && <Check size={16} className="text-gray-500" />}
        </div>
    );

    // Example with simple tags
    const tags = [
        { id: 't1', label: 'React' },
        { id: 't2', label: 'TypeScript' },
    ];

    return (
        <div className="space-y-8 p-4">
            <div>
                <h2 className="text-lg font-semibold mb-2">User Selection</h2>
                <YoupiterMultiSelectSearch
                    items={users}
                    getItemId={user => user.id}
                    getSearchableText={user => `${user.name} ${user.email}`}
                    renderSelectedItem={renderUserItem}
                    renderDropdownItem={renderUserDropdownItem}
                    placeholder="Search users..."
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-2">Tag Selection</h2>
                <YoupiterMultiSelectSearch
                    items={tags}
                    getItemId={tag => tag.id}
                    getSearchableText={tag => tag.label}
                    placeholder="Search tags..."
                />
            </div>
        </div>
    );
};