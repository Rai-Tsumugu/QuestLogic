import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 border border-transparent",
        secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
        outline: "border-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/50",
        ghost: "hover:bg-white/5 text-slate-300 hover:text-white"
    };

    const sizes = {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base"
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
});

Button.displayName = "Button";
