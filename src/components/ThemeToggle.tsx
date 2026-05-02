import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="fixed left-0 bottom-24 z-[9999] flex items-center"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <motion.button
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        className="flex items-center gap-0 rounded-r-2xl cursor-pointer overflow-hidden shadow-xl"
        style={{
          background: isLight
            ? 'linear-gradient(135deg, #FFD45A22, #FFEED3dd)'
            : 'linear-gradient(135deg, #1a1a2e, #111118)',
          border: isLight
            ? '1px solid rgba(89,58,8,0.18)'
            : '1px solid rgba(255,212,90,0.12)',
          borderLeft: 'none',
          boxShadow: isLight
            ? '2px 4px 20px rgba(89,58,8,0.12)'
            : '2px 4px 20px rgba(0,0,0,0.5)',
        }}
        whileTap={{ scale: 0.95 }}
        animate={{ width: hovered ? 'auto' : '42px' }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
      >
        {/* Icon */}
        <div
          className="w-[42px] h-[42px] flex items-center justify-center flex-shrink-0"
          style={{ color: isLight ? '#593A08' : '#FFD45A' }}
        >
          <AnimatePresence mode="wait">
            {isLight ? (
              <motion.span
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                <Moon className="w-4 h-4" />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                <Sun className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Label — slides in on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="text-[11px] font-semibold pr-3 whitespace-nowrap overflow-hidden"
              style={{ color: isLight ? '#593A08' : '#FFEED3' }}
            >
              {isLight ? 'Dark mode' : 'Light mode'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
