import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config/api";

const CartContext = createContext();

const RESUMEN_VACIO = {
  items: [],
  combos: [],
  subtotal: 0,
  descuento: 0,
  total: 0,
};

function getStorageKey(userId) {
  return userId ? `gota_cart_${userId}` : "gota_cart_guest";
}

function leerCarritoGuardado(storageKey) {
  try {
    const saved = localStorage.getItem(storageKey);
    const items = saved ? JSON.parse(saved) : [];
    // Descarta líneas antiguas que no tengan variante
    return items.filter((item) => item && item.variante_id);
  } catch (error) {
    console.error("Error al leer el carrito guardado:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const { auth } = useAuth();
  const userId = auth?.usuario?.id || null;

  const [cart, setCart] = useState(() =>
    leerCarritoGuardado(getStorageKey(userId))
  );
  const [resumen, setResumen] = useState(RESUMEN_VACIO);
  const [errorCarrito, setErrorCarrito] = useState("");

  useEffect(() => {
    setCart(leerCarritoGuardado(getStorageKey(userId)));
  }, [userId]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(cart));
    } catch (error) {
      console.error("Error al guardar el carrito:", error);
    }
  }, [cart, userId]);

  // Pide al servidor el cálculo del carrito (precios, promos y combos)
  useEffect(() => {
    if (cart.length === 0) {
      setResumen(RESUMEN_VACIO);
      setErrorCarrito("");
      return;
    }

    const items = cart.map(({ variante_id, cantidad }) => ({
      variante_id,
      cantidad,
    }));

    async function calcular() {
      try {
        const respuesta = await fetch(`${API_URL}/carrito/calcular`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        const texto = await respuesta.text();
        let datos;

        try {
          datos = JSON.parse(texto);
        } catch {
          throw new Error(
            `${respuesta.status}: el servidor devolvió HTML en vez de JSON. Revisa la ruta ${API_URL}/carrito/calcular`
          );
        }

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || `Error ${respuesta.status}`);
        }

        setResumen(datos);
        setErrorCarrito("");
      } catch (err) {
        setErrorCarrito(err.message);
      }
    }

    calcular();
  }, [cart]);

  // Agrega varias presentaciones de una vez (combos y promociones)
  const agregarPromo = (items) => {
    setCart((actual) => {
      const nuevo = [...actual];

      for (const it of items) {
        const i = nuevo.findIndex((x) => x.variante_id === it.variante_id);

        if (i >= 0) {
          nuevo[i] = { ...nuevo[i], cantidad: nuevo[i].cantidad + it.cantidad };
        } else {
          nuevo.push({
            variante_id: it.variante_id,
            nombre: it.nombre,
            tipo: it.tipo,
            tamano_ml: it.tamano_ml,
            cantidad: it.cantidad,
          });
        }
      }

      return nuevo;
    });
  };

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.variante_id === product.variante_id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.variante_id === product.variante_id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (varianteId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.variante_id !== varianteId)
    );
  };

  const updateQuantity = (varianteId, cantidad) => {
    if (cantidad < 1) {
      removeFromCart(varianteId);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.variante_id === varianteId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        resumen,
        errorCarrito,
        total: resumen.total,
        cartCount,
        addToCart,
        agregarPromo,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}