import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to prevent the browser back button (or swipe gesture) from exiting the app/fullscreen
 * when on a game page. Instead, it redirects to the Dashboard (/app).
 */
export function usePreventBackExit() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 1. Push a "trap" state into the history stack.
    // This makes the current history length +1.
    // When the user swipes back, they "pop" this state, effectively staying on the "same" page URL-wise,
    // but firing the popstate event.
    window.history.pushState({ isGamePageTrap: true }, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // 2. The user swiped back (popped the trap state).
      // We are now technically at the history state *before* the trap.
      // We intercept this and forcefully navigate to the dashboard.
      // Using 'replace: true' helps keep the history cleaner, replacing the "pre-trap" entry with /app.
      // However, wouter's setLocation doesn't expose replace directly in the basic hook, 
      // but we can use navigate logic or just setLocation.
      
      // Prevent any default browser handling if possible (limited efficacy but good practice)
      event.preventDefault();
      
      // Redirect to dashboard
      setLocation('/app', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // Cleanup Logic:
      // If the component is unmounting, we need to decide what to do with our trap state.
      // Case A: Unmounted because popstate fired (User swiped back).
      //         We don't need to do anything, the trap is already popped.
      // Case B: Unmounted because user clicked a Link (e.g., Home button).
      //         The trap state is still the "current" state in history (or previous if Link pushed new).
      //         Ideally, we should remove it to keep history clean, but modifying history during unmount is risky/async.
      //         For now, we accept slight history pollution to ensure stability.
    };
  }, [setLocation]);
}
