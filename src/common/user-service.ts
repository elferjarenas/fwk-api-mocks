import { UserRepository } from '../repository/user-repository.js';
import type { User, SeedResult } from '../types/user-types.js';
import type { PersonalityCode } from './personality-types.js';

/**
 * User Service Layer
 * Implements Dependency Inversion Principle (SOLID)
 * 
 * Business logic layer between controllers and repository
 * Provides high-level operations without exposing repository details
 */
export class UserService {
  /**
   * Find user by IDC
   */
  static findByIdc(idc: string): User | undefined {
    return UserRepository.findByIdc(idc);
  }

  /**
   * Get all users
   */
  static getAllUsers(): User[] {
    return UserRepository.getAllUsers();
  }

  /**
   * Update user personality (atomic operation)
   * @param idc User IDC
   * @param personality New personality code
   * @returns Updated user or null if not found
   */
  static updatePersonality(idc: string, personality: PersonalityCode): User | null {
    const user = UserRepository.findByIdc(idc);
    if (!user) {
      return null;
    }
    
    user.personalities = [personality];
    UserRepository.upsertUser(user);
    
    // Track this change by module prefix
    const modulePrefix = this.getModulePrefix(personality);
    if (modulePrefix) {
      UserRepository.trackModifiedUser(user.email, modulePrefix);
    }
    
    return user;
  }
  
  /**
   * Get module prefix from personality code
   * @param personality Personality code (e.g., 'YPCIAM000', 'YPTPLI003')
   * @returns Module prefix (e.g., 'YPCIAM', 'YPTPLI') or null
   */
  private static getModulePrefix(personality: string): string | null {
    // Extract module prefix (e.g., YPCIAM, YPTPLI, YPCARD, YPATLS)
    const match = personality.match(/^(YP[A-Z]+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Get last modified user for a module
   * @param modulePrefix Module prefix (e.g., 'YPCIAM', 'YPTPLI')
   * @returns User or undefined
   */
  static getLastModifiedUserByModule(modulePrefix: string): User | undefined {
    return UserRepository.getLastModifiedUserByModule(modulePrefix);
  }

  /**
   * Update complete user (bulk operation)
   * @param userData User data to update/insert
   */
  static updateUser(userData: User): void {
    UserRepository.upsertUser(userData);
  }

  /**
   * Seed multiple users (batch operation)
   * @param users Array of users to seed
   */
  static seedUsers(users: User[]): SeedResult {
    return UserRepository.seed(users);
  }

  /**
   * Clear all users (dangerous - use only in tests)
   */
  static clearAll(): void {
    UserRepository.clear();
  }

  /**
   * Check if user exists
   */
  static exists(idc: string): boolean {
    return UserRepository.findByIdc(idc) !== undefined;
  }

  /**
   * Find users with specific personality
   * @param personalityCode Personality to search for
   * @returns Array of users with that personality
   */
  static findByPersonality(personalityCode: string): User[] {
    return UserRepository.getAllUsers().filter(
      user => user.personalities?.includes(personalityCode as PersonalityCode)
    );
  }
}
