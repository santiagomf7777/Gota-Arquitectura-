import { BrowserRouter, Routes, Route } from "react-router-dom";

import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import OrderConfirmation from "./pages/OrderConfirmation";
import Home from "./pages/Home";
import Pqrs from "./pages/Pqrs";
import Resenas from "./pages/Resenas";

import ChatWidget from "./components/ChatWidget";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Inventario from "./admin/Inventario";
import Productos from "./admin/Productos";
import Proveedores from "./admin/Proveedores";
import Clientes from "./admin/Clientes";
import PaginaPendiente from "./admin/PaginaPendiente";
import Pedidos from "./admin/Pedidos";
import Reportes from "./admin/Reportes";
import Configuracion from "./admin/Configuracion";
import Promociones from "./admin/Promociones";
import QuejasReclamos from "./admin/QuejasReclamos";
import ResenasAdmin from "./admin/Resenas";

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
              <Route path="productos" element={<Productos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="proveedores" element={<Proveedores />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="promociones" element={<Promociones />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="quejas" element={<QuejasReclamos />} />
              <Route path="resenas" element={<ResenasAdmin />} />

              <Route
                path="*"
                element={
                  <PaginaPendiente
                    titulo="Página no encontrada"
                    texto="Esa sección no existe en el panel."
                  />
                }
              />
            </Route>

            {/* Tienda */}
            <Route
              path="/*"
              element={
                <div className="tienda-shell">
                  <Header />

                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/perfumes" element={<Catalog />} />
                    <Route path="/perfumes/:id" element={<ProductDetail />} />
                    <Route path="/carrito" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
                    <Route path="/pqrs" element={<Pqrs />} />
                    <Route path="/resenas" element={<Resenas />} />
                  </Routes>

                  <ChatWidget />
                  <Footer />
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;