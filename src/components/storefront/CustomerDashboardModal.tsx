import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatETB, formatDate } from '../../utils/distance';
import { X, UserCircle2, MapPin, Heart, PackageCheck, Settings, Plus, Trash2, Save, Star } from 'lucide-react';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    orders,
    favorites,
    products,
    toggleFavorite,
    updateAccountSettings,
    saveAddress,
    removeAddress,
  } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressText, setAddressText] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressDistance, setAddressDistance] = useState('2.5');

  const customerOrders = useMemo(() => orders.filter((order) => order.userId === currentUser?.id), [orders, currentUser?.id]);
  const favoriteProducts = useMemo(() => products.filter((product) => favorites.includes(product.id)), [products, favorites]);

  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    await updateAccountSettings({ name: name.trim(), phoneNumber: phoneNumber.trim() });
  };

  const handleSaveNewAddress = () => {
    if (!addressText.trim()) return;
    saveAddress({
      label: addressLabel.trim() || 'Saved address',
      addressText: addressText.trim(),
      latitude: 8.98,
      longitude: 38.71,
      distanceKm: Number(addressDistance) || 2.5,
    });
    setAddressText('');
    setLandmark('');
    setAddressDistance('2.5');
    setAddressLabel('Home');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-emerald-400" />Customer Dashboard
            </h2>
            <p className="text-xs text-emerald-300">Manage orders, addresses, favourites, and profile details</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Settings className="w-4 h-4 text-emerald-600" />Account Settings
              </div>
              <div className="space-y-2 text-xs">
                <label className="block text-slate-600">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" />
                <label className="block text-slate-600">Phone number</label>
                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" />
                <button onClick={handleSaveProfile} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-2 font-semibold">Save Settings</button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-emerald-600" />Saved Addresses
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                  <input value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} placeholder="Label" className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs" />
                  <input value={addressText} onChange={(e) => setAddressText(e.target.value)} placeholder="Street / area / house number" className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs" />
                  <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark (optional)" className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs" />
                  <input value={addressDistance} onChange={(e) => setAddressDistance(e.target.value)} placeholder="Distance km" className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs" />
                  <button onClick={handleSaveNewAddress} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2 text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" />Save Address
                  </button>
                </div>

                <div className="space-y-2">
                  {(currentUser?.savedAddresses || []).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500">No saved addresses yet.</div>
                  ) : (
                    (currentUser?.savedAddresses || []).map((address) => (
                      <div key={address.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">{address.label}</p>
                          <p>{address.addressText}</p>
                          <p className="text-slate-500">{address.distanceKm} km • {address.latitude.toFixed(3)}, {address.longitude.toFixed(3)}</p>
                        </div>
                        <button onClick={() => removeAddress(address.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <PackageCheck className="w-4 h-4 text-emerald-600" />Order History
              </div>
              {customerOrders.length === 0 ? (
                <div className="text-xs text-slate-500">No orders yet. Start shopping to see your history here.</div>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{order.orderNumber}</span>
                        <span className="text-emerald-700 font-bold">{formatETB(order.totalETB)}</span>
                      </div>
                      <p className="text-slate-500 mt-1">{formatDate(order.createdAt)} • {order.fulfillmentType}</p>
                      <p className="text-slate-500">Status: {order.orderStatus}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Heart className="w-4 h-4 text-amber-500" />Favorite Products
              </div>
              {favoriteProducts.length === 0 ? (
                <div className="text-xs text-slate-500">Save products you love from the catalog.</div>
              ) : (
                <div className="space-y-2">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-slate-500">{formatETB(product.priceETB)}</p>
                      </div>
                      <button onClick={() => toggleFavorite(product.id)} className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-700 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />Saved
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
