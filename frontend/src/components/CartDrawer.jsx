import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, subtotal, itemCount, isOpen, setIsOpen } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-dvh w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-deli-red text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold">Your Cart</h2>
            <p className="text-red-200 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-red-200 hover:text-white text-2xl leading-none">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🛒</p>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add something delicious!</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.cartId} className="bg-deli-cream rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-deli-brown">{item.name}</p>
                    <p className="text-gray-500 text-sm">{item.bread}</p>

                    {item.removedIngredients.length > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        Remove: {item.removedIngredients.join(', ')}
                      </p>
                    )}
                    {item.addedExtras.length > 0 && (
                      <p className="text-xs text-deli-green mt-0.5">
                        Add: {item.addedExtras.join(', ')}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-xs text-gray-500 mt-0.5 italic">"{item.note}"</p>
                    )}
                  </div>
                  <p className="font-bold text-deli-red ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      className="w-7 h-7 rounded bg-deli-cream-dark text-deli-red font-bold hover:bg-deli-cream transition-colors"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="w-7 h-7 rounded bg-deli-cream-dark text-deli-red font-bold hover:bg-deli-cream transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartId)}
                    className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-deli-cream-dark p-4 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal ({itemCount} items)</span>
              <span className="font-bold text-xl text-deli-brown">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-gray-400 text-xs">Tax calculated at pickup</p>
            <button onClick={handleCheckout} className="btn-primary w-full py-3 text-base">
              Place Order →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
