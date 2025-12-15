// Simple session management for client-side
interface UserSession {
  id: number;
  username?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
  loginTime?: number; // Timestamp when user logged in
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function setUserSession(user: UserSession) {
  if (typeof window !== 'undefined') {
    const sessionData = {
      ...user,
      loginTime: Date.now(),
    };
    localStorage.setItem('user_session', JSON.stringify(sessionData));
    // Set cookie for middleware (24 hours)
    document.cookie = `user_session=${JSON.stringify(sessionData)}; path=/; max-age=86400`;
  }
}

export function getUserSession(): UserSession | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('user_session');
    if (!session) return null;

    try {
      const userData: UserSession = JSON.parse(session);

      // Check if session has expired (24 hours)
      if (userData.loginTime) {
        const currentTime = Date.now();
        const sessionAge = currentTime - userData.loginTime;

        if (sessionAge > SESSION_DURATION) {
          // Session expired, clear it
          clearUserSession();
          return null;
        }
      }

      return userData;
    } catch {
      return null;
    }
  }
  return null;
}

export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_session');
    // Clear cookie
    document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}

export function isSessionValid(): boolean {
  return getUserSession() !== null;
}

export function isAdmin(): boolean {
  const user = getUserSession();
  return user?.role === 'admin';
}

export function getCurrentUserId(): number | null {
  const user = getUserSession();
  return user?.id || null;
}

// Check session on interval and redirect to login if expired
export function setupSessionChecker(router: any) {
  if (typeof window !== 'undefined') {
    const checkInterval = setInterval(() => {
      if (!isSessionValid()) {
        clearInterval(checkInterval);
        router.push('/login');
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }
}
