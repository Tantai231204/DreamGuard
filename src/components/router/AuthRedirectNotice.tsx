import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';

/**
 * AuthRedirectNotice - Centralized orchestrator to handle auth feedback.
 * 
 * This component acts as a "Subscriber" to both the Router state 
 * and the Auth Store to provide contextual feedback on why a session ended.
 */
export const AuthRedirectNotice = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const logoutReason = useAuthStore(s => s.logoutReason);

    useEffect(() => {
        // Priority 1: Direct reason in Auth Store (e.g. from Interceptor / Session Failure)
        // Priority 2: Reason from Router State (e.g. from Guards / Intentional Redirects)
        const state = location.state as { from?: { pathname: string } | string; reason?: string } | null;
        const currentReason = logoutReason || state?.reason;
        
        if (currentReason) {
            switch (currentReason) {
                case 'unauthenticated':
                    toast.info("Authentication Required", {
                        description: "Please login to access this section.",
                        duration: 4000
                    });
                    break;
                case 'unauthorized':
                    toast.error("Access Denied", {
                        description: "You do not have the necessary permissions to view this page.",
                        duration: 5000
                    });
                    break;
                case 'admin_restricted':
                    toast.warning("Access Restricted", {
                        description: "Administrators are automatically redirected to the Management Dashboard.",
                        duration: 4000
                    });
                    break;
                case 'session_expired':
                    toast.error("Session Expired", {
                        description: "Your session has ended. Please login again to continue.",
                        duration: 5000,
                    });
                    break;
            }

            // Centralized cleanup for BOTH sources
            if (state?.reason) {
                const newState = { ...state };
                delete newState.reason;
                navigate(location.pathname, { replace: true, state: newState });
            }
            
            if (logoutReason) {
                // Clear the store reason to avoid repeated toasts
                // We use useAuthStore.setState for a direct, silent update
                useAuthStore.setState({ logoutReason: null });
            }
        }
    }, [location, navigate, logoutReason]);

    return null;
};
