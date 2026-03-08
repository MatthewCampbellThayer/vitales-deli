import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

// Vitale's tree logo — Italian roots (green/white/red) + American canopy (red/white/blue)
function VitalesLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Tree trunk */}
      <rect x="46" y="55" width="8" height="20" fill="#8B6914" />
      {/* Italian roots — green, white, red */}
      <ellipse cx="38" cy="76" rx="10" ry="5" fill="#006400" />
      <ellipse cx="50" cy="80" rx="10" ry="5" fill="#f0f0f0" />
      <ellipse cx="62" cy="76" rx="10" ry="5" fill="#8B1A1A" />
      {/* American canopy — red, white, blue */}
      <circle cx="40" cy="35" r="18" fill="#002868" />
      <circle cx="60" cy="35" r="18" fill="#8B1A1A" />
      <circle cx="50" cy="22" r="18" fill="#f0f0f0" />
      <circle cx="50" cy="38" r="20" fill="#002868" opacity="0.85" />
      <circle cx="50" cy="32" r="16" fill="#8B1A1A" opacity="0.8" />
      <circle cx="50" cy="28" r="11" fill="#f0f0f0" opacity="0.9" />
    </svg>
  );
}

export default function Header() {
  const { itemCount, subtotal, setIsOpen } = useCart();

  return (
    <header className="bg-deli-olive shadow-xl sticky top-0 z-40 border-b-2 border-deli-tan">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 flex-shrink-0">
            <img
              src="https://images.squarespace-cdn.com/content/v1/5627d9c0e4b0ee82950b3909/1445454242717-8CCZ5SSM8U1HBVDKK4DQ/pacific-dark.png"
              alt="Vitale's Deli"
              className="w-12 h-12 object-contain"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div>
            <h1 className="font-serif text-white text-xl font-bold leading-tight tracking-wide group-hover:text-deli-tan transition-colors">
              Vitale's Deli
            </h1>
            <p className="text-green-300 text-xs tracking-widest uppercase">Classic Italian · American</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 bg-deli-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-deli-red-dark transition-colors border border-red-700"
          >
            <span>🛒</span>
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-deli-red text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold border border-deli-red">
                {itemCount}
              </span>
            )}
          </button>

          {itemCount > 0 && (
            <span className="text-white font-semibold text-sm hidden sm:block">
              ${subtotal.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
