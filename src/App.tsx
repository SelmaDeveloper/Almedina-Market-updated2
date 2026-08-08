import React, { useState, useMemo, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { DesignSpecsView } from './components/common/DesignSpecsView';

// Storefront
import { Header } from './components/storefront/Header';
import { CategoryBar } from './components/storefront/CategoryBar';
import { HeroBanner } from './components/storefront/HeroBanner';
import { ProductCard } from './components/storefront/ProductCard';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { OrderTrackingModal } from './components/storefront/OrderTrackingModal';
import { ReturnReportModal } from './components/storefront/ReturnReportModal';
import { ReviewSubmissionModal } from './components/storefront/ReviewSubmissionModal';
import { AuthModal } from './components/storefront/AuthModal';
import { ChapaPaymentSimulator } from './components/storefront/ChapaPaymentSimulator';
import { CustomerDashboardModal } from './components/storefront/CustomerDashboardModal';

// Admin
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminSidebar, AdminTab } from './components/admin/AdminSidebar';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminOrderManager } from './components/admin/AdminOrderManager';
import { AdminPaymentManager } from './components/admin/AdminPaymentManager';
import { AdminProductManager } from './components/admin/AdminProductManager';
import { AdminReviewModerator } from './components/admin/AdminReviewModerator';
import { AdminReturnsManager } from './components/admin/AdminReturnsManager';
import { AdminFAQContactManager } from './components/admin/AdminFAQContactManager';
import { AdminReportsManager } from './components/admin/AdminReportsManager';

import { Logo } from './components/common/Logo';
import { BRAND } from './constants/brand';
import { CategoryId, Product, Order } from './types';
import { X, Circle as HelpCircle, Info, Mail, Send, Phone, MapPin, Clock, Heart, ListOrdered, Plus, Trash2, Pencil, Check, Minus } from 'lucide-react';

// ─── Simple hash-based "router" ──────────────────────────────────────────────
// Supports: '' | '/' → storefront, '#/admin' or '#/admin/login' → admin login
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

// ─── Protected Admin Shell ───────────────────────────────────────────────────
const AdminShell: React.FC = () => {
  const { adminSession, setViewTab, simulateAdminLoginOnOtherDevice, logoutAdmin } = useApp();
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Not fully authenticated → show the login page
  if (!adminSession.isLoggedIn || !adminSession.is2FAVerified) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F0]">
      <AdminSidebar activeTab={adminTab} setActiveTab={setAdminTab} />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {adminTab === 'overview' && <AdminOverview onNavigate={(tab) => setAdminTab(tab)} />}
        {adminTab === 'orders' && <AdminOrderManager />}
        {adminTab === 'payments' && <AdminPaymentManager />}
        {adminTab === 'products' && <AdminProductManager />}
        {adminTab === 'reviews' && <AdminReviewModerator />}
        {adminTab === 'returns' && <AdminReturnsManager />}
        {adminTab === 'contacts' && <AdminFAQContactManager />}
        {adminTab === 'reports' && <AdminReportsManager />}
        {adminTab === 'faqs' && <AdminFAQContactManager />}
      </div>
    </div>
  );
};

// ─── Main Storefront Content ─────────────────────────────────────────────────
const StorefrontContent: React.FC = () => {
  const {
    products,
    categories,
    selectedProductModal,
    setSelectedProductModal,
    favorites,
    shoppingLists,
    createShoppingList,
    deleteShoppingList,
    renameShoppingList,
    updateShoppingListItemQty,
    removeShoppingListItem,
    faqs,
    submitContactForm,
    authModalOpen,
    setAuthModalOpen,
    authRedirectMessage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [shoppingListsOpen, setShoppingListsOpen] = useState(false);
  const [customerDashboardOpen, setCustomerDashboardOpen] = useState(false);
  const [pageModal, setPageModal] = useState<'faq' | 'about' | 'contact' | null>(null);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactFormName, setContactFormName] = useState('');
  const [contactFormEmail, setContactFormEmail] = useState('');
  const [contactFormSubject, setContactFormSubject] = useState('');
  const [contactFormMessage, setContactFormMessage] = useState('');
  const [contactFormStatus, setContactFormStatus] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const inCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matches = p.name.toLowerCase().includes(q) ||
        (p.arabicName || '').toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q);
      return inCat && matches;
    });
  }, [products, selectedCategory, searchQuery]);

  const favoriteProducts = useMemo(() => products.filter((p) => favorites.includes(p.id)), [products, favorites]);

  const handleContactSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactFormName.trim() || !contactFormEmail.trim() || !contactFormSubject.trim() || !contactFormMessage.trim()) {
      setContactFormStatus('Please fill in all fields before sending your message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactFormEmail)) {
      setContactFormStatus('Please enter a valid email address.');
      return;
    }

    submitContactForm(contactFormName.trim(), contactFormEmail.trim(), `${contactFormSubject.trim()}\n\n${contactFormMessage.trim()}`);
    setContactFormName('');
    setContactFormEmail('');
    setContactFormSubject('');
    setContactFormMessage('');
    setContactFormStatus('Thank you. Your message has been sent.');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenCart={() => setCartOpen(true)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenShoppingLists={() => setShoppingListsOpen(true)}
        onOpenOrderHistory={() => setOrderTrackingOpen(true)}
        onOpenCustomerDashboard={() => setCustomerDashboardOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <HeroBanner
          onExploreProducts={() => document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' })}
          onOpenPageModal={(page) => setPageModal(page)}
        />
        <CategoryBar categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

        <div id="catalog-grid" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">
                {selectedCategory === 'all' ? 'All Products' : categories.find((c) => c.id === selectedCategory)?.name || 'Products'}
              </h2>
              <p className="text-xs text-[#1A1A1A]/70">{filteredProducts.length} imported item{filteredProducts.length === 1 ? '' : 's'}</p>
            </div>
            {searchQuery && (
              <div className="text-xs bg-[#FAF8F0] border border-[#1A1A1A]/20 px-3 py-1 rounded-full flex items-center gap-2">
                <span>Search: "<strong>{searchQuery}</strong>"</span>
                <button onClick={() => setSearchQuery('')} className="text-rose-600 font-bold hover:underline">Reset</button>
              </div>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F0] rounded-2xl p-8 space-y-3">
              <p className="text-lg font-serif font-bold text-[#1A1A1A]">No matching products found</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="px-4 py-2 bg-[#1A1A1A] text-[#FDFCF5] font-semibold text-xs rounded-xl hover:bg-[#333333] transition-colors">
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={() => setSelectedProductModal(product)} />
              ))}
            </div>
          )}
        </div>

        <section id="about" className="scroll-mt-24 bg-gradient-to-br from-[#FAF8F0] to-white border border-[#1A1A1A]/10 rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-700" />
            <h2 className="text-2xl font-bold font-serif text-[#1A1A1A]">About {BRAND.name}</h2>
          </div>
          <div className="space-y-6 text-sm leading-relaxed text-[#1A1A1A]/80">
            <div className="space-y-3">
              <p className="text-base max-w-3xl">
                Tucked along Bethel Main Road in the heart of Addis Ababa, {BRAND.name} is your neighborhood grocery destination for <strong>premium imported and everyday essentials</strong>. From authentic Ajwa dates and aromatic Arabic coffee to trusted cooking oils and dairy staples, every product on our shelf is hand-picked for quality and freshness.
              </p>
              <p className="max-w-3xl">
                Whether you prefer the convenience of <strong>doorstep delivery</strong> within 6 km or a quick <strong>in-store pickup</strong>, we make grocery shopping simple, fast, and reliable — so you can spend less time running errands and more time enjoying what matters.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white rounded-xl border border-emerald-200/60 p-5 space-y-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-[#1A1A1A]">Hand-Picked Quality</h3>
                <p>Every item is personally selected to meet our quality bar — from premium imported dates to your daily cooking essentials.</p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200/60 p-5 space-y-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ListOrdered className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-[#1A1A1A]">Flexible Fulfillment</h3>
                <p>Choose doorstep delivery within 6 km or free in-store pickup at our Bethel location — whatever fits your day best.</p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200/60 p-5 space-y-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-[#1A1A1A]">Same-Day Returns</h3>
                <p>Not satisfied? Report it the same day with photo evidence and we'll make it right — refund or replacement, hassle-free.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#1A1A1A]/10 p-5 space-y-3">
              <h3 className="font-bold text-[#1A1A1A] font-serif">Why Shop With {BRAND.name}?</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span><strong>Curated selection</strong> — quality you can taste and trust.</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span><strong>Transparent pricing</strong> — what you see is what you pay.</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span><strong>Fast delivery</strong> — straight from Bethel to your door.</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span><strong>Real-time stock</strong> — know what's available before you order.</span></li>
              </ul>
            </div>

            <p className="text-base font-medium text-[#1A1A1A] font-serif text-center pt-2">
              Your kitchen deserves the best — and we deliver it.
            </p>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-white border border-[#1A1A1A]/10 rounded-2xl p-6 sm:p-8">
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FAF8F0] border border-[#1A1A1A]/10">
                <Mail className="w-5 h-5 text-emerald-700" />
              </div>
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">Contact Us</h2>
              <p className="text-sm text-[#1A1A1A]/70">We are here to help with product questions, delivery support, and general assistance.</p>
            </div>

            <form onSubmit={handleContactSectionSubmit} className="space-y-3 rounded-2xl border border-[#1A1A1A]/10 bg-[#FAF8F0] p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/70">Name</label>
                  <input type="text" value={contactFormName} onChange={(e) => setContactFormName(e.target.value)} className="w-full rounded-xl border border-[#1A1A1A]/10 bg-white px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/70">Email</label>
                  <input type="email" value={contactFormEmail} onChange={(e) => setContactFormEmail(e.target.value)} className="w-full rounded-xl border border-[#1A1A1A]/10 bg-white px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/70">Subject</label>
                <input type="text" value={contactFormSubject} onChange={(e) => setContactFormSubject(e.target.value)} className="w-full rounded-xl border border-[#1A1A1A]/10 bg-white px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" placeholder="How can we help?" />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/70">Message</label>
                <textarea rows={4} value={contactFormMessage} onChange={(e) => setContactFormMessage(e.target.value)} className="w-full rounded-xl border border-[#1A1A1A]/10 bg-white px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" placeholder="Tell us more about your request" />
              </div>

              {contactFormStatus && (
                <p className={`text-xs ${contactFormStatus.includes('Thank you') ? 'text-emerald-700' : 'text-rose-600'}`}>{contactFormStatus}</p>
              )}

              <button type="submit" className="w-full rounded-xl bg-[#1A1A1A] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#FDFCF5] transition-colors hover:bg-[#333333] flex items-center justify-center gap-2 min-h-[44px]">
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-[#FAF8F0] border-t border-[#1A1A1A]/10 text-xs py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="font-bold text-sm font-serif text-[#1A1A1A]">{BRAND.name}</span>
            </div>
            <p className="text-[#1A1A1A]/70 text-[11px] leading-relaxed">Bethel's trusted source for premium imported specialty groceries.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold font-serif text-[#1A1A1A]">Store Location</h3>
            <p className="text-[#1A1A1A]/70 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" />{BRAND.location}</p>
            <p className="text-[#1A1A1A]/70 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0" />Working Hours: {BRAND.workingHours}</p>
            <a href={`tel:${BRAND.phoneTel}`} className="text-[#1A1A1A]/70 flex items-center gap-1.5 hover:text-emerald-700 transition-colors"><Phone className="w-3.5 h-3.5 shrink-0" />{BRAND.phone}</a>
            <a href={`https://mail.google.com`} target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A]/70 flex items-center gap-1.5 hover:text-emerald-700 transition-colors break-all"><Mail className="w-3.5 h-3.5 shrink-0" />{BRAND.email}</a>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold font-serif text-[#1A1A1A]">Service Terms</h3>
            <p className="text-[#1A1A1A]/70 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0" />Working Hours: {BRAND.workingHours}</p>
            <p className="text-[#1A1A1A]/70">Max Delivery: 6.0 km</p>
            <p className="text-[#1A1A1A]/70">Min Delivery Subtotal: 1,000 ETB</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold font-serif text-[#1A1A1A]">Help & Support</h3>
            <div className="flex flex-col space-y-2 text-[#1A1A1A]/70">
              <button onClick={() => setPageModal('faq')} className="text-left hover:text-emerald-700 transition-colors flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 shrink-0" />FAQ</button>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-left hover:text-emerald-700 transition-colors flex items-center gap-2"><Info className="w-3.5 h-3.5 shrink-0" />About</button>
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="text-left hover:text-emerald-700 transition-colors flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" />Contact</button>
              <a href="#/admin" className="flex items-center gap-2 hover:text-amber-700 transition-colors font-medium">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Admin Login
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[#1A1A1A]/10 mt-8 pt-6 text-center text-[#1A1A1A]/50 text-[11px]">
          © {new Date().getFullYear()} {BRAND.name} • Bethel, Addis Ababa, Ethiopia.
        </div>
      </footer>

      {/* Modals */}
      {selectedProductModal && (
        <ProductDetailModal
          product={selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
          onOpenReviewModal={(p) => { setReviewProduct(p); setReviewModalOpen(true); }}
        />
      )}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onProceedToCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <CustomerDashboardModal isOpen={customerDashboardOpen} onClose={() => setCustomerDashboardOpen(false)} />
      <OrderTrackingModal
        isOpen={orderTrackingOpen}
        onClose={() => setOrderTrackingOpen(false)}
        onOpenReturnReport={(order) => { setReturnOrder(order); setReturnModalOpen(true); }}
        onOpenReviewModal={(product, order) => { setReviewProduct(product); setReviewOrder(order); setReviewModalOpen(true); }}
      />
      <ReturnReportModal isOpen={returnModalOpen} onClose={() => { setReturnModalOpen(false); setReturnOrder(null); }} order={returnOrder} />
      <ReviewSubmissionModal isOpen={reviewModalOpen} onClose={() => { setReviewModalOpen(false); setReviewProduct(null); setReviewOrder(null); }} product={reviewProduct} order={reviewOrder} />
      <AuthModal />

      {/* Favorites Modal */}
      {favoritesOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F0] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div className="flex items-center gap-2"><Heart className="w-5 h-5 text-amber-600" /><h2 className="text-lg font-bold font-serif text-[#1A1A1A]">Saved Favorites</h2></div>
              <button onClick={() => setFavoritesOpen(false)} className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-1"><X className="w-5 h-5" /></button>
            </div>
            {favoriteProducts.length === 0 ? (
              <p className="text-xs text-[#1A1A1A]/60 py-8 text-center">Click the heart on any product to save it here.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} onSelect={() => { setFavoritesOpen(false); setSelectedProductModal(prod); }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shopping Lists Modal */}
      {shoppingListsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F0] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div className="flex items-center gap-2"><ListOrdered className="w-5 h-5 text-emerald-700" /><h2 className="text-lg font-bold font-serif text-[#1A1A1A]">Shopping Lists</h2></div>
              <button onClick={() => setShoppingListsOpen(false)} className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="New List Name..." value={newListName} onChange={(e) => setNewListName(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <button onClick={() => { if (newListName.trim()) { createShoppingList(newListName.trim()); setNewListName(''); } }} className="px-4 py-2 bg-[#1A1A1A] text-[#FDFCF5] text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors flex items-center gap-1 shrink-0 min-h-[40px]">
                <Plus className="w-4 h-4" /><span>Create</span>
              </button>
            </div>
            {shoppingLists.length === 0 ? (
              <p className="text-xs text-[#1A1A1A]/60 py-6 text-center">No saved lists.</p>
            ) : (
              <div className="space-y-4">
                {shoppingLists.map((list) => (
                  <div key={list.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        {editingListId === list.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editListName}
                              onChange={(e) => setEditListName(e.target.value)}
                              className="flex-1 bg-[#FAF8F0] border border-emerald-300 rounded-lg px-2 py-1 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600"
                              autoFocus
                            />
                            <button
                              onClick={() => { renameShoppingList(list.id, editListName); setEditingListId(null); }}
                              className="p-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 min-h-[32px] min-w-[32px] flex items-center justify-center"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#1A1A1A]">{list.name}</h3>
                            <button
                              onClick={() => { setEditingListId(list.id); setEditListName(list.name); }}
                              className="p-1 text-[#1A1A1A]/40 hover:text-emerald-700 rounded"
                              title="Rename list"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {list.items.length > 0 && (
                          <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5">{list.items.length} item{list.items.length !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => deleteShoppingList(list.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center" title="Delete list"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {list.items.length > 0 ? (
                      <div className="divide-y divide-slate-100 text-xs">
                        {list.items.map((item) => {
                          const prod = products.find((p) => p.id === item.productId);
                          if (!prod) return null;
                          return (
                            <div key={item.productId} className="py-2 flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-[#1A1A1A] block truncate">{prod.name}</span>
                                <span className="text-[#1A1A1A]/50 text-[10px]">{prod.priceETB.toLocaleString()} ETB</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1.5 bg-[#FAF8F0] rounded-lg border border-slate-200 px-1.5 py-1">
                                  <button
                                    onClick={() => updateShoppingListItemQty(list.id, item.productId, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded text-[#1A1A1A]/70 hover:bg-slate-200 transition-colors"
                                    title="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-semibold text-[#1A1A1A] min-w-[18px] text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateShoppingListItemQty(list.id, item.productId, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded text-[#1A1A1A]/70 hover:bg-slate-200 transition-colors"
                                    title="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="font-semibold text-emerald-700 min-w-[70px] text-right">{(prod.priceETB * item.quantity).toLocaleString()} ETB</span>
                                <button
                                  onClick={() => removeShoppingListItem(list.id, item.productId)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded min-h-[28px] min-w-[28px] flex items-center justify-center"
                                  title="Remove from list"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-1" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pages Modal (FAQ / About / Contact) */}
      {pageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F0] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div className="flex items-center gap-2">
                {pageModal === 'faq' && <HelpCircle className="w-5 h-5 text-emerald-700" />}
                {pageModal === 'about' && <Info className="w-5 h-5 text-amber-700" />}
                {pageModal === 'contact' && <Mail className="w-5 h-5 text-indigo-700" />}
                <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">
                  {pageModal === 'faq' && 'Frequently Asked Questions'}
                  {pageModal === 'about' && 'Our Promise & Policy'}
                  {pageModal === 'contact' && `Contact ${BRAND.name}`}
                </h2>
              </div>
              <button onClick={() => setPageModal(null)} className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-1"><X className="w-5 h-5" /></button>
            </div>

            {pageModal === 'faq' && (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                    <h3 className="font-bold text-sm text-[#1A1A1A] flex items-start gap-2"><span className="text-emerald-700 shrink-0">Q:</span>{faq.question}</h3>
                    <p className="text-xs text-[#1A1A1A]/70 leading-relaxed pl-5"><strong>A:</strong> {faq.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {pageModal === 'about' && (
              <div className="space-y-4 text-xs leading-relaxed text-[#1A1A1A]/80">
                <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-200 space-y-2">
                  <h3 className="font-bold text-sm text-emerald-900 font-serif">Our Promise</h3>
                  <p className="text-[#1A1A1A]/80">At {BRAND.name}, nestled in the heart of Bethel, Addis Ababa, we believe grocery shopping should feel personal. That's why every product on our shelves is hand-picked for quality, authenticity, and value — from premium imported dates and aromatic Arabic coffee to everyday cooking essentials your family trusts.</p>
                  <p className="text-[#1A1A1A]/80">Whether you prefer the convenience of doorstep delivery or a quick in-store pickup, we make it simple, fast, and reliable. <strong>Your kitchen deserves the best — and we deliver it.</strong></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-sm text-[#1A1A1A] font-serif">Why Shop With Us?</h3>
                  <ul className="space-y-1.5 pl-4 list-disc">
                    <li><strong>Curated Quality</strong> — every item meets our personal standard before it reaches you.</li>
                    <li><strong>Flexible Fulfillment</strong> — doorstep delivery within 6 km or free pickup at our Bethel store.</li>
                    <li><strong>Transparent Pricing</strong> — what you see is what you pay, no hidden fees.</li>
                    <li><strong>Same-Day Returns</strong> — not satisfied? Report it the same day with photo proof for a quick resolution.</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-sm text-[#1A1A1A] font-serif">Delivery Policy</h3>
                  <p>Delivery is strictly limited to a <strong>6.0 km radius</strong> from our Bethel location. Orders beyond 6.0 km are welcome as <strong>Free In-Store Pickup</strong>. Minimum delivery subtotal: <strong>1,000 ETB</strong>.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-sm text-[#1A1A1A] font-serif">Same-Day Return Policy</h3>
                  <p>Return or replacement requests must be filed on the <strong>same calendar day</strong> as delivery. Photo evidence is mandatory for all returns.</p>
                </div>
              </div>
            )}

            {pageModal === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <a href={`tel:${BRAND.phoneTel}`} className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline"><Phone className="w-4 h-4 shrink-0" />{BRAND.phone}</a>
                  <a href={`https://mail.google.com`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline break-all"><Mail className="w-4 h-4 shrink-0" />{BRAND.email}</a>
                </div>
                <div className="space-y-3">
                  <div><label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Full Name</label><input type="text" placeholder="e.g., Abebe Bikila" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" /></div>
                  <div><label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Phone Number</label><input type="text" placeholder="+251911000000" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" /></div>
                  <div><label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Message</label><textarea rows={4} placeholder="Your message..." value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-emerald-600" /></div>
                  <button onClick={() => { if (contactName && contactPhone && contactMessage) { submitContactForm(contactName, contactPhone, contactMessage); setContactName(''); setContactPhone(''); setContactMessage(''); setPageModal(null); } }} className="w-full py-2.5 bg-[#1A1A1A] text-[#FDFCF5] font-bold text-xs rounded-xl hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 min-h-[44px]">
                    <Send className="w-4 h-4" /><span>Send Message</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const MainAppContent: React.FC = () => {
  const { viewTab, setViewTab, pendingChapaOrder, authLoading } = useApp();
  const hash = useHashRoute();

  // Sync hash → viewTab for admin route
  useEffect(() => {
    if (hash === '#/admin' || hash === '#/admin/login') {
      setViewTab('admin_dashboard');
    }
  }, [hash, setViewTab]);

  // Show a minimal loading screen while Firebase restores the session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  const isAdminRoute = hash === '#/admin' || hash === '#/admin/login' || viewTab === 'admin_dashboard';

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-[#1A1A1A] flex flex-col font-sans">
      {isAdminRoute ? (
        <AdminShell />
      ) : viewTab === 'chapa_gateway_sim' ? (
        <div className="flex-1 bg-[#FDFCF5] p-4 md:p-8 flex items-center justify-center">
          <ChapaPaymentSimulator />
        </div>
      ) : viewTab === 'design_specs' ? (
        <div className="flex-1 bg-[#FAF8F0] p-4 md:p-8 overflow-y-auto">
          <DesignSpecsView />
        </div>
      ) : (
        <StorefrontContent />
      )}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
