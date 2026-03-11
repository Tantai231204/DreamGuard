import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { BreadcrumbProvider } from "./components/common/breadcrumb/BreadcrumbContext";
import { CartAnimationProvider } from "./store/cartAnimationStore";
import { ErrorBoundary } from "./components/common";
import { Toaster } from "./components/ui/toaster";
import AppRouter from "./router/AppRouter";

function App() {
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

