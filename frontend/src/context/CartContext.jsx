import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

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

  const total = cart.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );

  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}