import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

function CyberBg({ intensity = 'normal' }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:48px_48px] opacity-40" />
      <div
        className={`absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-[140px] ${
          intensity === 'high' ? 'bg-los-orange/35' : 'bg-los-orange/20'
        }`}
      />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-los-orange/10 blur-[100px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-los-orange/60 to-transparent" />
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-16 md:my-24 max-w-4xl mx-auto px-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-los-orange/50" />
      <span className="font-display text-los-orange text-xs tracking-[0.4em] uppercase">LOS</span>
      <div className="flex-1 h-px bg-gradient-to-l from-los-orange/50 to-transparent" />
    </div>
  );
}

function StoryBlock({ index, title, children, variant = 'default', highlight }) {
  const isHero = variant === 'hero';
  const isFinale = variant === 'finale';

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      className={`relative py-20 md:py-28 px-4 overflow-hidden ${
        isFinale ? 'bg-gradient-to-b from-los-black via-los-dark to-los-black' : ''
      }`}
    >
      <CyberBg intensity={isFinale ? 'high' : 'normal'} />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-8">
          <span className="font-display text-5xl md:text-6xl font-black text-los-orange/30 leading-none">
            {String(index).padStart(2, '0')}
          </span>
          <div className="h-12 w-1 bg-los-orange shadow-glow-sm rounded-full" />
          {highlight && (
            <span className="hidden sm:inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-los-orange border border-los-orange/40 rounded-full bg-los-orange/10">
              {highlight}
            </span>
          )}
        </motion.div>

        <motion.h2
          variants={fadeUp}
          custom={1}
          className={`font-display font-black uppercase leading-tight mb-8 ${
            isHero
              ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white'
              : isFinale
                ? 'text-3xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white via-los-orange-light to-los-orange'
                : 'text-2xl sm:text-3xl md:text-4xl text-white'
          }`}
        >
          {title}
        </motion.h2>

        <motion.div
          variants={fadeUp}
          custom={2}
          className={`space-y-5 text-lg leading-relaxed ${
            isFinale ? 'text-gray-200' : 'text-gray-300'
          } max-w-4xl`}
        >
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function OrgStory() {
  return (
    <div id="historia-los" className="relative bg-los-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center pt-20 md:pt-28 pb-4 px-4"
      >
        <span className="inline-block px-4 py-1 mb-4 text-xs font-bold uppercase tracking-[0.35em] text-los-orange border border-los-orange/40 rounded-full bg-los-orange/5 shadow-glow-sm">
          Conheça a Org
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
          A história da <span className="text-los-orange drop-shadow-[0_0_24px_rgba(255,107,0,0.5)]">LOS</span>
        </h2>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
          Da guilda ao topo do Brasil — a Onda Laranja que mudou os esports no país.
        </p>
      </motion.div>

      <StoryBlock
        index={1}
        highlight="Origens"
        variant="hero"
        title="O Começo de uma Onda Laranja: De uma Guilda ao Topo do Brasil"
      >
        <p>
          A <strong className="text-los-orange">LOS</strong> não nasceu em escritórios tradicionais;
          ela nasceu da paixão pura pelos games e da conexão real com a comunidade. Fundada
          originalmente como <strong className="text-white">Los Grandes</strong> por Rodrigo{' '}
          <em className="text-los-orange-light">&apos;El Gato&apos;</em>, a organização começou sua
          jornada no ecossistema de <strong className="text-white">Free Fire</strong>, onde
          rapidamente deixou de ser apenas uma guilda para se tornar um dos maiores fenômenos de
          audiência, engajamento e cultura jovem do país.
        </p>
        <p>
          Com a icônica cor laranja e o lema de fazer barulho por onde passa, nós mostramos que os
          esports no Brasil são movidos pela{' '}
          <span className="text-los-orange font-semibold">torcida</span>.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          {['Free Fire', 'Comunidade', 'Onda Laranja'].map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-los-orange bg-los-orange/10 border border-los-orange/30 rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>
      </StoryBlock>

      <Divider />

      <StoryBlock
        index={2}
        highlight="CBLOL"
        title="A Evolução: O Nascimento da LOS e a Invasão no CBLOL"
      >
        <p>
          O mundo dos games muda rápido, e nós mudamos com ele. Para consolidar nossa posição como
          uma potência multidisciplinar de esportes eletrônicos, passamos por uma evolução de marca,
          adotando o nome <strong className="text-los-orange">LOS</strong>.
        </p>
        <p>
          Essa nova era marcou a nossa entrada definitiva nos palcos mais prestigiados do país.
          Hoje, fincamos nossa bandeira no{' '}
          <strong className="text-white">CBLOL (League of Legends)</strong>, competindo de igual
          para igual com os times mais tradicionais da região, além de manter nossa presença
          histórica em outras modalidades e no ecossistema de influenciadores.
        </p>
        <p className="border-l-4 border-los-orange pl-5 text-gray-400 italic">
          Nos palcos de LoL, trazemos a nossa essência: resiliência, garra e o apoio incondicional de
          uma das torcidas mais apaixonadas do Brasil.
        </p>
      </StoryBlock>

      <Divider />

      <StoryBlock
        index={3}
        highlight="Lifestyle"
        variant="finale"
        title="Muito Mais que Esports: Um Estilo de Vida"
      >
        <p>
          Para a LOS, o jogo vai muito além das telas. Nós unimos competitividade de alto nível,
          criação de conteúdo original, moda e lifestyle. Somos um ponto de encontro para quem
          respira a cultura pop, os games e a internet brasileira.
        </p>
        <p>
          Seja vibrando em cada abate no Summoner&apos;s Rift, acompanhando nossos criadores de
          conteúdo ou vestindo o manto laranja, fazer parte da LOS é fazer parte de um movimento.
        </p>
        <motion.div
          variants={fadeUp}
          custom={3}
          className="mt-10 p-8 md:p-10 rounded-2xl border border-los-orange/40 bg-los-orange/5 shadow-glow text-center"
        >
          <p className="font-display text-2xl md:text-4xl font-black text-white uppercase leading-snug">
            Nós somos o barulho.
          </p>
          <p className="font-display text-3xl md:text-5xl font-black text-los-orange uppercase mt-2 drop-shadow-glow">
            Nós somos a LOS.
          </p>
        </motion.div>
      </StoryBlock>
    </div>
  );
}
