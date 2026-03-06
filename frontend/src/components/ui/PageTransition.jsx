import React from "react";
import { motion } from "framer-motion";

export function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

// Keeping legacy name for easy migration
export const WayzaPageTransition = PageTransition;
