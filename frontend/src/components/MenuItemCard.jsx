export default function MenuItemCard({ item, onSelect }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-deli-cream-dark hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer overflow-hidden flex flex-col"
      onClick={() => onSelect(item)}
    >
      {/* Price banner */}
      <div className="bg-deli-red text-white text-right px-4 py-1.5">
        <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="font-serif font-bold text-deli-brown text-lg leading-tight">{item.name}</h3>
          {item.subtitle && (
            <p className="text-deli-red text-sm font-semibold mt-0.5">{item.subtitle}</p>
          )}
        </div>

        <p className="text-gray-600 text-sm leading-relaxed flex-1">{item.description}</p>

        {item.note && (
          <p className="text-deli-tan text-xs mt-2 italic">{item.note}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {item.breadOptions.map(b => (
            <span key={b} className="text-xs bg-deli-cream-dark text-deli-brown px-2 py-0.5 rounded-full">
              {b}
            </span>
          ))}
        </div>

        <button
          className="mt-4 w-full btn-primary text-sm"
          onClick={(e) => { e.stopPropagation(); onSelect(item); }}
        >
          Customize & Add →
        </button>
      </div>
    </div>
  );
}
