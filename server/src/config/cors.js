const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://losclaude-m5jr-90nxo6eyb-licordosprimo-s-projects.vercel.app',
];

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

module.exports = { allowedOrigins, corsOptions, isAllowedOrigin };
