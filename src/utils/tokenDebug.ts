// Create a NEW file: src/utils/tokenDebug.ts (separate from your existing emailService.ts)

interface TokenPayload {
  userId?: string;
  id?: string;
  role?: string;
  email?: string;
  exp: number;
  iat?: number;
}

interface TokenDebugResult {
  valid: boolean;
  payload?: TokenPayload;
  expired?: boolean;
  error?: string;
}

interface AuthStatus {
  authenticated: boolean;
  authorized: boolean;
  role?: string;
  userId?: string;
  error?: string;
}

export const debugToken = (): TokenDebugResult => {
  console.log('=== TOKEN DEBUG UTILITY ===');
  
  const token = localStorage.getItem('token');
  console.log('1. Token exists:', !!token);
  console.log('2. Raw token (first 50 chars):', token?.substring(0, 50) + '...');
  
  if (token) {
    try {
      // Check if token has proper JWT structure (3 parts separated by dots)
      const parts = token.split('.');
      console.log('3. Token parts count:', parts.length);
      
      if (parts.length === 3) {
        // Decode header
        const header = JSON.parse(atob(parts[0]));
        console.log('4. Token header:', header);
        
        // Decode payload
        const payload: TokenPayload = JSON.parse(atob(parts[1]));
        console.log('5. Token payload:', payload);
        console.log('6. Token expires:', new Date(payload.exp * 1000));
        console.log('7. Current time:', new Date());
        console.log('8. Token expired:', payload.exp * 1000 < Date.now());
        console.log('9. User role:', payload.role);
        console.log('10. User ID:', payload.userId || payload.id);
        
        return { 
          valid: true, 
          payload, 
          expired: payload.exp * 1000 < Date.now() 
        };
      } else {
        console.log('ERROR: Invalid JWT format - should have 3 parts');
        return { valid: false, error: 'Invalid JWT format' };
      }
    } catch (error) {
      console.log('ERROR: Could not decode token:', error);
      return { valid: false, error: 'Could not decode token' };
    }
  } else {
    console.log('ERROR: No token found');
    return { valid: false, error: 'No token found' };
  }
};

// Helper function to check if user is authenticated and authorized
export const checkAuthStatus = (): AuthStatus => {
  const tokenInfo = debugToken();
  
  if (!tokenInfo.valid) {
    console.log('AUTH STATUS: Not authenticated');
    return { 
      authenticated: false, 
      authorized: false, 
      error: tokenInfo.error 
    };
  }
  
  if (tokenInfo.expired) {
    console.log('AUTH STATUS: Token expired');
    return { 
      authenticated: false, 
      authorized: false, 
      error: 'Token expired' 
    };
  }
  
  const isHR = tokenInfo.payload?.role?.toLowerCase() === 'hr';
  console.log('AUTH STATUS: Authenticated:', true, 'Authorized (HR):', isHR);
  
  return { 
    authenticated: true, 
    authorized: isHR, 
    role: tokenInfo.payload?.role,
    userId: tokenInfo.payload?.userId || tokenInfo.payload?.id
  };
};

// Helper function for making authenticated API requests
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};