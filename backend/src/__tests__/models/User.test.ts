import { User } from '../../models/User.js';
import bcrypt from 'bcrypt';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with email and password', async () => {
      const passwordHash = await bcrypt.hash('testpassword123', 12);
      const user = await User.create({
        email: 'test@example.com',
        passwordHash,
        displayName: 'Test User',
      });

      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
      expect(user.passwordHash).toBeDefined();
      expect(user._id).toBeDefined();
    });

    it('should convert email to lowercase', async () => {
      const passwordHash = await bcrypt.hash('testpassword123', 12);
      const user = await User.create({
        email: 'TEST@EXAMPLE.COM',
        passwordHash,
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should not allow duplicate emails', async () => {
      const passwordHash = await bcrypt.hash('testpassword123', 12);
      await User.create({
        email: 'duplicate@example.com',
        passwordHash,
      });

      await expect(
        User.create({
          email: 'duplicate@example.com',
          passwordHash,
        })
      ).rejects.toThrow();
    });

    it('should create a user with googleId', async () => {
      const user = await User.create({
        email: 'google@example.com',
        googleId: 'google-oauth-id-123',
        displayName: 'Google User',
      });

      expect(user.googleId).toBe('google-oauth-id-123');
      expect(user.passwordHash).toBeUndefined();
    });
  });

  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      const password = 'correctpassword';
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        email: 'password@example.com',
        passwordHash,
      });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 12);
      const user = await User.create({
        email: 'wrongpass@example.com',
        passwordHash,
      });

      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    it('should return false for user without password', async () => {
      const user = await User.create({
        email: 'nopassword@example.com',
        googleId: 'google-id',
      });

      const isMatch = await user.comparePassword('anypassword');
      expect(isMatch).toBe(false);
    });
  });
});

