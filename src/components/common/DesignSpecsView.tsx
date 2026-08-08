import React from 'react';
import {
  MapPin,
  Calculator,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  PhoneCall,
  Smartphone,
  BookOpen,
} from 'lucide-react';

export const DesignSpecsView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in text-slate-800 text-xs">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-2 border border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-black">Almedina Market System Design & SRS Specifications</h1>
        </div>
        <p className="text-xs text-slate-300">
          Formal architectural breakdown and technical business rules for Bethel, Addis Ababa e-commerce operations.
        </p>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Location & Delivery Distance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3>1. Geofence & Haversine Distance Formula</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The store is anchored at Bethel Coordinates: <strong>(8.9806° N, 38.7075° E)</strong>. Maximum allowed delivery radius is strictly <strong>6.0 km</strong>.
          </p>
          <div className="bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] leading-relaxed">
            a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)<br />
            c = 2 ⋅ atan2( √a, √(1−a) )<br />
            d = R ⋅ c (R = 6,371 km)
          </div>
        </div>

        {/* 2. Delivery Fee & Order Minimum */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3>2. Delivery Fee & Minimum Order Rules</h3>
          </div>
          <ul className="space-y-2 text-slate-600 list-disc pl-4">
            <li>
              <strong>Base Fee:</strong> 50 ETB fixed base charge.
            </li>
            <li>
              <strong>Distance Charge:</strong> 15 ETB per kilometer (calculated continuously from store coordinates).
            </li>
            <li>
              <strong>Minimum Subtotal for Delivery:</strong> 1,000 ETB. Orders below this subtotal block checkout and display distance/amount deficit alerts.
            </li>
            <li>
              <strong>Pickup Orders:</strong> Free delivery fee; no minimum subtotal threshold.
            </li>
          </ul>
        </div>

        {/* 3. Confirmation Call Window */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <PhoneCall className="w-5 h-5 text-amber-600" />
            <h3>3. Confirmation Call Operating Window</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Store owner initiates phone calls to customers between <strong>3:00 AM – 9:00 PM local time</strong> prior to preparing orders. Orders placed outside this window remain in <strong>Pending Confirmation</strong> status.
          </p>
        </div>

        {/* 4. Chapa Payment Verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
            <CreditCard className="w-5 h-5 text-cyan-600" />
            <h3>4. Server-Side Chapa Gateway Verification</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            For Telebirr and CBE Birr transactions, browser redirects alone do <strong>NOT</strong> mark orders as PAID. Orders remain <strong>Payment Pending</strong> until server-side webhook verification confirms receipt.
          </p>
        </div>

        {/* 5. Same-Day Return Policy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <RotateCcw className="w-5 h-5 text-rose-600" />
            <h3>5. Same-Day Return & Photo Evidence Policy</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Returns and refunds are permitted <strong>only on the same calendar day</strong> as delivery. All return reports <strong>mandatorily require uploaded photo evidence</strong> (e.g. damaged seal or wrong item).
          </p>
        </div>

        {/* 6. Admin Single Session & 2FA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Smartphone className="w-5 h-5 text-slate-700" />
            <h3>6. Admin Single Active Session & 2FA</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            To prevent concurrent store owner actions, authenticating on a new device automatically invalidates existing active Admin sessions. Two-Factor Authentication (2FA) is enforced.
          </p>
        </div>
      </div>
    </div>
  );
};
