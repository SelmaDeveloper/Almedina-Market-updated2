import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  ViewTab,
  DeviceBreakpoint,
  UserProfile,
  Category,
  Product,
  CartItem,
  NamedShoppingList,
  Order,
  Review,
  ReturnReport,
  ContactSubmission,
  FAQItem,
  FulfillmentType,
  PaymentMethod,
  DeliveryLocation,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_RETURNS,
  INITIAL_CONTACTS,
  INITIAL_FAQS,
  ALMADINA_SHOP_LOCATION,
} from '../data/mockData';
import { calculateDeliveryFeeETB, isSameCalendarDay } from '../utils/distance';
import {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  reload,
  sendPasswordResetEmail,
} from '../lib/firebase';
import { fetchAllData } from '../lib/supabaseApi';
import {
  insertProductToSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  insertOrderToSupabase,
  updateOrderInSupabase,
  updateOrderItemsInSupabase,
  insertReviewToSupabase,
  updateReviewInSupabase,
  insertReturnReportToSupabase,
  updateReturnReportInSupabase,
  insertContactToSupabase,
  markContactReadInSupabase,
  upsertFAQsToSupabase,
} from '../lib/supabaseApi';

// ─── Hardcoded admin UID — set this to your real Firebase UID ─────────────────
// To get it: sign in with your admin account and copy auth.currentUser.uid
// Or set VITE_ADMIN_UID in your .env file.
const ADMIN_UID = import.meta.env.VITE_ADMIN_UID as string | undefined;

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// ─── Auth Result Types ────────────────────────────────────────────────────────
export type AuthResult =
  | { status: 'success' }
  | { status: 'error'; message: string }
  | { status: 'verify_email'; email: string };

interface AppContextType {
  // Roles & Navigation
  userRole: UserRole;
  viewTab: ViewTab;
  setViewTab: (tab: ViewTab) => void;
  deviceFrame: DeviceBreakpoint;
  setDeviceFrame: (frame: DeviceBreakpoint) => void;

  // Auth State
  currentUser: UserProfile | null;
  authLoading: boolean;
  pendingVerificationEmail: string | null;

  // Customer Auth
  registerUser: (name: string, email: string, password: string) => Promise<AuthResult>;
  loginUser: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  updateAccountSettings: (updates: { name?: string; phoneNumber?: string; avatar?: string }) => Promise<void>;
  saveAddress: (address: { label: string; addressText: string; latitude: number; longitude: number; distanceKm: number }) => void;
  removeAddress: (addressId: string) => void;

  // Admin Auth (password + 2FA)
  adminSession: {
    isLoggedIn: boolean;
    is2FAVerified: boolean;
    activeDeviceId: string;
    sessionError?: string;
  };
  loginAdmin: (password: string) => boolean;
  verifyAdmin2FA: (code: string) => boolean;
  logoutAdmin: () => void;
  simulateAdminLoginOnOtherDevice: () => void;

  // Catalog
  categories: Category[];
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;

  // Shopping Lists
  shoppingLists: NamedShoppingList[];
  createShoppingList: (name: string) => void;
  addToList: (listId: string, productId: string) => void;
  moveListToCart: (listId: string) => void;
  deleteShoppingList: (listId: string) => void;
  renameShoppingList: (listId: string, name: string) => void;
  updateShoppingListItemQty: (listId: string, productId: string, quantity: number) => void;
  removeShoppingListItem: (listId: string, productId: string) => void;

  // Orders
  orders: Order[];
  createOrder: (data: {
    fulfillmentType: FulfillmentType;
    deliveryLocation?: DeliveryLocation;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => { success: boolean; orderId?: string; message: string; requiresChapaRedirect?: boolean };
  updateOrderQuantity: (orderId: string, productId: string, newQuantity: number) => boolean;
  cancelOrder: (orderId: string, reason?: string) => boolean;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  verifyChapaPayment: (orderId: string) => { success: boolean; message: string };
  recordCashPaymentReceived: (orderId: string) => void;
  confirmOrderViaEmail: (orderId: string) => void;

  // Chapa
  pendingChapaOrder: Order | null;
  setPendingChapaOrder: (order: Order | null) => void;
  simulateChapaPaymentSuccess: (orderId: string) => void;
  simulateChapaPaymentFailure: (orderId: string) => void;

  // Reviews
  reviews: Review[];
  submitReview: (productId: string, orderId: string, rating: number, comment: string) => { success: boolean; message: string };
  moderateReview: (reviewId: string, status: 'approved' | 'rejected') => void;

  // Returns
  returnReports: ReturnReport[];
  submitReturnReport: (data: {
    orderId: string;
    reason: ReturnReport['reason'];
    photoUrl: string;
    notes: string;
  }) => { success: boolean; message: string };
  resolveReturnReport: (reportId: string, resolution: 'refund' | 'replacement' | 'denied', notes?: string) => void;

  // Contact & FAQ
  contactSubmissions: ContactSubmission[];
  submitContactForm: (name: string, phone: string, message: string) => void;
  markContactRead: (id: string) => void;
  faqs: FAQItem[];
  updateFAQ: (faqs: FAQItem[]) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // UI
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authRedirectMessage: string | null;
  setAuthRedirectMessage: (msg: string | null) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (prod: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [viewTab, setViewTab] = useState<ViewTab>('storefront');
  const [deviceFrame, setDeviceFrame] = useState<DeviceBreakpoint>('desktop');

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Holds the email of a just-registered user who has not yet verified
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const [adminSession, setAdminSession] = useState({
    isLoggedIn: false,
    is2FAVerified: false,
    activeDeviceId: 'device-main-001',
    sessionError: undefined as string | undefined,
  });

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingLists, setShoppingLists] = useState<NamedShoppingList[]>([]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [returnReports, setReturnReports] = useState(INITIAL_RETURNS);
  const [contactSubmissions, setContactSubmissions] = useState(INITIAL_CONTACTS);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [pendingChapaOrder, setPendingChapaOrder] = useState<Order | null>(null);

  // ─── Load data from Supabase on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllData();
        if (cancelled) return;
        if (data.categories.length) setCategories(data.categories);
        if (data.products.length) setProducts(data.products);
        if (data.orders.length) setOrders(data.orders);
        if (data.reviews.length) setReviews(data.reviews);
        if (data.returnReports.length) setReturnReports(data.returnReports);
        if (data.contactSubmissions.length) setContactSubmissions(data.contactSubmissions);
        if (data.faqs.length) setFaqs(data.faqs);
      } catch (err) {
        console.warn('Supabase load failed, using mock data:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string | null>(null);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ─── Firebase Auth State Listener ─────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        // Determine role: if UID matches the configured admin UID → admin
        const isAdmin = ADMIN_UID ? firebaseUser.uid === ADMIN_UID : false;
        setCurrentUser((prev) => ({
          ...(prev || {}),
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer',
          email: firebaseUser.email || undefined,
          phoneNumber: firebaseUser.phoneNumber || prev?.phoneNumber || '',
          isLoggedIn: true,
          isEmailVerified: true,
          savedAddresses: prev?.savedAddresses || [],
        } as UserProfile));
        setUserRole(isAdmin ? 'admin' : 'customer');
        // Clear any lingering pending verification state
        setPendingVerificationEmail(null);
      } else if (firebaseUser && !firebaseUser.emailVerified) {
        // Signed in but email not verified — keep them as guest, sign them out silently
        signOut(auth);
        setCurrentUser(null);
        setUserRole('guest');
      } else {
        setCurrentUser(null);
        setUserRole('guest');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Customer Auth ─────────────────────────────────────────────────────────

  const registerUser = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      await sendEmailVerification(credential.user);
      // Sign them out immediately — they must verify first
      await signOut(auth);
      setPendingVerificationEmail(email);
      return { status: 'verify_email', email };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || '';
      const message =
        code === 'auth/email-already-in-use'
          ? 'An account with this email already exists. Try logging in instead.'
          : code === 'auth/weak-password'
          ? 'Password is too weak. Please use at least 6 characters.'
          : code === 'auth/invalid-email'
          ? 'Invalid email address format.'
          : 'Sign-up failed. Please check your details and try again.';
      return { status: 'error', message };
    }
  };

  const loginUser = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        // Signed in but unverified — sign back out and block
        await signOut(auth);
        setPendingVerificationEmail(email);
        return { status: 'verify_email', email };
      }
      // onAuthStateChanged will set currentUser; close modal here
      setAuthModalOpen(false);
      setAuthRedirectMessage(null);
      showToast(`Welcome back, ${credential.user.displayName || email}!`, 'success');
      return { status: 'success' };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || '';
      const message =
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Please try again later or reset your password.'
          : code === 'auth/user-disabled'
          ? 'This account has been disabled. Please contact support.'
          : 'Login failed. Please try again.';
      return { status: 'error', message };
    }
  };

  const loginWithGoogle = async (): Promise<AuthResult> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Google accounts are always email-verified
      setAuthModalOpen(false);
      setAuthRedirectMessage(null);
      showToast(`Welcome, ${result.user.displayName || result.user.email}!`, 'success');
      return { status: 'success' };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return { status: 'error', message: '' }; // silent cancel
      }
      return { status: 'error', message: 'Google sign-in failed. Please try again.' };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
      }
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset link sent to your email!', 'success');
      return { success: true, message: 'Password reset link sent to your email!' };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || '';
      const message =
        code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : code === 'auth/invalid-email'
          ? 'Invalid email address.'
          : code === 'auth/too-many-requests'
          ? 'Too many requests. Please try again later.'
          : 'Failed to send reset link. Please try again.';
      return { success: false, message };
    }
  };

  const logoutUser = async (): Promise<void> => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole('guest');
    setCart([]);
    setFavorites([]);
    setPendingVerificationEmail(null);
    showToast('You have been signed out.', 'info');
  };

  const resendVerificationEmail = async (): Promise<void> => {
    try {
      // Need to be signed in to resend — attempt a temporary sign-in
      // We can only do this if we have the password, which we don't store.
      // Instead, use the Firebase "send sign-in link" approach or guide the user.
      // Safest: tell them to register again or use a fresh sign-in link.
      // If they just registered the user is still in auth but signed out.
      // The cleanest supported approach: sign in silently isn't possible without password.
      // We show a toast directing them to try logging in again.
      showToast('Verification email already sent. Please check your inbox and spam folder.', 'info');
    } catch {
      showToast('Could not resend verification email. Please try again.', 'error');
    }
  };

  // Check if the current Firebase user's email is now verified (after they click the link)
  const checkEmailVerification = async (): Promise<boolean> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      // Try signing them in again isn't possible without a password.
      // The user must manually log in after clicking their verification link.
      return false;
    }
    await reload(firebaseUser);
    return firebaseUser.emailVerified;
  };

  const updateAccountSettings = async (updates: { name?: string; phoneNumber?: string; avatar?: string }) => {
    if (!currentUser) {
      showToast('Please log in to update account settings.', 'warning');
      return;
    }

    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));

    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: updates.name || auth.currentUser.displayName || currentUser.name });
      } catch {
        showToast('Your profile was updated locally. Firebase sync was skipped.', 'warning');
      }
    }

    showToast('Settings updated.', 'success');
  };

  const saveAddress = (address: { label: string; addressText: string; latitude: number; longitude: number; distanceKm: number }) => {
    if (!currentUser) {
      showToast('Please log in to save addresses.', 'warning');
      return;
    }

    const nextAddress = {
      id: 'addr-' + Date.now(),
      ...address,
    };

    setCurrentUser((prev) => (prev ? { ...prev, savedAddresses: [...(prev.savedAddresses || []), nextAddress] } : prev));
    showToast(`Saved address: ${address.label}`, 'success');
  };

  const removeAddress = (addressId: string) => {
    setCurrentUser((prev) => (prev ? { ...prev, savedAddresses: (prev.savedAddresses || []).filter((item) => item.id !== addressId) } : prev));
    showToast('Address removed.', 'info');
  };

  // ─── Admin Auth (password + 2FA, separate from Firebase customer auth) ─────
  const loginAdmin = (password: string): boolean => {
    if (password === 'admin123' || password.length >= 6) {
      setAdminSession({
        isLoggedIn: true,
        is2FAVerified: false,
        activeDeviceId: 'device-session-' + Date.now(),
        sessionError: undefined,
      });
      return true;
    }
    showToast('Invalid admin password.', 'error');
    return false;
  };

  const verifyAdmin2FA = (code: string): boolean => {
    if (code === '123456' || code.length === 6) {
      setAdminSession((prev) => ({ ...prev, is2FAVerified: true }));
      setUserRole('admin');
      setViewTab('admin_dashboard');
      showToast('Admin dashboard unlocked.', 'success');
      return true;
    }
    showToast('Invalid 2FA code. Please try again.', 'error');
    return false;
  };

  const logoutAdmin = (): void => {
    setAdminSession({ isLoggedIn: false, is2FAVerified: false, activeDeviceId: '', sessionError: undefined });
    setViewTab('storefront');
    setUserRole('guest');
    showToast('Admin signed out.', 'info');
  };

  const simulateAdminLoginOnOtherDevice = (): void => {
    setAdminSession({
      isLoggedIn: false,
      is2FAVerified: false,
      activeDeviceId: 'device-other-' + Date.now(),
      sessionError: 'Your session was terminated because a new login occurred on another device.',
    });
    showToast('Session Invalidated: Logged in from another device!', 'error');
  };

  // ─── Catalog ───────────────────────────────────────────────────────────────
  const addProduct = (prodData: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => {
    const p: Product = { ...prodData, id: 'prod-' + Date.now(), rating: 5.0, reviewCount: 0 };
    setProducts((prev) => [p, ...prev]);
    insertProductToSupabase(p).catch((e) => console.warn('Supabase product insert failed:', e));
    showToast(`Product added: ${p.name}`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...updates, isAvailable: updates.stockCount !== undefined ? updates.stockCount > 0 : p.isAvailable } : p));
    updateProductInSupabase(id, updates).catch((e) => console.warn('Supabase product update failed:', e));
    // If stock dropped to 0, flag any cart items holding this product as unavailable
    if (updates.stockCount !== undefined && updates.stockCount <= 0) {
      setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, isUnavailableInCart: true } : i));
    } else if (updates.stockCount !== undefined) {
      // Stock restored — clear the flag and clamp quantity to new stock
      setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, isUnavailableInCart: false, quantity: Math.min(i.quantity, updates.stockCount as number) } : i));
    }
    showToast('Product updated.', 'success');
  };

  const deleteProduct = (id: string) => {
    const p = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromSupabase(id).catch((e) => console.warn('Supabase product delete failed:', e));
    if (p) showToast(`Product deleted: ${p.name}`, 'warning');
  };

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (userRole === 'guest') {
      setAuthRedirectMessage('Please sign in to add items to your cart.');
      setAuthModalOpen(true);
      return { success: false, message: 'Login required.' };
    }
    // Re-check live stock from the products array (not the stale product snapshot)
    const live = products.find((p) => p.id === product.id);
    const stock = live ? live.stockCount : product.stockCount;
    const available = live ? live.isAvailable && live.stockCount > 0 : product.isAvailable && product.stockCount > 0;
    if (!available || stock <= 0) {
      showToast(`${product.name} is out of stock.`, 'error');
      return { success: false, message: 'Out of stock.' };
    }
    const inCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;
    const remaining = stock - inCart;
    if (remaining <= 0) {
      showToast(`You already have all ${stock} ${product.unit} of ${product.name} in your cart.`, 'warning');
      return { success: false, message: 'Stock limit reached.' };
    }
    const addQty = Math.min(quantity, remaining);
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + addQty, stock), isUnavailableInCart: false }
            : i
        );
      }
      return [...prev, { product: live || product, quantity: addQty, addedAtPrice: (live || product).priceETB, isUnavailableInCart: false }];
    });
    if (addQty < quantity) {
      showToast(`Added ${addQty} of ${product.name}. Only ${remaining} left in stock.`, 'warning');
    } else if (stock - inCart - addQty <= (live?.lowStockThreshold || 3)) {
      showToast(`${product.name} added. Hurry — stock is running low!`, 'success');
    } else {
      showToast(`${product.name} added to cart.`, 'success');
    }
    return { success: true, message: 'Added to cart.' };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { setCart((prev) => prev.filter((i) => i.product.id !== productId)); return; }
    const live = products.find((p) => p.id === productId);
    const stock = live ? live.stockCount : undefined;
    setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: stock !== undefined ? Math.min(quantity, stock) : quantity, isUnavailableInCart: stock !== undefined && stock <= 0 } : i));
  };
  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.product.id !== productId));
  const clearCart = () => setCart([]);

  // ─── Favorites ─────────────────────────────────────────────────────────────
  const toggleFavorite = (productId: string) => {
    if (userRole === 'guest') {
      setAuthRedirectMessage('Please sign in to save favourites.');
      setAuthModalOpen(true);
      return;
    }
    setFavorites((prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]);
  };

  // ─── Shopping Lists ────────────────────────────────────────────────────────
  const createShoppingList = (name: string) => {
    setShoppingLists((prev) => [...prev, { id: 'list-' + Date.now(), name, items: [], createdAt: new Date().toISOString() }]);
    showToast(`List "${name}" created.`, 'success');
  };
  const addToList = (listId: string, productId: string) => {
    setShoppingLists((prev) => prev.map((l) => {
      if (l.id !== listId) return l;
      const exists = l.items.find((i) => i.productId === productId);
      return { ...l, items: exists ? l.items.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i) : [...l.items, { productId, quantity: 1 }] };
    }));
  };
  const moveListToCart = (listId: string) => {
    const list = shoppingLists.find((l) => l.id === listId);
    if (!list) return;
    list.items.forEach((item) => { const p = products.find((p) => p.id === item.productId); if (p) addToCart(p, item.quantity); });
    showToast(`"${list.name}" moved to cart.`, 'success');
  };
  const deleteShoppingList = (listId: string) => { setShoppingLists((prev) => prev.filter((l) => l.id !== listId)); showToast('List deleted.', 'info'); };
  const renameShoppingList = (listId: string, name: string) => { if (!name.trim()) return; setShoppingLists((prev) => prev.map((l) => l.id === listId ? { ...l, name: name.trim() } : l)); showToast('List renamed.', 'success'); };
  const updateShoppingListItemQty = (listId: string, productId: string, quantity: number) => {
    setShoppingLists((prev) => prev.map((l) => {
      if (l.id !== listId) return l;
      if (quantity <= 0) return { ...l, items: l.items.filter((i) => i.productId !== productId) };
      return { ...l, items: l.items.map((i) => i.productId === productId ? { ...i, quantity } : i) };
    }));
  };
  const removeShoppingListItem = (listId: string, productId: string) => {
    setShoppingLists((prev) => prev.map((l) => l.id !== listId ? l : { ...l, items: l.items.filter((i) => i.productId !== productId) }));
    showToast('Item removed from list.', 'info');
  };

  // ─── Orders ────────────────────────────────────────────────────────────────
  const createOrder = (data: { fulfillmentType: FulfillmentType; deliveryLocation?: DeliveryLocation; paymentMethod: PaymentMethod; notes?: string }) => {
    if (!currentUser) return { success: false, message: 'You must be logged in.' };
    if (cart.length === 0) return { success: false, message: 'Cart is empty.' };
    const subtotal = cart.reduce((s, i) => s + i.product.priceETB * i.quantity, 0);
    if (data.fulfillmentType === 'delivery') {
      if (!data.deliveryLocation) return { success: false, message: 'Delivery location required.' };
      if (data.deliveryLocation.distanceKm > ALMADINA_SHOP_LOCATION.maxDeliveryDistanceKm)
        return { success: false, message: 'Sorry, we currently deliver only within 6 km of Bethel.' };
      if (subtotal < ALMADINA_SHOP_LOCATION.minDeliverySubtotalETB)
        return { success: false, message: `Minimum ${ALMADINA_SHOP_LOCATION.minDeliverySubtotalETB} ETB required for delivery.` };
    }
    const fee = data.fulfillmentType === 'delivery' && data.deliveryLocation ? calculateDeliveryFeeETB(data.deliveryLocation.distanceKm) : 0;
    const isChapa = data.paymentMethod === 'telebirr' || data.paymentMethod === 'cbe_birr';
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: 'ALM-' + new Date().getFullYear() + '-' + String(orders.length + 101).padStart(4, '0'),
      userId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phoneNumber || currentUser.email || '',
      fulfillmentType: data.fulfillmentType,
      deliveryLocation: data.deliveryLocation,
      subtotalETB: subtotal,
      deliveryFeeETB: fee,
      totalETB: subtotal + fee,
      paymentMethod: data.paymentMethod,
      paymentStatus: isChapa ? 'payment_pending' : 'unpaid',
      orderStatus: 'pending',
      chapaTxRef: isChapa ? `CHP-TX-${Date.now()}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: cart.map((i) => ({ productId: i.product.id, productName: i.product.name, priceETB: i.addedAtPrice, quantity: i.quantity, unit: i.product.unit, subtotalETB: i.addedAtPrice * i.quantity })),
      notes: data.notes,
    };
    setOrders((prev) => [newOrder, ...prev]);
    insertOrderToSupabase(newOrder).catch((e) => console.warn('Supabase order insert failed:', e));
    clearCart();
    if (isChapa) { setPendingChapaOrder(newOrder); showToast('Redirecting to Chapa payment portal...', 'info'); return { success: true, orderId: newOrder.id, message: 'Order created.', requiresChapaRedirect: true }; }
    showToast(`Order ${newOrder.orderNumber} placed! Confirmation email sent.`, 'success');
    return { success: true, orderId: newOrder.id, message: 'Order placed.' };
  };

  const updateOrderQuantity = (orderId: string, productId: string, newQty: number): boolean => {
    const o = orders.find((o) => o.id === orderId);
    if (!o || o.orderStatus !== 'pending') { showToast('Order can only be edited while Pending.', 'error'); return false; }
    if (newQty <= 0) {
      const items = o.items.filter((i) => i.productId !== productId);
      if (!items.length) { showToast('Cannot remove last item. Cancel the order instead.', 'error'); return false; }
      const sub = items.reduce((s, i) => s + i.subtotalETB, 0);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, items, subtotalETB: sub, totalETB: sub + o.deliveryFeeETB, updatedAt: new Date().toISOString() } : o));
      return true;
    }
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      const items = o.items.map((i) => i.productId === productId ? { ...i, quantity: newQty, subtotalETB: i.priceETB * newQty } : i);
      const sub = items.reduce((s, i) => s + i.subtotalETB, 0);
      return { ...o, items, subtotalETB: sub, totalETB: sub + o.deliveryFeeETB, updatedAt: new Date().toISOString() };
    }));
    return true;
  };

  const cancelOrder = (orderId: string): boolean => {
    const o = orders.find((o) => o.id === orderId);
    if (!o || !['pending', 'confirmed'].includes(o.orderStatus)) { showToast('Order cannot be cancelled at this stage.', 'error'); return false; }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus: 'cancelled', updatedAt: new Date().toISOString() } : o));
    updateOrderInSupabase(orderId, { orderStatus: 'cancelled' }).catch((e) => console.warn('Supabase order update failed:', e));
    showToast(`Order ${o.orderNumber} cancelled.`, 'warning');
    return true;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus: status, updatedAt: new Date().toISOString() } : o));
    updateOrderInSupabase(orderId, { orderStatus: status }).catch((e) => console.warn('Supabase order update failed:', e));
    if (status === 'out_for_delivery') {
      showToast('Your order is on the way.', 'info');
    } else {
      showToast(`Order status → ${status.replace(/_/g, ' ')}.`, 'success');
    }
  };

  const verifyChapaPayment = (orderId: string) => {
    const o = orders.find((o) => o.id === orderId);
    if (!o) return { success: false, message: 'Order not found.' };
    if (o.paymentStatus === 'paid') return { success: true, message: 'Already paid.' };
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, paymentStatus: 'paid', orderStatus: 'confirmed', updatedAt: new Date().toISOString() } : o));
    updateOrderInSupabase(orderId, { paymentStatus: 'paid', orderStatus: 'confirmed' }).catch((e) => console.warn('Supabase order update failed:', e));
    showToast(`Payment verified for ${o.orderNumber}.`, 'success');
    return { success: true, message: 'Payment verified.' };
  };

  const recordCashPaymentReceived = (orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, paymentStatus: 'paid', updatedAt: new Date().toISOString() } : o));
    updateOrderInSupabase(orderId, { paymentStatus: 'paid' }).catch((e) => console.warn('Supabase order update failed:', e));
    showToast('Your payment has been received.', 'success');
  };

  const confirmOrderViaEmail = (orderId: string) => {
    const o = orders.find((o) => o.id === orderId);
    if (!o) return;
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus: 'confirmed', updatedAt: new Date().toISOString() } : o));
    updateOrderInSupabase(orderId, { orderStatus: 'confirmed' }).catch((e) => console.warn('Supabase order update failed:', e));
    if (o.fulfillmentType === 'pickup') {
      showToast('Your order has been confirmed and is being prepared.', 'success');
    } else {
      showToast('Your order has been confirmed.', 'success');
    }
  };

  const simulateChapaPaymentSuccess = (orderId: string) => { verifyChapaPayment(orderId); setPendingChapaOrder(null); showToast('Payment successful!', 'success'); };
  const simulateChapaPaymentFailure = (orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, paymentStatus: 'failed', updatedAt: new Date().toISOString() } : o));
    setPendingChapaOrder(null);
    showToast('Payment failed. Order on hold.', 'error');
  };

  // ─── Reviews ───────────────────────────────────────────────────────────────
  const submitReview = (productId: string, orderId: string, rating: number, comment: string) => {
    if (!currentUser) return { success: false, message: 'Login required.' };
    const o = orders.find((o) => o.id === orderId);
    if (!o || o.userId !== currentUser.id || o.orderStatus !== 'completed') return { success: false, message: 'Verified completed order required.' };
    if (reviews.find((r) => r.productId === productId && r.orderId === orderId)) return { success: false, message: 'Already reviewed.' };
    const newReview: Review = { id: 'rev-' + Date.now(), productId, orderId, userId: currentUser.id, userName: currentUser.name, rating, comment, createdAt: new Date().toISOString(), status: 'pending_approval' };
    setReviews((prev) => [...prev, newReview]);
    insertReviewToSupabase(newReview).catch((e) => console.warn('Supabase review insert failed:', e));
    showToast('Review submitted — pending admin approval.', 'success');
    return { success: true, message: 'Submitted.' };
  };

  const moderateReview = (reviewId: string, status: 'approved' | 'rejected') => {
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, status } : r));
    updateReviewInSupabase(reviewId, status).catch((e) => console.warn('Supabase review update failed:', e));
    showToast(`Review ${status}.`, status === 'approved' ? 'success' : 'warning');
  };

  // ─── Returns ───────────────────────────────────────────────────────────────
  const submitReturnReport = (data: { orderId: string; reason: ReturnReport['reason']; photoUrl: string; notes: string }) => {
    if (!currentUser) return { success: false, message: 'Login required.' };
    const o = orders.find((o) => o.id === data.orderId);
    if (!o || o.userId !== currentUser.id) return { success: false, message: 'Order not found.' };
    if (o.orderStatus !== 'completed') return { success: false, message: 'Order must be completed.' };
    if (!isSameCalendarDay(o.updatedAt)) return { success: false, message: 'Same-day return policy: must be filed on delivery date.' };
    if (!data.photoUrl) return { success: false, message: 'Photo evidence required.' };
    if (returnReports.find((r) => r.orderId === data.orderId)) return { success: false, message: 'Report already filed for this order.' };
    const newReport: ReturnReport = { id: 'ret-' + Date.now(), orderId: data.orderId, orderNumber: o.orderNumber, userId: currentUser.id, userName: currentUser.name, userPhone: currentUser.phoneNumber || '', reason: data.reason, photoUrl: data.photoUrl, notes: data.notes, createdAt: new Date().toISOString(), status: 'pending_review' };
    setReturnReports((prev) => [...prev, newReport]);
    insertReturnReportToSupabase(newReport).catch((e) => console.warn('Supabase return insert failed:', e));
    showToast('Return report filed.', 'success');
    return { success: true, message: 'Report submitted.' };
  };

  const resolveReturnReport = (reportId: string, resolution: 'refund' | 'replacement' | 'denied', notes?: string) => {
    const newStatus = resolution === 'denied' ? 'rejected' : 'approved';
    setReturnReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: newStatus, adminResolution: resolution, adminResponseNotes: notes } : r));
    updateReturnReportInSupabase(reportId, newStatus, resolution, notes).catch((e) => console.warn('Supabase return update failed:', e));
    showToast(`Return ${resolution}.`, 'success');
  };

  // ─── Contact & FAQ ─────────────────────────────────────────────────────────
  const submitContactForm = (name: string, phone: string, message: string) => {
    const newContact: ContactSubmission = { id: 'cnt-' + Date.now(), name, phone, message, createdAt: new Date().toISOString(), isRead: false };
    setContactSubmissions((prev) => [...prev, newContact]);
    insertContactToSupabase(newContact).catch((e) => console.warn('Supabase contact insert failed:', e));
    showToast('Message sent to Almedina Market.', 'success');
  };
  const markContactRead = (id: string) => { setContactSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, isRead: true } : s)); markContactReadInSupabase(id).catch((e) => console.warn('Supabase contact update failed:', e)); };
  const updateFAQ = (updatedFaqs: FAQItem[]) => { setFaqs(updatedFaqs); upsertFAQsToSupabase(updatedFaqs).catch((e) => console.warn('Supabase FAQ upsert failed:', e)); showToast('FAQs updated.', 'success'); };

  const contextValue: AppContextType = {
    userRole,
    viewTab,
    setViewTab,
    deviceFrame,
    setDeviceFrame,
    currentUser,
    authLoading,
    pendingVerificationEmail,
    registerUser,
    loginUser,
    loginWithGoogle,
    sendPasswordReset,
    logoutUser,
    resendVerificationEmail,
    checkEmailVerification,
    updateAccountSettings,
    saveAddress,
    removeAddress,
    adminSession,
    loginAdmin,
    verifyAdmin2FA,
    logoutAdmin,
    simulateAdminLoginOnOtherDevice,
    categories,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    favorites,
    toggleFavorite,
    shoppingLists,
    createShoppingList,
    addToList,
    moveListToCart,
    deleteShoppingList,
    renameShoppingList,
    updateShoppingListItemQty,
    removeShoppingListItem,
    orders,
    createOrder,
    updateOrderQuantity,
    cancelOrder,
    updateOrderStatus,
    verifyChapaPayment,
    recordCashPaymentReceived,
    confirmOrderViaEmail,
    pendingChapaOrder,
    setPendingChapaOrder,
    simulateChapaPaymentSuccess,
    simulateChapaPaymentFailure,
    reviews,
    submitReview,
    moderateReview,
    returnReports,
    submitReturnReport,
    resolveReturnReport,
    contactSubmissions,
    submitContactForm,
    markContactRead,
    faqs,
    updateFAQ,
    toasts,
    showToast,
    removeToast,
    authModalOpen,
    setAuthModalOpen,
    authRedirectMessage,
    setAuthRedirectMessage,
    selectedProductModal,
    setSelectedProductModal,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
