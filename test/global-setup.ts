import { TEST_CONFIG } from './config/test-config';

/**
 * Jest Global Setup
 * Ensures server is fully ready before ANY test starts
 */

interface ServerState {
  ready: boolean;
  stats: {
    totalUsers: number;
    totalCards: number;
    totalPersonalities: number;
    seedingComplete: boolean;
    isReady: boolean;
  };
}

export default async function globalSetup() {
  console.log('🔍 Waiting for server to be ready...');
  
  const maxAttempts = 200; // Increased to 50 seconds for performance seed
  const delayMs = 250;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/testing/state`);
      const data = await response.json() as ServerState;
      
      if (data.ready === true && data.stats.totalUsers >= 20 && data.stats.totalCards >= 20) {
        console.log(`✅ Server ready! ${data.stats.totalUsers} users, ${data.stats.totalCards} cards`);
        // Extra wait to ensure all Maps are fully populated
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }
    } catch (error) {
      // Server not responding yet
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error('❌ Server failed to become ready in time');
}
