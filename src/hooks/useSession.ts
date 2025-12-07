import { useContext } from 'react';
import { SessionContext } from '@/providers/SessionContextProvider';

/**
 * Hook to access session context
 * 
 * Provides access to user session, profile, role, and authentication state.
 * Must be used within a SessionProvider.
 * 
 * @returns Session context containing user session, profile, role, and methods
 * @throws Error if used outside SessionProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, userProfile, userRole, isLoading } = useSession();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!session) return <div>Not authenticated</div>;
 *   
 *   return <div>Hello {userProfile?.first_name}</div>;
 * }
 * ```
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
