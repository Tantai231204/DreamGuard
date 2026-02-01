import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { BreadcrumbProvider } from "./components/common/breadcrumb/BreadcrumbContext";
import { CartProvider } from "./store/cartStore";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <BreadcrumbProvider>
            <AppRouter />
          </BreadcrumbProvider>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

