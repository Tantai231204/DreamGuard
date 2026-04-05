import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { BreadcrumbProvider } from "./components/common/BreadcrumbNav"; // Renamed to index.ts
import { CartAnimationProvider } from "./store/cartAnimationStore";
import { ErrorBoundary } from "./components/common";
import { Toaster } from "./components/ui/toaster";
import AppRouter from "./router/AppRouter";

import { useEffect, useRef } from "react";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/useCart";
import { isStaffRole, isAdminRole } from "./lib/role";

function App() {
  const { isAuthenticated, role } = useAuthStore();
  const prevAuth = useRef(isAuthenticated);
  const shouldSkipCart = isStaffRole(role) || isAdminRole(role);

  useEffect(() => {
    // 1. Just Logged Out: Wipe state for privacy
    if (!isAuthenticated && prevAuth.current) {
      useCartStore.getState().resetLocalCart();
      prevAuth.current = isAuthenticated;
      return;
    }

    // 2. Staff/Admin: Skip cart logic
    if (shouldSkipCart) {
      prevAuth.current = isAuthenticated;
      return;
    }

    // 3. Global Sync Function
    const refreshCart = () => {
      const state = useCartStore.getState();
      const { isAuthenticated: isAuth } = useAuthStore.getState();
      
      if (!isAuth) return;

      const hasGuestItems = state.cart.some(i => i.id.startsWith('l_') || i.id.startsWith('c_'));
      if (hasGuestItems) {
        state.syncWithServer();
      } else {
        state.fetchCart();
      }
    };

    // 4. Auth Transition Sync
    if (isAuthenticated !== prevAuth.current) {
      if (isAuthenticated) refreshCart();
      prevAuth.current = isAuthenticated;
    }

    // 5. Keep-Alive Sync (Focus/Visibility)
    if (isAuthenticated) {
      const handleSync = () => {
        if (document.visibilityState === 'visible') refreshCart();
      };
      window.addEventListener('focus', handleSync);
      window.addEventListener('visibilitychange', handleSync);
      return () => {
        window.removeEventListener('focus', handleSync);
        window.removeEventListener('visibilitychange', handleSync);
      };
    }
  }, [isAuthenticated, shouldSkipCart]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <CartAnimationProvider>
            <BreadcrumbProvider>
              <AppRouter />
              <Toaster />
            </BreadcrumbProvider>
          </CartAnimationProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

