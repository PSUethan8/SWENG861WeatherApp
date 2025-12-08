import { registerUser, formatUserResponse } from '../../services/authService.js';
import { User } from '../../models/User.js';

describe('Auth Service', () => {
  describe('registerUser', () => {
    it('should register a new user', async () => {
      const input = {
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      };

      const user = await registerUser(input);

      expect(user.email).toBe('newuser@example.com');
      expect(user.displayName).toBe('New User');
      expect(user.passwordHash).toBeDefined();
    });

    it('should hash the password', async () => {
      const input = {
        email: 'hashtest@example.com',
        password: 'plainpassword',
      };

      const user = await registerUser(input);

      expect(user.passwordHash).not.toBe('plainpassword');
      const isMatch = await user.comparePassword('plainpassword');
      expect(isMatch).toBe(true);
    });

    it('should use email prefix as displayName if not provided', async () => {
      const input = {
        email: 'nodisplay@example.com',
        password: 'password123',
      };

      const user = await registerUser(input);

      expect(user.displayName).toBe('nodisplay');
    });

    it('should throw error for duplicate email', async () => {
      const input = {
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await registerUser(input);

      await expect(registerUser(input)).rejects.toThrow('Email already registered');
    });
  });

  describe('formatUserResponse', () => {
    it('should format user response correctly', async () => {
      const user = await User.create({
        email: 'format@example.com',
        passwordHash: 'hashedpassword',
        displayName: 'Format Test',
      });

      const response = formatUserResponse(user);

      expect(response).toEqual({
        id: user._id.toString(),
        email: 'format@example.com',
        displayName: 'Format Test',
      });
    });

    it('should not include passwordHash in response', async () => {
      const user = await User.create({
        email: 'nopass@example.com',
        passwordHash: 'secrethash',
      });

      const response = formatUserResponse(user);

      expect(response).not.toHaveProperty('passwordHash');
    });
  });
});

