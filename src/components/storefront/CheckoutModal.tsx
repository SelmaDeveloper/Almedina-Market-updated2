import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FulfillmentType, PaymentMethod, DeliveryLocation } from '../../types';
import { ALMADINA_SHOP_LOCATION } from '../../data/mockData';
import { calculateDistanceKm, calculateDeliveryFeeETB, formatETB } from '../../utils/distance';
import { X, Truck, Store, MapPin, CreditCard, DollarSign, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, ShieldCheck, Navigation } from 'lucide-react';
import { BRAND } from '../../constants/brand';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, createOrder, currentUser, setViewTab, saveAddress } = useApp();

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | 'detect'>('new');
  const [customAddressText, setCustomAddressText] = useState('');
  const [landmarkText, setLandmarkText] = useState('');
  const [latitude, setLatitude] = useState(8.98);
  const [longitude, setLongitude] = useState(38.71);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState(calculateDistanceKm(8.98, 38.71));

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.priceETB * item.quantity, 0);
  const isOutOfRange = fulfillmentType === 'delivery' && distanceKm > ALMADINA_SHOP_LOCATION.maxDeliveryDistanceKm;
  const isMinSubtotalNotMet = fulfillmentType === 'delivery' && subtotal < ALMADINA_SHOP_LOCATION.minDeliverySubtotalETB;
  const deliveryFee = fulfillmentType === 'delivery' && !isOutOfRange ? calculateDeliveryFeeETB(distanceKm) : 0;
  const total = subtotal + deliveryFee;

  const handleSelectAddress = (addressId: string | 'new' | 'detect') => {
    setSelectedAddressId(addressId);
    setErrorMessage(null);

    if (addressId === 'new') {
      setCustomAddressText('');
      setLandmarkText('');
      setAddressLabel('Home');
      setLatitude(8.98);
      setLongitude(38.71);
      setDistanceKm(calculateDistanceKm(8.98, 38.71));
    } else if (addressId === 'detect') {
      handleDetectGPS();
    } else {
      const saved = currentUser?.savedAddresses?.find((a) => a.id === addressId);
      if (saved) {
        setCustomAddressText(saved.addressText);
        setLatitude(saved.latitude);
        setLongitude(saved.longitude);
        const dist = calculateDistanceKm(saved.latitude, saved.longitude);
        setDistanceKm(dist);
        setAddressLabel(saved.label);
        setLandmarkText('');
      }
    }
  };

  const handleDetectGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat);
          setLongitude(lng);
          const dist = calculateDistanceKm(lat, lng);
          setDistanceKm(dist);
          setCustomAddressText(`📍 GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setAddressLabel('Detected Location');
          setGpsLoading(false);
        },
        () => {
          setErrorMessage('Unable to access your location. Please enable GPS in your browser settings.');
          setGpsLoading(false);
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
      setGpsLoading(false);
    }
  };

  const handleSaveLocation = () => {
    if (!addressLabel.trim() || !customAddressText.trim()) {
      setErrorMessage('Please enter both label and address before saving.');
      return;
    }

    const isDuplicate = (currentUser?.savedAddresses || []).some(
      (addr) => Math.abs(addr.latitude - latitude) < 0.001 && Math.abs(addr.longitude - longitude) < 0.001
    );

    if (isDuplicate) {
      setErrorMessage('This location is already saved. Select it from the dropdown instead.');
      return;
    }

    saveAddress({
      label: addressLabel.trim(),
      addressText: customAddressText.trim(),
      latitude,
      longitude,
      distanceKm,
    });

    setErrorMessage(null);
    setAddressLabel('Home');
    setCustomAddressText('');
    setLandmarkText('');
    setSelectedAddressId('new');
  };

  const handleSubmitOrder = () => {
    setErrorMessage(null);

    const deliveryLoc: DeliveryLocation | undefined =
      fulfillmentType === 'delivery'
        ? { addressText: customAddressText, landmark: landmarkText, latitude, longitude, distanceKm }
        : undefined;

    const result = createOrder({ fulfillmentType, deliveryLocation: deliveryLoc, paymentMethod, notes: orderNotes });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    if (result.requiresChapaRedirect) {
      onClose();
      setViewTab('chapa_gateway_sim');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {BRAND.name} Checkout
            </h2>
            <p className="text-xs text-emerald-300">Bethel, Addis Ababa • Order Finalization</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Notice</p>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
            <div>
              <p className="text-slate-400 text-[11px] font-medium">Customer</p>
              <p className="font-bold text-slate-900">{currentUser?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[11px] font-medium">Phone 🇪🇹</p>
              <p className="font-bold text-slate-900">{currentUser?.phoneNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">1. Select Delivery Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setFulfillmentType('pickup'); if (paymentMethod === 'cod') setPaymentMethod('cop'); }}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${fulfillmentType === 'pickup' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between">
                  <Store className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Free (0 ETB)</span>
                </div>
                <div className="mt-2">
                  <p className="font-bold text-xs">Pickup</p>
                  <p className="text-[11px] text-slate-500">Pick up at Bethel shop • No minimum</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setFulfillmentType('delivery'); if (paymentMethod === 'cop') setPaymentMethod('cod'); }}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${fulfillmentType === 'delivery' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Within 6.0 km</span>
                </div>
                <div className="mt-2">
                  <p className="font-bold text-xs">Delivery</p>
                  <p className="text-[11px] text-slate-500">Min 1,000 ETB • Distance Fee</p>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Location */}
          {fulfillmentType === 'delivery' ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  2. Saved Delivery Locations
                </label>
              </div>

              {/* Saved Addresses Dropdown */}
              {(currentUser?.savedAddresses || []).length > 0 && (
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleSelectAddress(e.target.value as string | 'new' | 'detect')}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="new">➕ Use a New Location</option>
                  <option value="detect">📍 Detect My Current Location</option>
                  <optgroup label="Saved Addresses">
                    {(currentUser?.savedAddresses || []).map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} • {addr.addressText.substring(0, 30)}... ({addr.distanceKm.toFixed(1)} km)
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}

              {/* GPS Detection Button */}
              {(currentUser?.savedAddresses || []).length === 0 && selectedAddressId !== 'detect' && (
                <button
                  type="button"
                  onClick={() => handleSelectAddress('detect')}
                  disabled={gpsLoading}
                  className="w-full text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-2 bg-white px-3 py-2.5 rounded-lg border border-slate-300 disabled:opacity-50 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  {gpsLoading ? 'Detecting Location...' : 'Detect My Current Location'}
                </button>
              )}

              {/* Save/Edit Address Form */}
              {(selectedAddressId === 'new' || selectedAddressId === 'detect') && (
                <div className="space-y-3 bg-white p-3.5 rounded-lg border border-emerald-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Location Label</label>
                      <input
                        type="text"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        placeholder="e.g., Home, Work, Moms House"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Distance (km)</label>
                      <input
                        type="text"
                        value={distanceKm.toFixed(2)}
                        readOnly
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Street Address</label>
                    <textarea
                      value={customAddressText}
                      onChange={(e) => setCustomAddressText(e.target.value)}
                      placeholder="Street, house number, area name"
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmarkText}
                      onChange={(e) => setLandmarkText(e.target.value)}
                      placeholder="e.g., Near church, behind school, near gate"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveLocation}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-2 text-xs font-semibold transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Save This Location
                  </button>
                </div>
              )}

              {/* Distance & Fee Display */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  isOutOfRange ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                }`}
              >
                <div>
                  <p className="font-bold">Distance: <span className="text-sm">{distanceKm.toFixed(2)} km</span></p>
                  {isOutOfRange
                    ? <p className="text-[11px] text-rose-700 font-semibold mt-0.5">❌ Delivery Unavailable - Beyond 6 km</p>
                    : <p className="text-[11px] text-emerald-700 font-medium mt-0.5">✓ Delivery Available • Fee: {formatETB(deliveryFee)}</p>
                  }
                </div>
                {isOutOfRange && (
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm shrink-0 transition-colors"
                  >
                    Switch to Pickup
                  </button>
                )}
              </div>

              {isMinSubtotalNotMet && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p><strong>Minimum 1,000 ETB required for delivery.</strong> Add {formatETB(1000 - subtotal)} more to qualify.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Store className="w-4 h-4 text-amber-600" />
                Store Pickup
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                📍 <strong>{ALMADINA_SHOP_LOCATION.address}</strong> | No minimum order | Free pickup
              </p>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">3. Select Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fulfillmentType === 'delivery' ? (
                <button type="button" onClick={() => setPaymentMethod('cod')} className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${paymentMethod === 'cod' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <DollarSign className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div><p className="font-bold text-xs text-slate-900">💵 Cash</p><p className="text-[11px] text-slate-500">Cash on Delivery (COD)</p></div>
                </button>
              ) : (
                <button type="button" onClick={() => setPaymentMethod('cop')} className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${paymentMethod === 'cop' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <DollarSign className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div><p className="font-bold text-xs text-slate-900">💵 Cash</p><p className="text-[11px] text-slate-500">Cash on Pickup (COP)</p></div>
                </button>
              )}

              <button type="button" onClick={() => setPaymentMethod('telebirr')} className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${paymentMethod === 'telebirr' || paymentMethod === 'cbe_birr' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <CreditCard className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div><p className="font-bold text-xs text-slate-900">🏦 Online</p><p className="text-[11px] text-slate-500">Telebirr & CBE Birr via Chapa</p></div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Delivery Instructions (Optional)</label>
            <textarea rows={2} placeholder="e.g., Please call at entrance..." value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Product Subtotal</span>
              <span className="font-bold text-slate-900">{formatETB(subtotal)}</span>
            </div>
            {fulfillmentType === 'delivery' && deliveryFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">{formatETB(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 text-sm pt-2 border-t border-slate-200">
              <span className="font-extrabold">Grand Total</span>
              <span className="font-extrabold text-emerald-700">{formatETB(total)}</span>
            </div>
          </div>

          <button
            disabled={isOutOfRange || isMinSubtotalNotMet}
            onClick={handleSubmitOrder}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px] ${isOutOfRange || isMinSubtotalNotMet ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800 text-white'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {paymentMethod === 'telebirr' || paymentMethod === 'cbe_birr'
                ? `Pay Online • ${formatETB(total)}`
                : `Place Order • ${formatETB(total)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

