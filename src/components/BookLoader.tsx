import { motion } from 'framer-motion';

const pageVariants = {
  flip: (delay: number) => ({
    rotateY: [0, -140, -140, 0],
    transition: {
      duration: 2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.4, 0.6, 1],
    },
  }),
};

const dotVariants = {
  blink: (delay: number) => ({
    opacity: [0, 1, 0],
    transition: {
      duration: 1.2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};

export default function BookLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Book */}
      <div style={{ perspective: 300 }} className="w-16 h-16 relative">
        {/* Static SVG base — back cover, spine, left page */}
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
          {/* Back cover */}
          <rect x="8" y="12" width="48" height="40" rx="3" fill="#FFD45A" opacity="0.15" />
          {/* Spine */}
          <rect x="29" y="12" width="6" height="40" rx="1" fill="#593A08" opacity="0.3" />
          {/* Left page static */}
          <rect x="9" y="13" width="20" height="38" rx="2" fill="#FFEED3" opacity="0.9" />
          {[21, 26, 31, 36, 41].map(y => (
            <line key={y} x1="13" y1={y} x2="27" y2={y} stroke="#593A08" strokeWidth="0.8" opacity="0.25" />
          ))}
          {/* Right static base page */}
          <rect x="35" y="13" width="20" height="38" rx="2" fill="#FFEED3" opacity="0.4" />
        </svg>

        {/* Flipping pages — Framer Motion */}
        {[
          { delay: 0.3, opacity: 0.6, lines: [] },
          { delay: 0.15, opacity: 0.75, lines: [21, 26] },
          { delay: 0, opacity: 1, lines: [21, 26, 31, 36, 41] },
        ].map((page, i) => (
          <motion.div
            key={i}
            custom={page.delay}
            animate="flip"
            variants={pageVariants}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              transformOrigin: '50% 50%',
              transformStyle: 'preserve-3d',
            }}
          >
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
              <rect x="35" y="13" width="19" height="38" rx="2" fill="#FFEED3" opacity={page.opacity} />
              {page.lines.map(y => (
                <line key={y} x1="38" y1={y} x2="51" y2={y} stroke="#593A08" strokeWidth="0.8" opacity="0.25" />
              ))}
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Animated dots */}
      <p className="text-sm themed-text/40 flex items-center">
        Loading AcadNest
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.span
            key={i}
            custom={delay}
            animate="blink"
            variants={dotVariants}
            className={i === 0 ? 'ml-0.5' : ''}
          >
            .
          </motion.span>
        ))}
      </p>
    </motion.div>
  );
}
