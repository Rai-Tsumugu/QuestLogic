import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
    children,
    className,
    ...props
}, ref) => {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});

Card.displayName = "Card";
