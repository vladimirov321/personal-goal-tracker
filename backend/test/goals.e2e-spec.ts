import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { setupTestDatabase, cleanupTestDatabase } from './test-db-setup';
import { GoalStatus } from '../src/modules/goals/enums/goal-status.enum';

describe('GoalsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let testGoalId: string = '';

  beforeAll(async () => {
    try {
      app = await setupTestDatabase();

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'goals-test@example.com',
          username: 'goalsuser',
          password: 'Password123!',
        });

      
      userId = registerResponse.body.user ? registerResponse.body.user.id : registerResponse.body.id;
      
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'goals-test@example.com',
          password: 'Password123!',
        });

      
      authToken = loginResponse.body.accessToken || loginResponse.body.access_token;
      
      if (!authToken) {
        throw new Error('Failed to get authentication token');
      }
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await cleanupTestDatabase(app);
  });

  describe('POST /goals', () => {
    it('should create a new goal', async () => {
      try {
        const response = await request(app.getHttpServer())
          .post('/goals')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Goal',
            description: 'This is a test goal',
          });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Test Goal');
        expect(response.body.description).toBe('This is a test goal');
        expect(response.body.status).toBe(GoalStatus.TODO);
        expect(response.body.userId).toBe(userId);

        testGoalId = response.body.id;
      } catch (error) {
        console.error('Error in goal creation test:', error.message);
        throw error;
      }
    });

    it('should require authentication', async () => {
      return request(app.getHttpServer())
        .post('/goals')
        .send({
          title: 'Unauthorized Goal',
          description: 'This should fail',
        })
        .expect(401);
    });
  });

  describe('GET /goals', () => {
    it('should return all goals for authenticated user', async () => {
      return request(app.getHttpServer())
        .get('/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0].userId).toBe(userId);
        });
    });

    it('should require authentication', async () => {
      return request(app.getHttpServer())
        .get('/goals')
        .expect(401);
    });
  });

  describe('GET /goals/:id', () => {
    it('should return a specific goal', async () => {
      return request(app.getHttpServer())
        .get(`/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testGoalId);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeUuid = '00000000-0000-4000-a000-000000000000';
      
      const response = await request(app.getHttpServer())
        .get(`/goals/${fakeUuid}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /goals/:id', () => {
    it('should update a goal', async () => {
      try {
        const createResponse = await request(app.getHttpServer())
          .post('/goals')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Goal To Be Updated',
            description: 'This goal will be updated in the test',
          });
        
        expect(createResponse.status).toBe(201);
        
        const goalId = createResponse.body.id;
        expect(goalId).toBeDefined();
        
        const getResponse = await request(app.getHttpServer())
          .get(`/goals/${goalId}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(getResponse.status).toBe(200);
        
        const response = await request(app.getHttpServer())
          .put(`/goals/${goalId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Updated Goal Title',
            description: 'Updated description',
          });
          
        if (response.status !== 200) {
          console.error('FAILED UPDATE TEST: Unexpected status code', response.status);
          console.error('Response headers:', response.headers);
        }
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Updated Goal Title');
        expect(response.body.description).toBe('Updated description');
      } catch (error) {
        console.error('Error in update goal test:', error);
        throw error;
      }
    });

    it('should update goal status', async () => {
      try {
        const createResponse = await request(app.getHttpServer())
          .post('/goals')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Goal For Status Update',
            description: 'This goal will have its status updated',
          });
        
        expect(createResponse.status).toBe(201);
        
        const goalId = createResponse.body.id;

        expect(goalId).toBeDefined();

        const getResponse = await request(app.getHttpServer())
          .get(`/goals/${goalId}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(getResponse.status).toBe(200);
        
        const response = await request(app.getHttpServer())
          .put(`/goals/${goalId}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: GoalStatus.IN_PROGRESS,
          });
        
        if (response.status !== 200) {
          console.error('FAILED STATUS UPDATE TEST: Unexpected status code', response.status);
          console.error('Response headers:', response.headers);
        }
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.status).toBe(GoalStatus.IN_PROGRESS);
      } catch (error) {
        console.error('Error in status update test:', error);
        throw error;
      }
    });
  });

  describe('DELETE /goals/:id', () => {
    let goalToDeleteId: string;
    
    beforeEach(async () => {
      try {
        const createResponse = await request(app.getHttpServer())
          .post('/goals')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Goal to Delete',
            description: 'This goal will be deleted',
          });
          
        if (createResponse.status === 201) {
          goalToDeleteId = createResponse.body.id;
        }
      } catch (error) {
        console.error('Error creating goal for delete test:', error);
        throw error;
      }
    });
    
    it('should delete a goal', async () => {
      expect(goalToDeleteId).toBeDefined();
      
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/goals/${goalToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(deleteResponse.status).toBe(200);

      const verifyResponse = await request(app.getHttpServer())
        .get(`/goals/${goalToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(verifyResponse.status).toBe(404);
    });

    it('should not allow deleting another user\'s goal', async () => {
      try {
        const createResponse = await request(app.getHttpServer())
          .post('/goals')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Protected Goal',
            description: 'This goal should not be deleted by another user',
          });
          
        const protectedGoalId = createResponse.body.id;
        
        const verifyResponse = await request(app.getHttpServer())
          .get(`/goals/${protectedGoalId}`)
          .set('Authorization', `Bearer ${authToken}`);
          
        expect(verifyResponse.status).toBe(200);
        
        const otherRegisterResponse = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'other-user@example.com',
            username: 'otheruser',
            password: 'Password123!',
          });

        const otherLoginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'other-user@example.com',
            password: 'Password123!',
          });

        
        const otherUserToken = otherLoginResponse.body.accessToken || otherLoginResponse.body.access_token;

        const accessResponse = await request(app.getHttpServer())
          .get(`/goals/${protectedGoalId}`)
          .set('Authorization', `Bearer ${otherUserToken}`);
          
        
        const deleteResponse = await request(app.getHttpServer())
          .delete(`/goals/${protectedGoalId}`)
          .set('Authorization', `Bearer ${otherUserToken}`);
        
        expect([401, 404]).toContain(deleteResponse.status);
        
      } catch (error) {
        console.error('Error in authorization test:', error);
        throw error;
      }
    });
  });
});
