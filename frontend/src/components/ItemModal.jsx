import { useState, useEffect } from 'react';
import { EXTRA_TOPPINGS } from '../data/menu';
import { useCart } from '../context/CartContext';

export default function ItemModal({ item, onClose }) {
  const { addItem } = useCart();
  const [included, setIncluded] = useState(new Set(item.ingredients));
  const [extras, setExtras] = useState(new Set());
  const [bread, setBread] = useState(item.breadOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleIngredient = (ing) => {
    setIncluded(prev => {
      const next = new Set(prev);
      if (next.has(ing)) next.delete(ing);
      else next.add(ing);
      return next;
    });
  };

  const toggleExtra = (extra) => {
    setExtras(prev => {
      const next = new Set(prev);
      if (next.has(extra)) next.delete(extra);
      else next.add(extra);
      return next;
    });
  };

  const handleAdd = () => {
    addItem(item, {
      bread,
      includedIngredients: [...included],
      addedExtras: [...extras],
      quantity,
      note,
    });
    onClose();
  };

  const total = (item.price * quantity).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-animate"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-deli-red text-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-2xl font-bold">{item.name}</h2>
              {item.subtitle && <p className="text-red-200 text-sm mt-0.5">{item.subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-red-200 hover:text-white text-2xl leading-none ml-4">✕</button>
          </div>
          <p className="text-red-100 text-sm mt-2">{item.description}</p>
          {item.note && <p className="text-yellow-200 text-xs mt-1 italic">{item.note}</p>}
        </div>

        <div className="p-5 space-y-5">
          {/* Bread choice */}
          {item.breadOptions.length > 1 && (
            <div>
              <h3 className="font-semibold text-deli-brown mb-2">Choose your bread</h3>
              <div className="flex flex-wrap gap-2">
                {item.breadOptions.map(b => (
                  <button
                    key={b}
                    onClick={() => setBread(b)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      bread === b
                        ? 'border-deli-red bg-deli-red text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-deli-red'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients (toggle to remove) */}
          <div>
            <h3 className="font-semibold text-deli-brown mb-1">Ingredients</h3>
            <p className="text-gray-400 text-xs mb-2">Tap to remove</p>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map(ing => (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`chip ${included.has(ing) ? 'chip-active' : 'chip-inactive'}`}
                >
                  {included.has(ing) ? '✓ ' : '✕ '}{ing}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <h3 className="font-semibold text-deli-brown mb-1">Add extras</h3>
            <p className="text-gray-400 text-xs mb-2">Tap to add</p>
            <div className="flex flex-wrap gap-2">
              {EXTRA_TOPPINGS
                .filter(e => !item.ingredients.includes(e))
                .map(extra => (
                  <button
                    key={extra}
                    onClick={() => toggleExtra(extra)}
                    className={`chip ${extras.has(extra) ? 'chip-extra-active' : 'chip-extra'}`}
                  >
                    {extras.has(extra) ? '✓ ' : '+ '}{extra}
                  </button>
                ))}
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <h3 className="font-semibold text-deli-brown mb-1">Special instructions</h3>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Any special requests? (optional)"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-deli-red"
              rows={2}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-deli-brown">Quantity</h3>
            <div className="flex items-center gap-3 bg-deli-cream rounded-lg p-1">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-md bg-white shadow-sm text-deli-red font-bold text-lg hover:bg-deli-cream-dark transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center font-bold text-deli-brown">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-md bg-white shadow-sm text-deli-red font-bold text-lg hover:bg-deli-cream-dark transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0">
          <button onClick={handleAdd} className="btn-primary w-full text-base py-3">
            Add to Cart — ${total}
          </button>
        </div>
      </div>
    </div>
  );
}
