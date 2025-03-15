import React, { ButtonHTMLAttributes, useState, ComponentType } from 'react';
import { Heart, Loader2 } from 'lucide-react';

// Utility function to concatenate class names
const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
};

type IconPosition = 'left' | 'right';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    showIcon?: boolean;
    icon?: ComponentType<{ className?: string }>;
    iconPosition?: IconPosition;
    isLoading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary';
}

export default function YoupiterButton({
    children,
    showIcon = false,
    icon: Icon = Heart,
    iconPosition = 'right',
    isLoading = false,
    loadingText,
    variant = 'primary',
    className,
    ...props
}: ButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    const IconComponent = showIcon && <Icon className="h-5 w-5" />;

    return (
        <button
            className={cn(
                'relative flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200',
                'bg-zinc-900 text-white hover:bg-zinc-800',
                'active:scale-95',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isPressed && 'scale-95',
                className
            )}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {loadingText && <span>{loadingText}</span>}
                </>
            ) : (
                <>
                    {iconPosition === 'left' && IconComponent}
                    {children}
                    {iconPosition === 'right' && IconComponent}
                </>
            )}
        </button>
    );
};

// Example usage
const ButtonDemo = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="flex flex-col gap-4 p-8">
            <YoupiterButton
                showIcon
                icon={Heart}
                onClick={handleClick}
                isLoading={isLoading}
                loadingText="Loading..."
            >
                Like (with loading text)
            </YoupiterButton>

            <YoupiterButton
                showIcon
                icon={Heart}
                onClick={handleClick}
                isLoading={isLoading}
            >
                Like (no loading text)
            </YoupiterButton>

            <YoupiterButton showIcon icon={Heart} iconPosition="left">
                Icon Left
            </YoupiterButton>

            <YoupiterButton>
                No Icon
            </YoupiterButton>
        </div>
    );
};