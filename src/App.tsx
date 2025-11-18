import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ add this line
// src/App.tsx or your routes file
import ProfilePage from "@/pages/ProfilePage";


import Layout from "./components/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLayout from "@/pages/admin/AdminLayout";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
             <CartProvider>
             {/* ✅ wrap everything below with AuthProvider */}
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<ProductsAdmin />} />
                      <Route path="categories" element={<CategoriesAdmin />} />
                      <Route path="products" element={<ProductsAdmin />} />
                      <Route path="users" element={<UsersAdmin />} />
                      <Route path="orders" element={<OrdersAdmin />} />
                    </Route>
                  </Routes>
                </Layout>
              </BrowserRouter>
              </CartProvider>
            </AuthProvider>
          
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
