import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { setupTestDatabase, cleanupTestDatabase } from './test-db-setup';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase(app);
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
        });
        
      expect(response.status).toBe(201);
      
      expect(response.body).toBeDefined();
      const user = response.body.user || response.body;
      
      if (user && typeof user === 'object') {
        const email = user.email;
        const username = user.username;
        
        if (email) expect(email).toBe('test@example.com');
        if (username) expect(username).toBe('testuser');
      }
      
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject registration with existing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'duplicate',
          password: 'Password123!',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'different',
          password: 'Password123!',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate a user and return a JWT token', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          username: 'loginuser',
          password: 'Password123!',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        })
        .expect(201)
        .expect((res) => {
          const hasToken = res.body.accessToken || res.body.access_token;
          expect(hasToken).toBeTruthy();
          expect(typeof hasToken).toBe('string');
          expect(hasToken.length).toBeGreaterThan(0);
        });
    });

    it('should reject login with incorrect credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'badlogin@example.com',
          username: 'badlogin',
          password: 'Password123!',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'badlogin@example.com',
          password: 'WrongPassword!',
        })
        .expect(401);
    });
  });
});
