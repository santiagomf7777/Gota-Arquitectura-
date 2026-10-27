
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import OrderConfirmation from "./pages/OrderConfirmation";
import Home from "./pages/Home";

import ChatWidget from "./components/ChatWidget";
import Header from "./components/Header";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Inventario from "./admin/Inventario";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Administración */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inventario" element={<Inventario />} />
            </Route>

            {/* Tienda */}
            <Route
              path="/*"
              element={
                <>
                  <Header />

                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/perfumes" element={<Catalog />} />
                    <Route
                      path="/perfumes/:id"
                      element={<ProductDetail />}
                    />
                    <Route path="/carrito" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route
                      path="/pedido-confirmado"
                      element={<OrderConfirmation />}
                    />
                  </Routes>

                  <ChatWidget />
                </>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
