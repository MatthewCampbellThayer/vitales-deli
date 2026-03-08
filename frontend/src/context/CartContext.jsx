import { createContext, useContext, useState } from 'react';

function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (menuItem, { bread, includedIngredients, addedExtras, quantity, note }) => {
    const removed = menuItem.ingredients.filter(i => !includedIngredients.includes(i));
    setItems(prev => [
      ...prev,
      {
        cartId: uuidv4(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        subtitle: menuItem.subtitle,
        price: menuItem.price,
        quantity,
        bread,
        includedIngredients,
        removedIngredients: removed,
        addedExtras,
        note,
      },
    ]);
    setIsOpen(true);
  };

  const removeItem = (cartId) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQuantity = (cartId, qty) => {
    if (qty < 1) {
      removeItem(cartId);
      return;
    }
    setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      itemCount,
      isOpen,
      setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
