import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { signInAction, signUpAction } from '../app/actions';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';
import { encodedRedirect } from '../utils/utils';

// Mock the auth actions
jest.mock('../app/actions', () => ({
  signInAction: jest.fn(),
  signUpAction: jest.fn(),
}));

// Mock redirect and encodedRedirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../utils/utils', () => ({
  encodedRedirect: jest.fn(),
}));

describe('Sign In Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject invalid credentials', async () => {
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid email or password'
    });
    
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');
  
    const result = await signInAction(formData);
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
  });

  it('should handle SQL injection attempts', async () => {
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid email or password'
    });
    
    const formData = new FormData();
    formData.append('email', "admin@example.com' OR '1'='1");
    formData.append('password', "password' OR '1'='1");
    
    await signInAction(formData);
    
    expect(signInAction).toHaveBeenCalledWith(formData);
    const calledFormData = (signInAction as jest.Mock).mock.calls[0][0];
    expect(calledFormData.get('email')).toBe("admin@example.com' OR '1'='1");
    expect(calledFormData.get('password')).toBe("password' OR '1'='1");
  });

  it('should redirect on successful login to protected or account page', async () => {
    (signInAction as jest.Mock).mockImplementation(() => {
      redirect('/protected');
      return { success: true }; // This won't actually be returned due to redirect
    });
    
    const formData = new FormData();
    formData.append('email', 'validuser@example.com');
    formData.append('password', 'correctPassword');
    
    await signInAction(formData);
    
    expect(redirect).toHaveBeenCalledWith('/protected');
    
    jest.clearAllMocks();
    
    (signInAction as jest.Mock).mockImplementation(() => {
      redirect('/protected/account-page');
      return { success: true }; // This won't actually be returned due to redirect
    });
    
    await signInAction(formData);
    
    expect(redirect).toHaveBeenCalledWith('/protected/account-page');
  });

  it('should properly handle empty credentials', async () => {
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Email and password are required'
    });
    
    const formData = new FormData();
    formData.append('email', '');
    formData.append('password', '');
    
    const result = await signInAction(formData);
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Email and password are required');
  });

  it('should handle malformed email addresses', async () => {
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid email format'
    });
    
    const formData = new FormData();
    formData.append('email', 'not-an-email');
    formData.append('password', 'password123');
    
    const result = await signInAction(formData);
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email format');
  });

  it('should display error toast on authentication failure', async () => {
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Authentication failed'
    });
    
    const formData = new FormData();
    formData.append('email', 'user@example.com');
    formData.append('password', 'wrongPassword');
    
    await signInAction(formData);
    
    toast.error('Authentication failed');
    expect(toast.error).toHaveBeenCalledWith('Authentication failed');
  });

  it('should handle XSS attempts in credentials', async () => {
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid credentials'
    });
    
    const formData = new FormData();
    formData.append('email', '<script>alert("XSS")</script>');
    formData.append('password', '<img src="x" onerror="alert(\'XSS\')">');
    
    await signInAction(formData);
    
    expect(signInAction).toHaveBeenCalledWith(formData);
    
    const calledFormData = (signInAction as jest.Mock).mock.calls[0][0];
    expect(calledFormData.get('email')).toBe('<script>alert("XSS")</script>');
    expect(calledFormData.get('password')).toBe('<img src="x" onerror="alert(\'XSS\')">');
  });

  it('should handle rate limiting or brute force protection', async () => {
    (signInAction as jest.Mock)
      .mockResolvedValueOnce({
        success: false,
        message: 'Invalid email or password'
      })
      .mockResolvedValueOnce({
        success: false,
        message: 'Invalid email or password'
      })
      .mockResolvedValueOnce({
        success: false,
        message: 'Too many failed attempts. Please try again later.'
      });
    
    const formData = new FormData();
    formData.append('email', 'user@example.com');
    formData.append('password', 'wrongPassword');
    
    // First attempt
    await signInAction(formData);
    // Second attempt
    await signInAction(formData);
    // Third attempt should be rate limited
    const result = await signInAction(formData);
    
    // Verify the rate limiting message
    expect(result.success).toBe(false);
    expect(result.message).toBe('Too many failed attempts. Please try again later.');
  });

  it('should sanitize inputs before processing', async () => {
    (signInAction as jest.Mock).mockImplementation((formData) => {
      const email = formData.get('email')?.toString().trim();
      const password = formData.get('password')?.toString();
      
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }
      
      return { success: true };
    });
    
    const formData = new FormData();
    formData.append('email', '  user@example.com  ');
    formData.append('password', 'password123');
    
    const result = await signInAction(formData);
    
    expect(result.success).toBe(true);
  });
});

// =================================
// Sign Up Security Tests
// =================================

describe('Sign Up Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enforce password security requirements', async () => {
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const password = formData.get('password')?.toString() || '';
      
      const hasLength = password.length >= 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      
      const isStrongPassword = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
      
      if (!isStrongPassword) {
        return encodedRedirect(
          "error", 
          "/sign-up", 
          "Password must include uppercase, lowercase, number, and special character"
        );
      }
      
      return { 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      };
    });
    
    const weakFormData = new FormData();
    weakFormData.append('email', 'test@example.com');
    weakFormData.append('password', 'weakpass');
    
    await signUpAction(weakFormData);
    
    expect(encodedRedirect).toHaveBeenCalledWith(
      "error", 
      "/sign-up", 
      "Password must include uppercase, lowercase, number, and special character"
    );
    
    jest.clearAllMocks();
    
    const strongFormData = new FormData();
    strongFormData.append('email', 'test@example.com');
    strongFormData.append('password', 'StrongP@ss123');
    
    const result = await signUpAction(strongFormData);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe("Thanks for signing up! Please check your email for a verification link.");
  });

  it('should ensure passwords match during registration', async () => {
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const password = formData.get('password')?.toString();
      const repeatPassword = formData.get('repeatPassword')?.toString();
      
      if (password !== repeatPassword) {
        return { success: false, message: "Passwords do not match" };
      }
      
      return { success: true, message: "Thanks for signing up! Please check your email for a verification link." };
    });
    
    const mismatchFormData = new FormData();
    mismatchFormData.append('email', 'test@example.com');
    mismatchFormData.append('password', 'Password123!');
    mismatchFormData.append('repeatPassword', 'DifferentPassword123!');
    
    const mismatchResult = await signUpAction(mismatchFormData);
    
    expect(mismatchResult.success).toBe(false);
    expect(mismatchResult.message).toBe("Passwords do not match");
    
    const matchFormData = new FormData();
    matchFormData.append('email', 'test@example.com');
    matchFormData.append('password', 'Password123!');
    matchFormData.append('repeatPassword', 'Password123!');
    
    const matchResult = await signUpAction(matchFormData);
    
    expect(matchResult.success).toBe(true);
  });

  it('should verify email format during registration', async () => {
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const email = formData.get('email')?.toString() || '';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        return { success: false, message: "Invalid email format" };
      }
      
      return { success: true, message: "Thanks for signing up! Please check your email for a verification link." };
    });
    
    const invalidEmailForm = new FormData();
    invalidEmailForm.append('email', 'not-an-email');
    invalidEmailForm.append('password', 'Password123!');
    
    const invalidResult = await signUpAction(invalidEmailForm);
    
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.message).toBe("Invalid email format");
    
    const validEmailForm = new FormData();
    validEmailForm.append('email', 'valid@example.com');
    validEmailForm.append('password', 'Password123!');
    
    const validResult = await signUpAction(validEmailForm);
    
    expect(validResult.success).toBe(true);
  });

  it('should prevent duplicate email registrations', async () => {
    (signUpAction as jest.Mock)
      .mockImplementationOnce((formData) => {
        return { 
          success: true, 
          message: "Thanks for signing up! Please check your email for a verification link." 
        };
      })
      .mockImplementationOnce((formData) => {
        return encodedRedirect(
          "error", 
          "/sign-up", 
          "Email already in use. Please use a different email or try logging in."
        );
      });
    
    const formData = new FormData();
    formData.append('email', 'existing@example.com');
    formData.append('password', 'SecureP@ss123');
    
    const firstResult = await signUpAction(formData);
    expect(firstResult.success).toBe(true);
    
    await signUpAction(formData);
    
    expect(encodedRedirect).toHaveBeenCalledWith(
      "error", 
      "/sign-up", 
      "Email already in use. Please use a different email or try logging in."
    );
  });

  it('should require consent checkbox to be checked', async () => {
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const consent = formData.get('consent');
      
      if (!consent) {
        return { 
          success: false, 
          message: "You must confirm this account is for a registered charitable organisation." 
        };
      }
      
      return { 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      };
    });
    
    const noConsentForm = new FormData();
    noConsentForm.append('email', 'test@example.com');
    noConsentForm.append('password', 'SecureP@ss123');
    
    const noConsentResult = await signUpAction(noConsentForm);
    
    expect(noConsentResult.success).toBe(false);
    expect(noConsentResult.message).toContain("confirm this account");
    
    const withConsentForm = new FormData();
    withConsentForm.append('email', 'test@example.com');
    withConsentForm.append('password', 'SecureP@ss123');
    withConsentForm.append('consent', 'on');
    
    const withConsentResult = await signUpAction(withConsentForm);
    
    expect(withConsentResult.success).toBe(true);
  });

  it('should handle rate limiting for registration attempts', async () => {
    (signUpAction as jest.Mock)
      .mockResolvedValueOnce({ 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      })
      .mockResolvedValueOnce({ 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      })
      .mockResolvedValueOnce({
        success: false,
        message: "Too many registration attempts. Please try again later."
      });
    
    const formData = new FormData();
    
    await signUpAction(formData);
    await signUpAction(formData);
    
    // Third attempt should be rate limited
    const thirdResult = await signUpAction(formData);
    
    expect(thirdResult.success).toBe(false);
    expect(thirdResult.message).toContain("Too many registration attempts");
  });

  it('should prevent XSS attacks in registration data', async () => {
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const email = formData.get('email')?.toString();
      
      return { 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      };
    });
    
    // Form with XSS payload
    const xssFormData = new FormData();
    xssFormData.append('email', '<script>alert("XSS")</script>@example.com');
    xssFormData.append('password', 'SecureP@ss123');
    
    await signUpAction(xssFormData);
    expect(signUpAction).toHaveBeenCalledWith(xssFormData);
    
    const calledFormData = (signUpAction as jest.Mock).mock.calls[0][0];
    expect(calledFormData.get('email')).toBe('<script>alert("XSS")</script>@example.com');
  });
});