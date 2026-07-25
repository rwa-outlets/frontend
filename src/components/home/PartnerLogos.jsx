import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

/**
 * PartnerLogos — "Powered by" strip on the landing page.
 *
 * Shows the protocols/companies the stack is built on. Logos live in
 * public/partners/ (official brand SVGs) and link out to each project.
 * Grayscale by default, full color on hover.
 *
 * 1inch's post-2025 rebrand mark is monochrome, so it ships in black/white
 * variants (logoDark) picked per theme, per their press-room guidance.
 */

const PARTNERS = [
  { name: 'The Graph', logo: '/partners/thegraph.svg', url: 'https://thegraph.com', role: 'Indexing & queues subgraph' },
  { name: 'Uniswap', logo: '/partners/uniswap.svg', url: 'https://uniswap.org', role: 'Swap lane via Trading API' },
  { name: '1inch', logo: '/partners/1inch.svg', logoDark: '/partners/1inch-white.svg', url: 'https://1inch.com', role: 'Aqua liquidity routing' },
  { name: 'ENS', logo: '/partners/ens.svg', url: 'https://ens.domains', role: 'Wallet identity & avatars' },
];

const PartnerLogos = () => {
  const { isDark } = useTheme();

  return (
    <div className="partner-strip">
      <div className="partner-strip-label">Powered by</div>
      <div className="partner-strip-row">
        {PARTNERS.map((partner, i) => (
          <motion.a
            key={partner.name}
            className="partner-logo-item"
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            title={partner.role}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.12, duration: 0.5 }}
          >
            <img
              src={isDark && partner.logoDark ? partner.logoDark : partner.logo}
              alt={`${partner.name} logo`}
            />
            <span>{partner.name}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default PartnerLogos;
