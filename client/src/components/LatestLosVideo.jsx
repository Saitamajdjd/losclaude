import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { api } from '../services/api';

export default function LatestLosVideo() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getLatestLosVideo()
      .then(setVideo)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-los-orange/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeader
          tag="YouTube"
          title="Último vídeo da LOS"
          subtitle="Assista ao conteúdo mais recente do canal oficial LOS League of Legends."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-glass border-los-orange/40 shadow-glow overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-gray-500">Carregando último vídeo...</div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">{error}</p>
              <a
                href="https://www.youtube.com/@LOS.LeagueofLegends/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-block"
              >
                Ver canal no YouTube
              </a>
            </div>
          ) : (
            <>
              <div className="aspect-video w-full bg-los-black">
                <iframe
                  title={video.title}
                  src={`${video.embedUrl}?rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6 md:p-8 border-t border-los-orange/20">
                <h3 className="font-display text-xl md:text-2xl text-white uppercase mb-4 leading-snug">
                  {video.title}
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <a
                    href={video.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-center"
                  >
                    Ver no YouTube
                  </a>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Canal @LOS.LeagueofLegends
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/admin" className="text-los-orange hover:text-los-orange-light font-semibold uppercase tracking-wider">
            Área Admin →
          </Link>
          <span className="text-gray-700 hidden sm:inline">|</span>
          <Link
            to="/apresentacao"
            className="text-gray-400 hover:text-white font-semibold uppercase tracking-wider"
          >
            Apresentação →
          </Link>
        </div>
      </div>
    </section>
  );
}
