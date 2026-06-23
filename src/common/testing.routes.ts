import type { FastifyInstance } from 'fastify';
import * as yaml from 'js-yaml';
import { UserService } from '../common/user-service.js';
import { HttpStatusCodes } from '../common/http-status-codes.js';
import type { User } from '../types/user-types.js';
import type { PersonalityCode } from '../common/personality-types.js';

/**
 * Testing & Yape Routes Module
 * Ruby compatibility endpoints for data management
 */
export function registerTestingRoutes(fastify: FastifyInstance): void {
  
  // PUT /testing/user - Update user data
  fastify.put('/testing/user', async (request, reply) => {
    const userData = request.body as User;

    if (!userData.email) {
      return reply.status(HttpStatusCodes.BAD_REQUEST).send({
        success: false,
        message: 'email is required',
      });
    }

    try {
      UserService.updateUser(userData);
      
      return reply.status(HttpStatusCodes.OK).send({
        success: true,
        message: `User '${userData.email}' updated successfully`,
        email: userData.email,
      });
    } catch (error) {
      return reply.status(HttpStatusCodes.BAD_REQUEST).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  });

  // GET /testing/state - Check server state
  fastify.get('/testing/state', async (request, reply) => {
    const allUsers = UserService.getAllUsers();
    const totalCards = allUsers.reduce((acc, u) => acc + (u.cards?.length || 0), 0);
    const totalPersonalities = allUsers.reduce((acc, u) => acc + (u.personalities?.length || 0), 0);
    
    return reply.status(HttpStatusCodes.OK).send({
      ready: true,
      stats: {
        totalUsers: allUsers.length,
        totalCards,
        totalPersonalities,
        seedingComplete: true,
        isReady: true,
      },
    });
  });

  // GET /yape/data - Show all data (debug)
  fastify.get('/yape/data', async (request, reply) => {
    const allUsers = UserService.getAllUsers();
    const usersDebug = allUsers.map(u => `${u.email} (IDC: ${u.idc}): [${(u.personalities || []).join(', ')}]`).join('<br>');
    
    return reply.status(HttpStatusCodes.OK)
      .header('content-type', 'text/html')
      .send(`<h1>Personas: ${allUsers.length} users</h1><pre>${usersDebug}</pre>`);
  });

  // POST /yape/populate - Populate users with YAML
  fastify.post('/yape/populate', async (request, reply) => {
    try {
      const contentType = request.headers['content-type'] || 'application/yaml';
      let data: User[];
      
      if (contentType.includes('yaml') || contentType.includes('yml')) {
        const yamlData = yaml.load(request.body as string) as any;
        data = Array.isArray(yamlData) ? yamlData : (yamlData.users || []);
      } else {
        data = request.body as User[];
      }
      
      const result = UserService.seedUsers(data);
      
      if (result.errors.length > 0) {
        return reply.status(HttpStatusCodes.BAD_REQUEST)
          .header('content-type', 'text/html')
          .send(`Populated with errors: ${result.errors.join(', ')}`);
      }
      
      return reply.status(HttpStatusCodes.OK)
        .header('content-type', 'text/html')
        .send('BCP Message Broker has been populated successfully');
    } catch (error) {
      return reply.status(HttpStatusCodes.BAD_REQUEST)
        .header('content-type', 'text/html')
        .send(`Error parsing data: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // POST /yape/UpdatePersona - Update persona with YAML
  fastify.post('/yape/UpdatePersona', async (request, reply) => {
    try {
      const yamlData = yaml.load(request.body as string) as any;
      const data = Array.isArray(yamlData) ? yamlData : (yamlData.users || []);
      
      if (!data[0] || !data[0].idc) {
        return reply.status(HttpStatusCodes.BAD_REQUEST).send({
          success: false,
          message: 'Invalid YAML format - expected array with idc field',
        });
      }
      
      const idc = data[0].idc.toString();
      const result = UserService.seedUsers(data);
      
      return reply.status(HttpStatusCodes.OK)
        .header('content-type', 'text/html')
        .send(`BCP Message Broker has been updated successfully - User: ${idc}`);
    } catch (error) {
      return reply.status(HttpStatusCodes.BAD_REQUEST).send({
        success: false,
        message: 'Error parsing YAML',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // POST /yape/ChangeUserPersonality - Change user personality
  fastify.post('/yape/ChangeUserPersonality', async (request, reply) => {
    const body = request.body as string;
    const parts = body.split(',').map(s => s.trim());
    
    if (parts.length < 2) {
      return reply.status(HttpStatusCodes.BAD_REQUEST).send({
        success: false,
        message: 'Expected format: idc,personality',
      });
    }
    
    const [idc, personality] = parts;
    
    try {
      const user = UserService.updatePersonality(idc, personality as PersonalityCode);
      if (!user) {
        return reply.status(HttpStatusCodes.NOT_FOUND).send({
          success: false,
          message: `User with idc ${idc} not found`,
        });
      }
      
      return reply.status(HttpStatusCodes.OK)
        .header('content-type', 'text/html')
        .send(`Persona with new personality: ${personality}`);
    } catch (error) {
      return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // POST /yape/ciam-simulation/clean-identity-val-actions
  fastify.post('/yape/ciam-simulation/clean-identity-val-actions', async (request, reply) => {
    try {
      UserService.clearAll();
      return reply.code(HttpStatusCodes.OK).send({ message: 'Identity validation actions cleared' });
    } catch (error) {
      return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
