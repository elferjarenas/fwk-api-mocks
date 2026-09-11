/**
 * User Repository - Modern O(1) storage with Map-based lookups
 * Replaces Ruby's mutable arrays with type-safe, efficient storage
 */

import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { User, Personality, RepositoryState, SeedResult, Card } from '../types/user-types.js';
import type { PersonalityCode } from '../common/personality-types.js';

class UserRepositoryClass {
  // O(1) lookups with Maps
  private users = new Map<string, User>();              // email -> User
  private cardsByNumber = new Map<string, Card>();      // cardNumber -> Card
  private seedingComplete = false;                      // Flag: seed finished
  private initialSeedFile: string | null = null;        // Track seed file for reset
  private lastModifiedByModule = new Map<string, string>(); // module prefix -> user email
  
  /**
   * Create or update user
   */
  upsertUser(userData: User): User {
    const email = userData.email.toLowerCase();
    
    // Normalize booleans from YAML strings
    if (typeof userData.data_in_bcp === 'string') {
      userData.data_in_bcp = userData.data_in_bcp === 'true';
    }
    if (typeof userData.plin_flag === 'string') {
      userData.plin_flag = userData.plin_flag === 'true';
    }
    if (typeof userData.cce_flag === 'string') {
      userData.cce_flag = userData.cce_flag === 'true';
    }
    
    // ALWAYS convert personality singular to personalities array
    const personalities = Array.isArray(userData.personalities) 
      ? userData.personalities 
      : (userData.personality ? [userData.personality] : []);
    
    // Extract personality field to avoid including it
    const { personality: _removed, ...restData } = userData;
    
    // Create user with correct personalities array
    const user: User = {
      ...restData,
      email,
      personalities,
    };
    
    this.users.set(email, user);
    
    // Index cards for quick lookup
    if (user.cards) {
      user.cards.forEach(card => {
        this.cardsByNumber.set(card.number, card);
      });
    }
    
    return user;
  }
  
  /**
   * Set personality for user - O(1)
  
  /**
   * Get user by email - O(1)
   */
  getUser(email: string): User | undefined {
    return this.users.get(email.toLowerCase());
  }
  
  /**
   * Get last modified user for a personality module (e.g., 'YPCIAM', 'YPTPLI')
   */
  getLastModifiedUserByModule(modulePrefix: string): User | undefined {
    const email = this.lastModifiedByModule.get(modulePrefix);
    return email ? this.users.get(email) : undefined;
  }
  
  /**
   * Track that a user was modified with a specific module personality
   */
  trackModifiedUser(email: string, personalityPrefix: string): void {
    this.lastModifiedByModule.set(personalityPrefix, email.toLowerCase());
  }
  
  /**
   * Get user by document number (CIAM/Ticabank)
   * First tries documentNumber field, then falls back to clientCode
   */
  getUserByDocument(documentNumber: string): User | undefined {
    return Array.from(this.users.values()).find(
      u => u.documentNumber === documentNumber || u.clientCode?.toString() === documentNumber
    );
  }
  
  /**
   * Get user by clientCode (Ticabank) - O(n) but small dataset
   */
  getUserByClientCode(clientCode: number | string): User | undefined {
    const codeStr = clientCode.toString();
    return Array.from(this.users.values()).find(
      u => u.clientCode?.toString() === codeStr
    );
  }
  
  /**
   * Get card by number - O(1)
   */
  getCard(cardNumber: string): Card | undefined {
    return this.cardsByNumber.get(cardNumber);
  }
  
  /**
   * Find user by IDC (for Cards V4) - O(n) but small dataset
   */
  findByIdc(idc: string): User | undefined {
    return Array.from(this.users.values()).find(
      u => u.idc === idc
    );
  }
  
  /**
   * Find card by number - O(1) (alias for getCard)
   */
  findCardByNumber(cardNumber: string): Card | undefined {
    return this.cardsByNumber.get(cardNumber);
  }
  
  /**
   * Find user that owns a specific card
   */
  findUserByCard(card: Card): User | undefined {
    return Array.from(this.users.values()).find(user => {
      if (!user.cards) return false;
      return user.cards.some(c => c.number === card.number);
    });
  }
  
  /**
   * Find user by card number directly - used for checking personalities before validating card existence
   */
  findUserByCardNumber(cardNumber: string): User | undefined {
    return Array.from(this.users.values()).find(user => {
      if (!user.cards) return false;
      return user.cards.some(c => c.number === cardNumber);
    });
  }
  
  /**
   * Find user by account number - O(n) but small dataset
   * Searches through all users' cards and accounts
   */
  findUserByAccountNumber(accountNumber: string): User | undefined {
    return Array.from(this.users.values()).find(user => {
      if (!user.cards) return false;
      
      return user.cards.some(card => {
        if (!card.accounts) return false;
        return card.accounts.some(account => account.number === accountNumber);
      });
    });
  }
  
  /**
   * Find account in user's cards by account number
   */
  findAccountInUser(user: User, accountNumber: string): { account: any; card: Card } | undefined {
    if (!user.cards) return undefined;
    
    for (const card of user.cards) {
      if (!card.accounts) continue;
      
      const account = card.accounts.find(acc => acc.number === accountNumber);
      if (account) {
        return { account, card };
      }
    }
    
    return undefined;
  }
  
  /**
   * Update account balance in-memory
   * Returns updated balance as number
   */
  updateAccountBalance(accountNumber: string, newBalance: number): number {
    const user = this.findUserByAccountNumber(accountNumber);
    if (!user) {
      throw new Error(`Account ${accountNumber} not found`);
    }
    
    const result = this.findAccountInUser(user, accountNumber);
    if (!result) {
      throw new Error(`Account ${accountNumber} not found in user ${user.email}`);
    }
    
    // Update balance (stored as string in YAML)
    result.account.balance = newBalance.toFixed(2);
    
    return newBalance;
  }
  
  /**
   * Get all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
  
  /**
   * Seed from YAML data array
   */
  seed(data: User[]): SeedResult {
    const errors: string[] = [];
    let usersCreated = 0;
    let personalitiesSet = 0;
    let cardsCreated = 0;
    let accountsCreated = 0;
    
    data.forEach((userDef) => {
      try {
        // Create/update user - upsertUser handles personality conversion
        this.upsertUser(userDef);
        usersCreated++;
        
        // Track personality setting for reporting
        if (userDef.personality || (Array.isArray(userDef.personalities) && userDef.personalities.length > 0)) {
          personalitiesSet++;
        }
        
        // Count cards and accounts
        if (userDef.cards) {
          cardsCreated += userDef.cards.length;
          userDef.cards.forEach(card => {
            if (card.accounts) {
              accountsCreated += card.accounts.length;
            }
          });
        }
        
      } catch (error) {
        errors.push(
          `Error processing user ${userDef.email}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });
    
    console.log(
      `Populated: ${usersCreated} users, ${cardsCreated} cards, ${accountsCreated} accounts, ${personalitiesSet} personalities`
    );
    
    // Mark seeding as complete (important for /testing/state polling)
    this.seedingComplete = true;
    
    return { usersCreated, personalitiesSet, cardsCreated, accountsCreated, errors };
  }
  
  /**
   * Seed from internal YAML file (secure - only project files)
   */
  seedFromInternalFile(relativePath: string): SeedResult {
    try {
      // Only allow paths relative to project root
      if (relativePath.includes('..') || relativePath.startsWith('/')) {
        throw new Error('Only relative paths within project are allowed');
      }
      
      // Save path for reset functionality
      this.initialSeedFile = relativePath;
      
      const fileContents = fs.readFileSync(relativePath, 'utf8');
      
      const parsed = yaml.load(fileContents) as any;
      
      // Handle both formats: { users: [...] } or direct array [...]
      const data = parsed?.users || parsed;
      
      if (!Array.isArray(data)) {
        throw new Error('YAML must contain users array or be an array');
      }
      
      const result = this.seed(data);
      
      return result;
    } catch (error) {
      return {
        usersCreated: 0,
        personalitiesSet: 0,
        cardsCreated: 0,
        accountsCreated: 0,
        errors: [`Error loading file: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  }
  
  /**
   * Get current repository state
   */
  getState(): RepositoryState {
    return {
      users: this.getAllUsers(),
      personalities: [],
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Create snapshot (for rollback/testing)
   */
  snapshot(): RepositoryState {
    return this.getState();
  }
  
  /**
   * Reset to initial seed state
   */
  reset(): SeedResult {
    if (!this.initialSeedFile) {
      throw new Error('No initial seed file to reset to');
    }
    this.clear();
    return this.seedFromInternalFile(this.initialSeedFile);
  }
  
  /**
   * Restore from snapshot
   */
  restore(state: RepositoryState): void {
    this.clear();
    this.seed(state.users);
  }
  
  /**
   * Clear all data
   */
  clear(): void {
    this.seedingComplete = false;
    this.users.clear();
    this.cardsByNumber.clear();
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const totalUsers = this.users.size;
    const totalCards = this.cardsByNumber.size;
    const totalPersonalities = Array.from(this.users.values())
      .filter(u => u.personalities && u.personalities.length > 0).length;
    
    return {
      totalUsers,
      totalPersonalities,
      totalCards,
      seedingComplete: this.seedingComplete,
      // Minimum expected data: 20+ users and 20+ cards
      isReady: this.seedingComplete && totalUsers >= 20 && totalCards >= 20,
    };
  }
}

// Singleton instance
export const UserRepository = new UserRepositoryClass();
