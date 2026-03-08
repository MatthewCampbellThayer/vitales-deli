import { useState } from 'react';
import { MENU_ITEMS } from '../data/menu';
import MenuItemCard from '../components/MenuItemCard';
import ItemModal from '../components/ItemModal';

export default function MenuPage() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl font-bold text-deli-brown mb-2">Our Menu</h2>
        <p className="text-gray-500 text-lg">Fresh-baked Vitale's bread · Boar's Head premium deli meat</p>
        <p className="text-gray-400 text-sm mt-1">All sandwiches made to order — pickup only</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-deli-tan opacity-40" />
        <span className="text-deli-tan text-xl">🥖</span>
        <div className="flex-1 h-px bg-deli-tan opacity-40" />
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MENU_ITEMS.map(item => (
          <MenuItemCard key={item.id} item={item} onSelect={setSelectedItem} />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-gray-400 text-sm mt-10">
        Prices shown are before tax · Pay at pickup
      </p>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
