import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45 },
};

const NAV = [
  { id: 'problema', label: 'Problema' },
  { id: 'solucao', label: 'Solução' },
  { id: 'servicos', label: 'Cloud' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'comparativo', label: 'Antes/Depois' },
  { id: 'conclusao', label: 'Conclusão' },
  { id: 'faq', label: 'Perguntas' },
];

const PROBLEMAS = [
  'Dados de jogadores e partidas anotados em planilhas locais e papéis',
  'Sem backup — qualquer falha significa perda de histórico',
  'Imagens e materiais espalhados em dispositivos pessoais',
  'Sem análise de desempenho — decisões tomadas na intuição',
  'Sem acesso remoto — só funciona presencialmente',
  'Impossível escalar conforme a equipe cresce',
];

const SOLUCOES = [
  'Cadastro e gerenciamento de jogadores com foto de perfil',
  'Registro completo de partidas de League of Legends e Free Fire',
  'Dashboard com estatísticas da equipe em tempo real',
  'Análise automática de desempenho usando Inteligência Artificial',
  'Banco de dados na nuvem com backup automático',
  'Sistema disponível 24h por dia, de qualquer dispositivo',
];

const SERVICOS = [
  {
    name: 'Amazon RDS',
    icon: '🗄️',
    desc: 'Banco de dados MySQL na nuvem AWS. Armazena jogadores, partidas e estatísticas. Backups automáticos e acesso seguro.',
  },
  {
    name: 'Amazon S3',
    icon: '📁',
    desc: 'Armazenamento das fotos de perfil dos jogadores. Alta disponibilidade, acesso via URLs seguras e custo por uso.',
  },
  {
    name: 'Vercel',
    icon: '▲',
    desc: 'Hospedagem do frontend React. Deploy automático, CDN global e HTTPS. O sistema fica online sem servidor próprio.',
  },
  {
    name: 'OpenRouter IA',
    icon: '🤖',
    desc: 'Análise automática das partidas com IA. Gera insights, identifica o MVP e sugere melhorias táticas para o time.',
  },
];

const SEGURANCA = [
  'Credenciais AWS em variáveis de ambiente',
  'Bucket S3 privado, acesso por URL temporária',
  'RDS acessível só pelo backend',
  'HTTPS obrigatório via Vercel',
  'Nenhuma senha exposta no código',
];

const DISPONIBILIDADE = [
  'Backups automáticos diários no RDS',
  'S3 com versionamento de arquivos',
  'Deploy com rollback automático na Vercel',
  'CDN global garante acesso rápido',
  'Sistema online 24h sem servidor próprio',
];

const ANTES = [
  'Dados em planilhas locais',
  'Sem backup',
  'Sem acesso remoto',
  'Sem análise de desempenho',
  'Risco de perda total de dados',
  'Impossível escalar',
];

const DEPOIS = [
  'Banco de dados na nuvem (RDS)',
  'Backup automático diário',
  'Acesso de qualquer lugar',
  'IA analisa cada partida',
  'Alta disponibilidade AWS',
  'Escala conforme a equipe cresce',
];

const FAQ = [
  {
    q: 'Por que vocês escolheram a AWS e não outro provedor como Azure ou Google Cloud?',
    a: 'A AWS é o provedor mais utilizado no mercado de TI e oferece o Amazon Free Tier, que permitiu implementar e testar os serviços sem custo. Além disso, possui ampla documentação, integração com Node.js via SDK e alta disponibilidade.',
  },
  {
    q: 'Como funciona a análise de IA nas partidas? O sistema cria a própria IA?',
    a: 'Não criamos uma IA do zero. Utilizamos o OpenRouter, que funciona como gateway de acesso a modelos de linguagem. Quando uma partida é registrada, os dados são enviados para a API, que retorna uma análise automática apontando MVP, desempenho coletivo e sugestões de melhoria.',
  },
  {
    q: 'O sistema funciona sem internet? E se a AWS cair?',
    a: 'Não. O sistema depende da internet por ser uma aplicação cloud. Porém, os serviços utilizados possuem alta disponibilidade e redundância, reduzindo falhas e indisponibilidades.',
  },
  {
    q: 'Como vocês garantem que as senhas e dados sensíveis estão protegidos?',
    a: 'As credenciais ficam armazenadas em variáveis .env, não ficam expostas no código-fonte e o banco de dados só aceita conexões vindas do backend.',
  },
  {
    q: 'Qual é o custo mensal desse sistema para uma organização real usar?',
    a: 'Dentro do Free Tier o custo pode ser praticamente zero para pequenos projetos. Em produção real, os custos variam conforme o uso de banco de dados, armazenamento e requisições da IA.',
  },
];

function SectionLabel({ children }) {
  return (
    <span className="inline-block px-4 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-los-orange border border-los-orange/40 rounded-full">
      {children}
    </span>
  );
}

function ArrowList({ items, variant = 'alert' }) {
  const isAlert = variant === 'alert';
  return (
    <div className="grid sm:grid-cols-2 gap-4 mt-8">
      {items.map((text, i) => (
        <motion.div
          key={text}
          {...fadeUp}
          transition={{ delay: i * 0.05 }}
          className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-glow-sm ${
            isAlert
              ? 'bg-los-dark border-red-500/20 hover:border-red-500/40'
              : 'bg-los-dark border-los-orange/25 hover:border-los-orange/60 hover:shadow-glow-sm'
          }`}
        >
          <p className="flex gap-3 text-gray-300 text-sm leading-relaxed">
            <span className={`flex-shrink-0 font-bold ${isAlert ? 'text-red-400' : 'text-los-orange'}`}>
              →
            </span>
            {text}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3 mt-8">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={item.q}
            {...fadeUp}
            transition={{ delay: i * 0.04 }}
            className={`rounded-xl border overflow-hidden transition-all ${
              isOpen ? 'border-los-orange/50 shadow-glow-sm bg-los-dark' : 'border-gray-800 bg-los-card/60'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left"
            >
              <span className="font-bold text-white text-sm md:text-base pr-4">{item.q}</span>
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${
                  isOpen ? 'bg-los-orange text-black' : 'bg-los-orange/20 text-los-orange'
                }`}
              >
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-5 md:px-6 pb-5 md:pb-6"
              >
                <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-los-orange/40 pl-4">
                  {item.a}
                </p>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Presentation() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="pt-16 md:pt-20 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 pointer-events-none" />
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-los-orange/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-80 h-80 bg-los-orange/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero */}
      <section id="hero" className="relative min-h-[85vh] flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-los-orange/10 via-transparent to-los-black pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <SectionLabel>Projeto de Extensão Integrador</SectionLabel>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-black uppercase leading-none mb-6">
            <span className="text-white">LOS</span>{' '}
            <span className="text-los-orange drop-shadow-glow">Cloud</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-medium mb-4 max-w-2xl mx-auto">
            Plataforma de Gerenciamento e Análise de Partidas de Esports
          </p>
          <p className="text-sm md:text-base text-los-orange/90 uppercase tracking-[0.2em] font-bold mb-10">
            PEI — Computação em Nuvens | UNIFAN 2026.1
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" onClick={() => scrollTo('problema')} className="btn-primary">
              Conhecer o projeto
            </button>
            <Link to="/" className="btn-outline">
              Voltar à Home
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {['Cloud', 'Esports', 'IA'].map((tag) => (
              <div key={tag} className="card-glass py-3 px-2 text-center">
                <p className="font-display text-los-orange font-bold uppercase text-sm">{tag}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Sticky nav */}
      <nav className="sticky top-16 md:top-20 z-40 border-y border-los-orange/20 bg-los-black/90 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-los-orange hover:bg-los-orange/10 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 space-y-24 md:space-y-32 relative z-10">
        {/* Problema */}
        <section id="problema">
          <motion.div {...fadeUp} className="text-center mb-4">
            <SectionLabel>O desafio</SectionLabel>
            <h2 className="font-display text-3xl md:text-5xl text-white uppercase font-black">
              O <span className="text-red-400">Problema</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
              Uma organização de esports em crescimento, sem nenhum sistema para gerir informações.
            </p>
          </motion.div>
          <ArrowList items={PROBLEMAS} variant="alert" />
        </section>

        {/* Solução */}
        <section id="solucao">
          <motion.div
            {...fadeUp}
            className="card-glass p-8 md:p-12 border-los-orange/40 shadow-glow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-los-orange/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative">
              <SectionLabel>A resposta</SectionLabel>
              <h2 className="font-display text-3xl md:text-5xl text-white uppercase font-black mb-4">
                A Solução: <span className="text-los-orange">LOS Cloud</span>
              </h2>
              <p className="text-gray-300 text-lg mb-2 max-w-3xl">
                Uma plataforma web completa, hospedada na nuvem, acessível de qualquer lugar.
              </p>
              <ArrowList items={SOLUCOES} variant="positive" />
            </div>
          </motion.div>
        </section>

        {/* Serviços */}
        <section id="servicos">
          <motion.div {...fadeUp} className="text-center mb-10">
            <SectionLabel>Infraestrutura</SectionLabel>
            <h2 className="font-display text-3xl md:text-5xl text-white uppercase font-black">
              Serviços em <span className="text-los-orange">Nuvem</span> Utilizados
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {SERVICOS.map((s, i) => (
              <motion.article
                key={s.name}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="group card-glass p-8 hover:shadow-glow hover:border-los-orange/50 transition-all duration-300"
              >
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">
                  {s.icon}
                </span>
                <h3 className="font-display text-xl text-los-orange uppercase font-bold mb-3">
                  {s.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Segurança */}
        <section id="seguranca">
          <motion.div {...fadeUp} className="text-center mb-10">
            <SectionLabel>Confiabilidade</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase font-black">
              Segurança e <span className="text-los-orange">Disponibilidade</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              {...fadeUp}
              className="card-glass p-8 border-los-orange/30 hover:shadow-glow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🔒</span>
                <h3 className="font-display text-xl text-white uppercase font-bold">Segurança</h3>
              </div>
              <ul className="space-y-3">
                {SEGURANCA.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-300 text-sm">
                    <span className="text-los-orange font-bold">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              className="card-glass p-8 border-los-orange/30 hover:shadow-glow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">⚡</span>
                <h3 className="font-display text-xl text-white uppercase font-bold">Disponibilidade</h3>
              </div>
              <ul className="space-y-3">
                {DISPONIBILIDADE.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-300 text-sm">
                    <span className="text-los-orange font-bold">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Antes e Depois */}
        <section id="comparativo">
          <motion.div {...fadeUp} className="text-center mb-10">
            <SectionLabel>Transformação</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase font-black">
              Antes e <span className="text-los-orange">Depois</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              {...fadeUp}
              className="p-8 rounded-2xl bg-gradient-to-br from-red-950/40 to-los-black border border-red-500/30"
            >
              <h3 className="font-display text-xl text-red-400 uppercase font-bold mb-6 flex items-center gap-2">
                <span>✗</span> Antes
              </h3>
              <ul className="space-y-4">
                {ANTES.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-400 text-sm">
                    <span className="text-red-400 font-bold">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-los-orange/15 to-los-black border border-los-orange/40 shadow-glow"
            >
              <h3 className="font-display text-xl text-los-orange uppercase font-bold mb-6 flex items-center gap-2">
                <span>✓</span> Depois — LOS Cloud
              </h3>
              <ul className="space-y-4">
                {DEPOIS.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-200 text-sm">
                    <span className="text-los-orange font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Conclusão */}
        <section id="conclusao">
          <motion.div
            {...fadeUp}
            className="card-glass p-8 md:p-12 text-center border-los-orange/50 shadow-glow relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-los-orange/5 to-transparent pointer-events-none" />
            <div className="relative max-w-3xl mx-auto">
              <SectionLabel>Encerramento</SectionLabel>
              <h2 className="font-display text-3xl md:text-4xl text-white uppercase font-black mb-6">
                Conclusão
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                O projeto LOS Cloud demonstra na prática como a computação em nuvem transforma a gestão
                de organizações de esports — substituindo processos manuais por uma plataforma moderna,
                segura e inteligente.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
                {[
                  ['Amazon RDS', 'banco de dados gerenciado e com backup automático'],
                  ['Amazon S3', 'armazenamento escalável de imagens e arquivos'],
                  ['Vercel', 'hospedagem cloud com disponibilidade global'],
                  ['OpenRouter IA', 'análise inteligente de desempenho competitivo'],
                ].map(([name, desc]) => (
                  <div key={name} className="p-4 rounded-lg bg-los-dark/80 border border-los-orange/20">
                    <p className="font-bold text-los-orange text-sm">{name}</p>
                    <p className="text-gray-500 text-xs mt-1">— {desc}</p>
                  </div>
                ))}
              </div>
              <p className="font-display text-xl md:text-2xl text-los-orange uppercase font-bold tracking-wide">
                Tecnologia que compete no mesmo nível que os jogadores.
              </p>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section id="faq" className="pb-8">
          <motion.div {...fadeUp} className="text-center mb-4">
            <SectionLabel>Banca & visitantes</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase font-black">
              Perguntas <span className="text-los-orange">Frequentes</span>
            </h2>
          </motion.div>
          <FaqAccordion />
        </section>

        <div className="flex flex-wrap justify-center gap-4 pt-8 border-t border-gray-800">
          <Link to="/admin" className="btn-primary text-xs py-2 px-5">
            Área Admin
          </Link>
          <Link to="/" className="btn-outline text-xs py-2 px-5">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
