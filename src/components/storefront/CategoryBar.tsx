import React from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryId, Category } from '../../types';
import { Sparkles, Milk, Wheat, Flame, Coffee, UtensilsCrossed, Package, Snowflake, Grid2x2 as Grid } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (catId: CategoryId | 'all') => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, selectedCategory, setSelectedCategory }) => {
  const { products } = useApp();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return Sparkles;
      case 'Milk': return Milk;
      case 'Wheat': return Wheat;
      case 'Flame': return Flame;
      case 'Coffee': return Coffee;
      case 'UtensilsCrossed': return UtensilsCrossed;
      case 'Package': return Package;
      case 'Snowflake': return Snowflake;
      default: return Grid;
    }
  };

  return (
    <div className="my-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <Grid className="w-4 h-4 text-emerald-500" />
          <span>All Items</span>
          <span className="ml-1 bg-slate-200 text-slate-800 text-[10px] px-1.5 rounded-full font-bold">{products.length}</span>
        </button>

        {categories.map((cat) => {
          const IconComponent = getCategoryIcon(cat.iconName);
          const isSelected = selectedCategory === cat.id;
          const count = products.filter((p) => p.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-emerald-600'}`} />
              <div className="text-left leading-tight">
                <p>{cat.name}</p>
                {cat.arabicName && (
                  <p className={`text-[10px] font-normal ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>{cat.arabicName}</p>
                )}
              </div>
              <span className={`ml-1 text-[10px] px-1.5 rounded-full font-bold ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
