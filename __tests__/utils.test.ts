import { encodedRedirect } from '../utils/utils';
import { redirect } from 'next/navigation';

// Mock next/navigation redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('encodedRedirect', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect with encoded error message', () => {
    encodedRedirect('error', '/sign-in', 'Invalid credentials');
    expect(redirect).toHaveBeenCalledWith('/sign-in?error=Invalid%20credentials');
  });

  it('should redirect with encoded success message', () => {
    encodedRedirect('success', '/sign-up', 'Account created');
    expect(redirect).toHaveBeenCalledWith('/sign-up?success=Account%20created');
  });
  
  it('should append to existing query parameters', () => {
    encodedRedirect('success', '/dashboard?view=resources', 'Changes saved');
    expect(redirect).toHaveBeenCalledWith('/dashboard?view=resources?success=Changes%20saved');
  });
  
  it('should handle empty messages', () => {
    encodedRedirect('error', '/profile', '');
    expect(redirect).toHaveBeenCalledWith('/profile?error=');
  });
  
  it('should handle paths with hash fragments', () => {
    encodedRedirect('success', '/charity/details#contact', 'Information updated');
    expect(redirect).toHaveBeenCalledWith('/charity/details#contact?success=Information%20updated');
  });
});