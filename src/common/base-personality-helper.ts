import { UserRepository } from '../repository/user-repository.js';
import { findPersonality } from './personality-checker.js';
import type { User } from '../types/user-types.js';

/**
 * Base helper for personality-based error simulation
 * Implements common pattern: find user → check personality → evaluate → return/throw
 * 
 * DRY principle: All business helpers extend this to avoid code duplication
 */
export abstract class BasePersonalityHelper<TResponse> {
  /**
   * Find user with error personality for specific domain
   * @param domain Domain to check (e.g., 'OFFER', 'CIAM', 'CARDS')
   * @param isErrorCheck Function to check if personality is an error
   * @returns User with error personality or null
   */
  protected findUserWithErrorPersonality(
    domain: string,
    isErrorCheck: (personality: string) => boolean
  ): { user: User; personality: string } | null {
    const allUsers = UserRepository.getAllUsers();
    
    for (const user of allUsers) {
      if (user.personalities) {
        const errorPersonality = findPersonality(
          user.personalities,
          (p) => isErrorCheck(p)
        );
        
        if (errorPersonality) {
          return { user, personality: errorPersonality };
        }
      }
    }
    
    return null;
  }

  /**
   * Execute business logic with personality evaluation
   * Template method pattern: define algorithm skeleton, let subclasses implement steps
   * 
   * @param evaluator Function to evaluate personality and throw/return
   * @param happyPath Function to return default success response
   * @returns Response (success or error)
   */
  protected executeWithPersonalityCheck<T extends string>(
    domain: string,
    isErrorCheck: (personality: string) => boolean,
    evaluator: (personality: T, user: User) => TResponse | never,
    happyPath: () => TResponse
  ): TResponse {
    const result = this.findUserWithErrorPersonality(domain, isErrorCheck);
    
    if (result) {
      return evaluator(result.personality as T, result.user);
    }
    
    return happyPath();
  }
}
