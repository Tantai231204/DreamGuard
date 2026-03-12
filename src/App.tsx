import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { BreadcrumbProvider } from "./components/common/breadcrumb/BreadcrumbContext";
import { CartAnimationProvider } from "./store/cartAnimationStore";
import { ErrorBoundary } from "./components/common";
import { Toaster } from "./components/ui/toaster";
import AppRouter from "./router/AppRouter";

import { useEffect, useRef } from "react";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/useCart";

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevAuth = useRef(isAuthenticated);

  useEffect(() => {
    // Determine Auth Transition state
    if (isAuthenticated && !prevAuth.current) {
        // Just logged in: merge guest cart
        useCartStore.getState().syncWithServer();
    } else if (!isAuthenticated && prevAuth.current) {
        // Just logged out (explictly or via 401 token expiry): protect user privacy
        useCartStore.getState().resetLocalCart();   
    } else if (isAuthenticated && prevAuth.current) {
        // App mounted while already logged in: fetch fresh cart
        useCartStore.getState().syncWithServer();
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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

