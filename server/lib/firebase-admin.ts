// We'll implement a simplified Firebase token verifier since setup is complex
// In a production environment, you would use firebase-admin properly

// Create a stub for auth
const auth = {
  verifyIdToken: async () => {
    throw new Error('Not implemented in demo mode');
  }
};

/**
 * Verify a Firebase ID token
 * 
 * In a production environment, this should use the proper Firebase verification.
 * For this demo, we'll decode the JWT token to get the payload, but this is NOT 
 * secure for production as it doesn't verify the token was issued by Firebase.
 * 
 * @param idToken The Firebase ID token to verify
 * @returns The decoded token payload
 */
export const verifyIdToken = async (idToken: string): Promise<any> => {
  try {
    if (!idToken) {
      throw new Error('No ID token provided');
    }

    // In a production environment with proper setup, you would use:
    // return await auth.verifyIdToken(idToken);
    
    // For development, we'll parse the JWT without full verification
    // This is ONLY for demonstration purposes
    const parts = idToken.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf8')
    );
    
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token payload');
    }
    
    // Format the decoded data to match Firebase Auth user data structure
    return {
      uid: decoded.sub,
      email: decoded.email || null,
      name: decoded.name || null,
      picture: decoded.picture || null,
      email_verified: decoded.email_verified || false
    };
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Failed to verify authentication token');
  }
};

export { auth };