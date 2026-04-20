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
      
      console.log(`[App] refreshCart triggered. Auth: ${isAuth}, Has state: ${!!state}`);
      if (!isAuth) return;

      const hasGuestItems = state.cart.some(i => i.id.startsWith('l_') || i.id.startsWith('c_'));
      console.log(`[App] hasGuestItems: ${hasGuestItems}`);
      
      if (hasGuestItems) {
        state.syncWithServer();
      } else {
        state.fetchCart();
      }
    };

    // 4. Auth Transition Sync
    if (isAuthenticated !== prevAuth.current) {
      console.log(`[App] Auth transition detected: ${prevAuth.current} -> ${isAuthenticated}`);
      if (isAuthenticated) refreshCart();
      prevAuth.current = isAuthenticated;
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

