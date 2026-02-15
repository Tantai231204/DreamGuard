import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { BreadcrumbProvider } from "./components/common/breadcrumb/BreadcrumbContext";
import { CartProvider } from "./store/cartStore";
import { CartAnimationProvider } from "./store/cartAnimationStore";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <CartAnimationProvider>
            <BreadcrumbProvider>
              <AppRouter />
            </BreadcrumbProvider>
          </CartAnimationProvider>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

