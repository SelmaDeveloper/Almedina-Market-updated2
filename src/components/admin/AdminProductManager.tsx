import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, CategoryId } from '../../types';
import { formatETB } from '../../utils/distance';
import {
  Plus,
  Package,
  Edit2,
  Trash2,
  AlertTriangle,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';

export const AdminProductManager: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('dates_sweets');
  const [priceETB, setPriceETB] = useState<number>(1000);
  const [unit, setUnit] = useState('1 kg Box');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('Saudi Arabia');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600');
  const [stockCount, setStockCount] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [isSaudiImport, setIsSaudiImport] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | 'all'>('all');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingProdId(null);
    setName('');
    setArabicName('');
    setCategoryId('dates_sweets');
    setPriceETB(1000);
    setUnit('1 kg Box');
    setDescription('');
    setOrigin('Saudi Arabia');
    setImage('https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600');
    setStockCount(20);
    setLowStockThreshold(5);
    setIsSaudiImport(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProdId(p.id);
    setName(p.name);
    setArabicName(p.arabicName || '');
    setCategoryId(p.categoryId);
    setPriceETB(p.priceETB);
    setUnit(p.unit);
    setDescription(p.description);
    setOrigin(p.origin);
    setImage(p.image);
    setStockCount(p.stockCount);
    setLowStockThreshold(p.lowStockThreshold);
    setIsSaudiImport(p.isSaudiImport);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const filteredProducts = selectedCategoryFilter === 'all'
    ? products
    : products.filter((p) => p.categoryId === selectedCategoryFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Price validation: Non-negative
    if (priceETB < 0) {
      setErrorMessage('Price cannot be negative.');
      return;
    }

    if (!name || name.trim().length < 3) {
      setErrorMessage('Product name is required (at least 3 characters).');
      return;
    }

    if (editingProdId) {
      updateProduct(editingProdId, {
        name,
        arabicName,
        categoryId,
        priceETB,
        unit,
        description,
        origin,
        image,
        stockCount,
        lowStockThreshold,
        isAvailable: stockCount > 0,
        isSaudiImport,
      });
    } else {
      addProduct({
        name,
        arabicName,
        categoryId,
        priceETB,
        unit,
        description,
        origin,
        image,
        stockCount,
        lowStockThreshold,
        isAvailable: stockCount > 0,
        isSaudiImport,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Inventory & Stock Management</h2>
          <p className="text-xs text-slate-500">
            Create, update, toggle availability, and configure low-stock alerts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Filter by Category</p>
          <p className="text-xs text-slate-500">Focus on one product group at a time.</p>
        </div>
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value as CategoryId | 'all')}
          className="w-full sm:w-56 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5">Product / Category</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5">Price (ETB)</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5">Origin</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((p) => {
                const isLowStock = p.stockCount <= p.lowStockThreshold && p.stockCount > 0;
                const isOutOfStock = p.stockCount <= 0 || !p.isAvailable;
                const catName = categories.find((c) => c.id === p.categoryId)?.name || p.categoryId;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-500">{catName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">{p.unit}</td>

                    <td className="p-3.5 font-extrabold text-slate-900">{formatETB(p.priceETB)}</td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {isOutOfStock ? (
                          'Out of Stock'
                        ) : isLowStock ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Low Stock
                          </>
                        ) : (
                          'In Stock'
                        )}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600">{p.origin}</td>

                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {editingProdId ? 'Edit Product Details' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kingdom Dates - Sukkari"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Arabic Title (Optional)</label>
                  <input
                    type="text"
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                    placeholder="تمر سكري"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Price (ETB) - Non-negative</label>
                  <input
                    type="number"
                    min="0"
                    value={priceETB}
                    onChange={(e) => setPriceETB(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="1 kg Box / 500 g"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Low Stock Threshold Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Origin Country</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Madinah, Saudi Arabia"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
