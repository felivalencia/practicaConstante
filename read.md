practicaConstante/
├── dist/
├── public/
│   └── index.html
├── src/
│   ├── client/
│   │   ├── components/
│   │   │   ├── AuthForm.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── styles.scss
│   └── server/
│       ├── authController.ts
│       └── index.ts
├── supabase/
├── client.ts
├── .babelrc
├── .env
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── read.md
├── README.md
├── tsconfig.json
└── webpack.config.js



# Supabase Database URLs
DATABASE_URL=postgresql://postgres:piszaZ-jahcep-dyfqe0@db.qlfgvzkoicopplnjignh.supabase.co:5432/postgres

# Supabase Project Configuration
SUPABASE_PROJECT_URL=https://qlfgvzkoicopplnjignh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZmd2emtvaWNvcHBsbmppZ25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNDkxNTksImV4cCI6MjA1MDgyNTE1OX0.dAKGWpNbKb5og8tUuc0R3TFIn58JWHRb7EKQkWPsmZg # You'll need to get this from your Supabase dashboard

# Server Configuration
PORT=5000
NODE_ENV=development

# For client-side
REACT_APP_SUPABASE_URL=https://qlfgvzkoicopplnjignh.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZmd2emtvaWNvcHBsbmppZ25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNDkxNTksImV4cCI6MjA1MDgyNTE1OX0.dAKGWpNbKb5og8tUuc0R3TFIn58JWHRb7EKQkWPsmZg # Same as SUPABASE_ANON_KEY

JWT_SECRET=your_secure_secret_here
CLIENT_URL=http://localhost:3000  # Your React app URL


# Cookie Settings
COOKIE_SECRET=k5j4h3g2f1e0d9c8b7a6p5o4i3u2y1t
