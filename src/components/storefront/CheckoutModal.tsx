import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FulfillmentType, PaymentMethod, DeliveryLocation } from '../../types';
import { ALMADINA_SHOP_LOCATION } from '../../data/mockData';
import { calculateDistanceKm, calculateDeliveryFeeETB, formatETB } from '../../utils/distance';
import { X, Truck, Store, MapPin, CreditCard, DollarSign, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, ShieldCheck, Phone, Navigation } from 'lucide-react';
import { BRAND } from '../../constants/brand';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOCATIONS = [
  {
    label: 'Bethel Block 4 (Near Shop - 2.1 km)',
    addressText: 'Bethel Block 4, Near Commercial Bank of Ethiopia',
    latitude: 8.9850,
    longitude: 38.7110,
    landmark: 'Behind Total Station',
  },
  {
    label: 'Keraniyo Hillside (Bethel West - 3.8 km)',
    addressText: 'Keraniyo Hillside, Bethel West',
    latitude: 8.9790,
    longitude: 38.6920,
    landmark: 'Near St. George Church',
  },
  {
    label: 'Bethel Border (Exact 6.0 km Boundary)',
    addressText: 'Bethel 6km Perimeter Gate',
    latitude: 8.9833,
    longitude: 38.7623,
    landmark: 'Ring Road Junction',
  },
  {
    label: 'Bole Medhanealem (Out of Range - 11.2 km)',
    addressText: 'Bole Medhanealem, Addis Ababa',
    latitude: 8.9950,
    longitude: 38.7880,
    landmark: 'Near Bole Mall',
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, createOrder, currentUser, setViewTab } = useApp();

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customAddressText, setCustomAddressText] = useState(PRESET_LOCATIONS[0].addressText);
  const [landmarkText, setLandmarkText] = useState(PRESET_LOCATIONS[0].landmark);
  const [latitude, setLatitude] = useState(PRESET_LOCATIONS[0].latitude);
  const [longitude, setLongitude] = useState(PRESET_LOCATIONS[0].longitude);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.priceETB * item.quantity, 0);
  const distanceKm = calculateDistanceKm(latitude, longitude);
  const isOutOfRange = fulfillmentType === 'delivery' && distanceKm > ALMADINA_SHOP_LOCATION.maxDeliveryDistanceKm;
  const isMinSubtotalNotMet = fulfillmentType === 'delivery' && subtotal < ALMADINA_SHOP_LOCATION.minDeliverySubtotalETB;
  const deliveryFee = fulfillmentType === 'delivery' && !isOutOfRange ? calculateDeliveryFeeETB(distanceKm) : 0;
  const total = subtotal + deliveryFee;

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const loc = PRESET_LOCATIONS[index];
    setCustomAddressText(loc.addressText);
    setLandmarkText(loc.landmark);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setErrorMessage(null);
  };

  const handleSimulateGPS = () => {
    setLatitude(8.9840);
    setLongitude(38.7180);
    setCustomAddressText('Current GPS Location (Bethel Market Zone, 1.5 km)');
    setLandmarkText('Near Bethel Roundabout');
    setSelectedPresetIndex(-1);
    setErrorMessage(null);
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
                <p className="font-bold">Business Rule Conflict</p>
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
              <p className="text-slate-400 text-[11px] font-medium">Phone</p>
              <p className="font-bold text-slate-900">{currentUser?.phoneNumber}</p>
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
                  2. Delivery Address
                </label>
                <button type="button" onClick={handleSimulateGPS} className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-300">
                  <Navigation className="w-3 h-3 text-emerald-600" />Detect GPS Location
                </button>
              </div>

              <select
                value={selectedPresetIndex}
                onChange={(e) => handleSelectPreset(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={idx}>{loc.label}</option>
                ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600">Address Text</label>
                  <input type="text" value={customAddressText} onChange={(e) => setCustomAddressText(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600">Nearest Landmark</label>
                  <input type="text" value={landmarkText} onChange={(e) => setLandmarkText(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${isOutOfRange ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'}`}>
                <div>
                  <p className="font-bold">Distance: <span className="text-sm">{distanceKm} km</span></p>
                  {isOutOfRange
                    ? <p className="text-[11px] text-rose-700 font-semibold mt-0.5">Sorry, we currently deliver only within 6 km of Bethel.</p>
                    : <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Within 6.0 km zone • Fee: {formatETB(deliveryFee)}</p>
                  }
                </div>
                {isOutOfRange && (
                  <button type="button" onClick={() => setFulfillmentType('pickup')} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm shrink-0">
                    Switch to Pickup
                  </button>
                )}
              </div>

              {isMinSubtotalNotMet && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p><strong>Minimum 1,000 ETB required for delivery.</strong> Add {formatETB(1000 - subtotal)} more or switch to Pickup.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Store className="w-4 h-4 text-amber-600" />Shop Pickup Information
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Pickup address: <strong>{ALMADINA_SHOP_LOCATION.address}</strong>. No minimum order required.
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
                  <div><p className="font-bold text-xs text-slate-900">Cash</p><p className="text-[11px] text-slate-500">Cash on Delivery (COD)</p></div>
                </button>
              ) : (
                <button type="button" onClick={() => setPaymentMethod('cop')} className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${paymentMethod === 'cop' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <DollarSign className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div><p className="font-bold text-xs text-slate-900">Cash</p><p className="text-[11px] text-slate-500">Cash on Pickup (COP)</p></div>
                </button>
              )}

              <button type="button" onClick={() => setPaymentMethod('telebirr')} className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${paymentMethod === 'telebirr' || paymentMethod === 'cbe_birr' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <CreditCard className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div><p className="font-bold text-xs text-slate-900">Online Payment</p><p className="text-[11px] text-slate-500">Telebirr & CBE Birr (Chapa Portal)</p></div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Delivery / Order Instructions (Optional)</label>
            <textarea rows={2} placeholder="e.g. Please call when reaching Bethel roundabout..." value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Product total</span>
              <span className="font-bold text-slate-900">{formatETB(subtotal)}</span>
            </div>
            {fulfillmentType === 'delivery' && (
              <div className="flex justify-between text-slate-600">
                <span>Delivery fee</span>
                <span className="font-bold text-slate-900">{formatETB(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 text-sm pt-1 border-t border-slate-200">
              <span className="font-extrabold">Grand total</span>
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
                ? `Proceed to Online Payment • ${formatETB(total)}`
                : `Submit Order (Cash) • ${formatETB(total)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
