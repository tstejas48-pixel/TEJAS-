import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // =========================================================================
  // API Routes (Always declared FIRST before Vite middleware)
  // =========================================================================

  /**
   * Health Check Endpoint
   */
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TEJAS LADIES TYLOR API',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Public Supabase configuration for the browser OAuth client.
   * Never expose service-role keys from this endpoint.
   */
  app.get('/api/auth/config', (req: Request, res: Response) => {
    const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    res.json({ url, key });
  });

  /**
   * Safe Database Connection Status Endpoint
   * (Never reveals actual passwords, secrets, or raw connection strings)
   */
  app.get('/api/database/status', (req: Request, res: Response) => {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
    const hasDbHost = Boolean(process.env.DB_HOST && process.env.DB_HOST.trim().length > 0);
    const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_URL.trim().length > 0);
    const hasFirebase = Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID.trim().length > 0);
    const hasMongo = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);

    const isConfigured = hasDatabaseUrl || hasDbHost || hasSupabase || hasFirebase || hasMongo;

    let detectedType = 'none';
    if (hasDatabaseUrl) {
      const url = (process.env.DATABASE_URL || '').toLowerCase();
      if (url.startsWith('postgres') || url.includes('supabase') || url.includes('neon')) {
        detectedType = 'PostgreSQL / Supabase';
      } else if (url.startsWith('mysql')) {
        detectedType = 'MySQL';
      } else {
        detectedType = 'SQL Database URL';
      }
    } else if (hasSupabase) {
      detectedType = 'Supabase REST API';
    } else if (hasFirebase) {
      detectedType = 'Google Firebase / Firestore';
    } else if (hasMongo) {
      detectedType = 'MongoDB';
    } else if (hasDbHost) {
      detectedType = `Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 5432} (${process.env.DB_NAME || 'database'})`;
    }

    res.json({
      configured: isConfigured,
      detectedType,
      providers: {
        databaseUrl: hasDatabaseUrl,
        discreteSqlParams: hasDbHost,
        supabase: hasSupabase,
        firebase: hasFirebase,
        mongo: hasMongo,
      },
      message: isConfigured
        ? `Database configuration detected (${detectedType}). Ready to persist appointments and clients.`
        : 'No database keys configured yet in .env. Falling back to local browser persistence until credentials are provided.',
    });
  });

  // Friendly Route Aliases (allow /booking as well as /booking.html)
  const friendlyRoutes: Record<string, string> = {
    '/booking': '/booking.html',
    '/appointments': '/appointments.html',
    '/profile': '/profile.html',
    '/login': '/login.html',
    '/register': '/register.html',
  };

  app.use((req, res, next) => {
    const target = friendlyRoutes[req.path];
    if (target) {
      req.url = target;
    }
    next();
  });

  // =========================================================================
  // Vite Middleware (Development) or Static File Serving (Production)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'mpa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TEJAS LADIES TYLOR server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
