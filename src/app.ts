/**
 * Testing Mocks Server - Refactored with Module Pattern
 * Clean architecture with separated route modules
 * 
 * Improvements:
 * - Modular route organization (CIAM, Ticabank, Cards, Atlas, Testing)
 * - UserService layer (Dependency Inversion)
 * - RouteBuilder pattern (DRY)
 * - Clear separation of concerns
 */

import 'dotenv/config';
import Fastify from 'fastify';
import { UserRepository } from './repository/user-repository.js';
import { registerTicabankRoutes } from './ticabank/ticabank.routes.js';
import { registerCiamRoutes } from './ciam/ciam.routes.js';
import { registerCardsRoutes } from './cards/cards.routes.js';
import { registerAtlasRoutes } from './atlas/atlas.routes.js';
import { registerTestingRoutes } from './common/testing.routes.js';

// =====================================================
// Fastify Server Setup
// =====================================================

const fastify = Fastify({
  logger: true,
});

// =====================================================
// Content Type Parsers (Ruby compatibility)
// =====================================================

// YAML parser
fastify.addContentTypeParser('application/yaml', { parseAs: 'string' }, (req, body, done) => {
  done(null, body);
});
fastify.addContentTypeParser('application/x-yaml', { parseAs: 'string' }, (req, body, done) => {
  done(null, body);
});
fastify.addContentTypeParser('text/yaml', { parseAs: 'string' }, (req, body, done) => {
  done(null, body);
});

// Text/plain parser (comma-separated values)
fastify.addContentTypeParser('text/plain', { parseAs: 'string' }, (req, body, done) => {
  done(null, body);
});

// =====================================================
// Health Check
// =====================================================

fastify.get('/health', async () => {
  const allUsers = UserRepository.getAllUsers();
  return {
    status: 'ok',
    users: allUsers.length,
    ready: true,
  };
});

// =====================================================
// Register Route Modules (Modular Architecture)
// =====================================================

registerTestingRoutes(fastify);  // /testing/*
registerTicabankRoutes(fastify);  // /creditos-ticabank/*
registerCiamRoutes(fastify);     // /channel/ciam/*, /cas/oidc/*, /auth/oauth/*
registerCardsRoutes(fastify);    // /bs-card-v4/*
registerAtlasRoutes(fastify);    // /support-core-account-transfer/*

// =====================================================
// Server Initialization
// =====================================================

const start = async () => {
  const port = Number(process.env.PORT) || 5050;
  const host = process.env.HOST || '0.0.0.0';

  try {
    // Auto-seed if enabled
    if (process.env.AUTO_SEED === 'true') {
      const seedType = process.env.SEED_TYPE || 'test';
      console.log('🌱 Auto-seeding enabled...');
      UserRepository.seedFromInternalFile(`./data/seed-${seedType}.yml`);
    }

    await fastify.listen({ port, host });
    
    console.log(`🚀 Server started on port ${port}`);
    console.log(`📋 Health: http://localhost:${port}/health`);
    console.log(`🧪 Testing: http://localhost:${port}/testing/state`);
    console.log(`📊 Data: http://localhost:${port}/testing/data`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
