import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

const PAGES = [
  { delay: 0.3, opacity: 0.5, lines: [] as number[] },
  { delay: 0.15, opacity: 0.7, lines: [21, 26] },
  { delay: 0, opacity: 1, lines: [21, 26, 31, 36, 41] },
];

function FlippingPage({ delay, opacity, lines, pageColor, lineColor }: {
  delay: number; opacity: number; lines: number[]; pageColor: string; lineColor: string;
}) {
  return (
    <motion.div
      animate={{ rotateY: [0, -140, -140, 0] }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        times: [0, 0.4, 0.6, 1],
      }}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        transformOrigin: '50% 50%',
        transformStyle: 'preserve-3d',
      }}
    >
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
        <rect x="35" y="13" width="19" height="38" rx="2" fill={pageColor} opacity={opacity} />
        {lines.map(y => (
          <line key={y} x1="38" y1={y} x2="51" y2={y} stroke={lineColor} strokeWidth="0.8" opacity="0.4" />
        ))}
      </svg>
    </motion.div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration: 1.2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      }}
    >
      .
    </motion.span>
  );
}

export default function BookLoader() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Light: golden pages on cream bg — use warm brown tones
  // Dark: cream pages on dark bg — use FFEED3
  const pageColor   = isLight ? '#c8890a' : '#FFEED3';
  const lineColor   = isLight ? '#593A08' : '#593A08';
  const spineColor  = isLight ? '#593A08' : '#593A08';
  const coverColor  = isLight ? '#FFD45A' : '#FFD45A';
  const leftPage    = isLight ? '#FFD45A' : '#FFEED3';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Book */}
      <div style={{ perspective: 300 }} className="w-16 h-16 relative">
        {/* Static base */}
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
          <rect x="8" y="12" width="48" height="40" rx="3" fill={coverColor} opacity="0.3" />
          <rect x="29" y="12" width="6" height="40" rx="1" fill={spineColor} opacity="0.5" />
          <rect x="9" y="13" width="20" height="38" rx="2" fill={leftPage} opacity="0.9" />
          {[21, 26, 31, 36, 41].map(y => (
            <line key={y} x1="13" y1={y} x2="27" y2={y} stroke={lineColor} strokeWidth="0.8" opacity="0.35" />
          ))}
          <rect x="35" y="13" width="20" height="38" rx="2" fill={pageColor} opacity="0.3" />
        </svg>

        {/* Flipping pages */}
        {PAGES.map((p, i) => (
          <FlippingPage key={i} {...p} pageColor={pageColor} lineColor={lineColor} />
        ))}
      </div>

      {/* Dots */}
      <p className="text-sm themed-accent flex items-center font-medium">
        Loading AcadNest
        <span className="ml-0.5"><Dot delay={0} /></span>
        <Dot delay={0.3} />
        <Dot delay={0.6} />
      </p>
    </motion.div>
  );
}
