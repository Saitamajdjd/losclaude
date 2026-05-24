import { motion } from 'framer-motion';

export default function SectionHeader({ tag, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12 md:mb-16"
    >
      {tag && (
        <span className="inline-block px-4 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-los-orange border border-los-orange/40 rounded-full">
          {tag}
        </span>
      )}
      <h2 className="section-title mb-4">
        <span className="text-los-orange">{title.split(' ')[0]}</span>{' '}
        {title.split(' ').slice(1).join(' ')}
      </h2>
      {subtitle && <p className="text-gray-400 max-w-2xl mx-auto text-lg">{subtitle}</p>}
    </motion.div>
  );
}
