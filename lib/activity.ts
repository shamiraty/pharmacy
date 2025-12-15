import { getCurrentUserId } from './auth';

export async function logActivity(action: string, details: string = '') {
  const userId = getCurrentUserId();

  if (!userId) return;

  try {
    await fetch('/api/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        action,
        details,
      }),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
