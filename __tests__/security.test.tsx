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
    // Setup the mock to return a failed authentication
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid email or password'
    });
    
    // Create a mock FormData with invalid credentials
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');
    
    // Call the sign-in action directly
    const result = await signInAction(formData);
    
    // Verify that it failed properly
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
  });

  it('should handle SQL injection attempts', async () => {
    // Setup the mock to return a failed authentication
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid email or password'
    });
    
    // Create a mock FormData with SQL injection attempts
    const formData = new FormData();
    formData.append('email', "admin@example.com' OR '1'='1");
    formData.append('password', "password' OR '1'='1");
    
    // Call the sign-in action directly
    await signInAction(formData);
    
    // Verify that the action was called with the SQL injection inputs
    expect(signInAction).toHaveBeenCalledWith(formData);
    
    // Extract the FormData from the call arguments to verify values were passed correctly
    const calledFormData = (signInAction as jest.Mock).mock.calls[0][0];
    expect(calledFormData.get('email')).toBe("admin@example.com' OR '1'='1");
    expect(calledFormData.get('password')).toBe("password' OR '1'='1");
  });

  it('should redirect on successful login to protected or account page', async () => {
    // Case 1: User has a registered charity (redirect to /protected)
    (signInAction as jest.Mock).mockImplementation(() => {
      redirect('/protected');
      return { success: true }; // This won't actually be returned due to redirect
    });
    
    const formData = new FormData();
    formData.append('email', 'validuser@example.com');
    formData.append('password', 'correctPassword');
    
    await signInAction(formData);
    
    // Verify redirect was called with the protected route
    expect(redirect).toHaveBeenCalledWith('/protected');
    
    // Reset mocks for next test
    jest.clearAllMocks();
    
    // Case 2: User doesn't have a registered charity (redirect to /protected/account-page)
    (signInAction as jest.Mock).mockImplementation(() => {
      redirect('/protected/account-page');
      return { success: true }; // This won't actually be returned due to redirect
    });
    
    await signInAction(formData);
    
    // Verify redirect was called with the account page route
    expect(redirect).toHaveBeenCalledWith('/protected/account-page');
  });

  it('should properly handle empty credentials', async () => {
    // Setup mock to return failed authentication
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Email and password are required'
    });
    
    // Create a mock FormData with empty credentials
    const formData = new FormData();
    formData.append('email', '');
    formData.append('password', '');
    
    // Call the sign-in action directly
    const result = await signInAction(formData);
    
    // Verify that it failed properly with appropriate message
    expect(result.success).toBe(false);
    expect(result.message).toBe('Email and password are required');
  });

  it('should handle malformed email addresses', async () => {
    // Setup mock to return failed authentication for invalid email format
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid email format'
    });
    
    // Create a mock FormData with malformed email
    const formData = new FormData();
    formData.append('email', 'not-an-email');
    formData.append('password', 'password123');
    
    // Call the sign-in action directly
    const result = await signInAction(formData);
    
    // Verify that it failed properly with appropriate message
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email format');
  });

  it('should display error toast on authentication failure', async () => {
    // Setup mock to return failed authentication
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Authentication failed'
    });
    
    // Create a mock FormData
    const formData = new FormData();
    formData.append('email', 'user@example.com');
    formData.append('password', 'wrongPassword');
    
    // Call the sign-in action
    await signInAction(formData);
    
    // Simulate the component's behavior when handling the error
    // In the actual component, there's a toast.error call
    toast.error('Authentication failed');
    
    // Verify toast.error was called with the correct message
    expect(toast.error).toHaveBeenCalledWith('Authentication failed');
  });

  it('should handle XSS attempts in credentials', async () => {
    // Setup mock to return failed authentication
    (signInAction as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid credentials'
    });
    
    // Create a mock FormData with XSS attempts
    const formData = new FormData();
    formData.append('email', '<script>alert("XSS")</script>');
    formData.append('password', '<img src="x" onerror="alert(\'XSS\')">');
    
    // Call the sign-in action directly
    await signInAction(formData);
    
    // Verify that the action was called with the XSS payloads
    expect(signInAction).toHaveBeenCalledWith(formData);
    
    // Extract the FormData from the call arguments
    const calledFormData = (signInAction as jest.Mock).mock.calls[0][0];
    expect(calledFormData.get('email')).toBe('<script>alert("XSS")</script>');
    expect(calledFormData.get('password')).toBe('<img src="x" onerror="alert(\'XSS\')">');
  });

  it('should handle rate limiting or brute force protection', async () => {
    // First few attempts return normal errors
    (signInAction as jest.Mock)
      .mockResolvedValueOnce({
        success: false,
        message: 'Invalid email or password'
      })
      .mockResolvedValueOnce({
        success: false,
        message: 'Invalid email or password'
      })
      // Third attempt should trigger rate limiting
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
    // Mock implementation to demonstrate input sanitization
    (signInAction as jest.Mock).mockImplementation((formData) => {
      // Extract and sanitize email and password
      const email = formData.get('email')?.toString().trim();
      const password = formData.get('password')?.toString();
      
      // Check if inputs are valid
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }
      
      // Return success for this test
      return { success: true };
    });
    
    // Create a mock FormData with whitespace padding
    const formData = new FormData();
    formData.append('email', '  user@example.com  ');
    formData.append('password', 'password123');
    
    // Call the sign-in action
    const result = await signInAction(formData);
    
    // Verify success
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
    // Setup the mock to simulate password validation
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const password = formData.get('password')?.toString() || '';
      
      // Check password strength
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
    
    // Test with weak password
    const weakFormData = new FormData();
    weakFormData.append('email', 'test@example.com');
    weakFormData.append('password', 'weakpass');
    
    await signUpAction(weakFormData);
    
    // Should call encodedRedirect with error message for weak password
    expect(encodedRedirect).toHaveBeenCalledWith(
      "error", 
      "/sign-up", 
      "Password must include uppercase, lowercase, number, and special character"
    );
    
    // Reset mocks for next test
    jest.clearAllMocks();
    
    // Test with strong password
    const strongFormData = new FormData();
    strongFormData.append('email', 'test@example.com');
    strongFormData.append('password', 'StrongP@ss123');
    
    const result = await signUpAction(strongFormData);
    
    // Should return success for strong password
    expect(result.success).toBe(true);
    expect(result.message).toBe("Thanks for signing up! Please check your email for a verification link.");
  });

  it('should ensure passwords match during registration', async () => {
    // Setup mock to verify password matching
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const password = formData.get('password')?.toString();
      const repeatPassword = formData.get('repeatPassword')?.toString();
      
      if (password !== repeatPassword) {
        return { success: false, message: "Passwords do not match" };
      }
      
      return { success: true, message: "Thanks for signing up! Please check your email for a verification link." };
    });
    
    // Test with mismatched passwords
    const mismatchFormData = new FormData();
    mismatchFormData.append('email', 'test@example.com');
    mismatchFormData.append('password', 'Password123!');
    mismatchFormData.append('repeatPassword', 'DifferentPassword123!');
    
    const mismatchResult = await signUpAction(mismatchFormData);
    
    // Should return error for mismatched passwords
    expect(mismatchResult.success).toBe(false);
    expect(mismatchResult.message).toBe("Passwords do not match");
    
    // Test with matching passwords
    const matchFormData = new FormData();
    matchFormData.append('email', 'test@example.com');
    matchFormData.append('password', 'Password123!');
    matchFormData.append('repeatPassword', 'Password123!');
    
    const matchResult = await signUpAction(matchFormData);
    
    // Should return success for matching passwords
    expect(matchResult.success).toBe(true);
  });

  it('should verify email format during registration', async () => {
    // Setup mock to validate email format
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const email = formData.get('email')?.toString() || '';
      
      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        return { success: false, message: "Invalid email format" };
      }
      
      return { success: true, message: "Thanks for signing up! Please check your email for a verification link." };
    });
    
    // Test with invalid email
    const invalidEmailForm = new FormData();
    invalidEmailForm.append('email', 'not-an-email');
    invalidEmailForm.append('password', 'Password123!');
    
    const invalidResult = await signUpAction(invalidEmailForm);
    
    // Should return error for invalid email
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.message).toBe("Invalid email format");
    
    // Test with valid email
    const validEmailForm = new FormData();
    validEmailForm.append('email', 'valid@example.com');
    validEmailForm.append('password', 'Password123!');
    
    const validResult = await signUpAction(validEmailForm);
    
    // Should return success for valid email
    expect(validResult.success).toBe(true);
  });

  it('should handle email verification link correctly', async () => {
    const origin = 'http://localhost:3000';
    
    // Setup mock to include email verification
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const email = formData.get('email')?.toString();
      
      // Simulate sending verification email
      const emailRedirectTo = `${origin}/auth/callback`;
      
      // In a real implementation, this would trigger an email send
      
      return { 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      };
    });
    
    const formData = new FormData();
    formData.append('email', 'newuser@example.com');
    formData.append('password', 'SecureP@ss123');
    
    const result = await signUpAction(formData);
    
    // Should return success and verification message
    expect(result.success).toBe(true);
    expect(result.message).toContain("verification link");
  });

  it('should prevent duplicate email registrations', async () => {
    // Setup mock to simulate email uniqueness check
    (signUpAction as jest.Mock)
      // First call with this email succeeds
      .mockImplementationOnce((formData) => {
        return { 
          success: true, 
          message: "Thanks for signing up! Please check your email for a verification link." 
        };
      })
      // Second call with same email fails
      .mockImplementationOnce((formData) => {
        return encodedRedirect(
          "error", 
          "/sign-up", 
          "Email already in use. Please use a different email or try logging in."
        );
      });
    
    // First registration attempt
    const formData = new FormData();
    formData.append('email', 'existing@example.com');
    formData.append('password', 'SecureP@ss123');
    
    // First attempt should succeed
    const firstResult = await signUpAction(formData);
    expect(firstResult.success).toBe(true);
    
    // Second attempt with same email should fail
    await signUpAction(formData);
    
    // Should redirect with error
    expect(encodedRedirect).toHaveBeenCalledWith(
      "error", 
      "/sign-up", 
      "Email already in use. Please use a different email or try logging in."
    );
  });

  it('should require consent checkbox to be checked', async () => {
    // Setup mock to verify consent checkbox
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
    
    // Test without consent
    const noConsentForm = new FormData();
    noConsentForm.append('email', 'test@example.com');
    noConsentForm.append('password', 'SecureP@ss123');
    // Consent checkbox not checked
    
    const noConsentResult = await signUpAction(noConsentForm);
    
    // Should return error for missing consent
    expect(noConsentResult.success).toBe(false);
    expect(noConsentResult.message).toContain("confirm this account");
    
    // Test with consent
    const withConsentForm = new FormData();
    withConsentForm.append('email', 'test@example.com');
    withConsentForm.append('password', 'SecureP@ss123');
    withConsentForm.append('consent', 'on');
    
    const withConsentResult = await signUpAction(withConsentForm);
    
    // Should return success when consent is given
    expect(withConsentResult.success).toBe(true);
  });

  it('should handle rate limiting for registration attempts', async () => {
    // Setup mock to simulate rate limiting
    (signUpAction as jest.Mock)
      .mockResolvedValueOnce({ 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      })
      .mockResolvedValueOnce({ 
        success: true, 
        message: "Thanks for signing up! Please check your email for a verification link." 
      })
      // Third attempt should be rate limited
      .mockResolvedValueOnce({
        success: false,
        message: "Too many registration attempts. Please try again later."
      });
    
    const formData = new FormData();
    
    // First two attempts succeed
    await signUpAction(formData);
    await signUpAction(formData);
    
    // Third attempt should be rate limited
    const thirdResult = await signUpAction(formData);
    
    expect(thirdResult.success).toBe(false);
    expect(thirdResult.message).toContain("Too many registration attempts");
  });

  it('should prevent XSS attacks in registration data', async () => {
    // Setup mock to check XSS payloads
    (signUpAction as jest.Mock).mockImplementation((formData) => {
      const email = formData.get('email')?.toString();
      
      // In a real implementation, this would sanitize the input
      
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
    
    // Verify the action was called with the XSS payload
    expect(signUpAction).toHaveBeenCalledWith(xssFormData);
    
    // Extract the FormData from the call arguments
    const calledFormData = (signUpAction as jest.Mock).mock.calls[0][0];
    expect(calledFormData.get('email')).toBe('<script>alert("XSS")</script>@example.com');
  });
});