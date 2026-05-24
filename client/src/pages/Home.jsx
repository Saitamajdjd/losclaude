import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import OrgStory from '../components/OrgStory';
import ElencoLos from '../components/ElencoLos';
import LatestLosVideo from '../components/LatestLosVideo';

const modalities = [
  {
    name: 'League of Legends',
    icon: '⚔️',
    desc: 'MOBA competitivo com foco em macro, objetivos e teamfight. Gestão de KDA e análise estratégica por IA.',
  },
  {
    name: 'Free Fire',
    icon: '🎯',
    desc: 'Battle Royale mobile com ênfase em posicionamento, abates e colocação final. Métricas adaptadas ao formato.',
  },
];

export default function Home() {
  return (
    <main className="pt-16 md:pt-20">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-los-orange/10 via-transparent to-los-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-los-orange/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-los-orange/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-los-orange font-bold uppercase tracking-[0.3em] text-sm mb-4">
              Projeto de Extensão Integrador · AWS Cloud
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-6">
              <span className="text-white">LOS</span>{' '}
              <span className="text-los-orange drop-shadow-glow">Cloud</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-medium">
              Plataforma administrativa para gestão de jogadores e análise automática de partidas
              de esports — inspirada na Onda Laranja.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin" className="btn-primary">
                Área Admin
              </Link>
              <Link to="/apresentacao" className="btn-outline">
                Apresentação
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: 'Modalidades', value: '2' },
              { label: 'Cloud AWS', value: '100%' },
              { label: 'Análise IA', value: 'OpenRouter' },
              { label: 'Stack', value: 'Full' },
            ].map((stat) => (
              <div key={stat.label} className="card-glass p-4 text-center">
                <p className="font-display text-2xl text-los-orange font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <OrgStory />

      {/* Modalidades */}
      <section className="py-20 md:py-28 px-4 bg-los-dark/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Competitivo" title="Modalidades" subtitle="Suporte completo para os títulos da LOS." />
          <div className="grid md:grid-cols-2 gap-8">
            {modalities.map((mod, i) => (
              <motion.article
                key={mod.name}
                initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card-glass p-8 group hover:shadow-glow transition-shadow"
              >
                <span className="text-5xl mb-4 block">{mod.icon}</span>
                <h3 className="font-display text-2xl text-los-orange mb-3 uppercase">{mod.name}</h3>
                <p className="text-gray-400">{mod.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <ElencoLos />

      <LatestLosVideo />
    </main>
  );
}
