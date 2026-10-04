import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  sku: string;
  images: string[];
  image: string;
  sizes: string[];
  colors: string[];
  details: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  mobile: string;
}

interface AuthResponse {
  token: string;
  user: UserAccount;
  message: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface OrderCustomer {
  name: string;
  mobile: string;
  email: string;
}

interface OrderAddress {
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  productId: number | string;
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface OrderPayment {
  method: string;
  upiId: string;
  utrNumber: string;
  paymentScreenshot: string;
  status: string;
  rejectionReason?: string;
}

interface OrderResponse {
  orderId: string;
  customer: OrderCustomer;
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  payment: OrderPayment;
  orderStatus: string;
  trackingLink?: string;
  createdAt: string;
}

interface AdminProductForm {
  name: string;
  category: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  sku: string;
  sizesText: string;
  colorsText: string;
  images: string[];
  details: Record<string, string>;
}

const CATEGORY_DETAILS_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
  'Sarees': [
    { key: 'material', label: 'Saree Material' },
    { key: 'blouseIncluded', label: 'Blouse Included' },
    { key: 'sareeLength', label: 'Saree Length' },
    { key: 'blouseLength', label: 'Blouse Length' },
    { key: 'color', label: 'Color' },
    { key: 'pattern', label: 'Pattern' },
    { key: 'occasion', label: 'Occasion' }
  ],
  Gowns: [
    { key: 'material', label: 'Material' },
    { key: 'color', label: 'Color' },
    { key: 'size', label: 'Size' },
    { key: 'sleeveType', label: 'Sleeve Type' },
    { key: 'length', label: 'Length' },
    { key: 'occasion', label: 'Occasion' }
  ],
  "Men's Shirts": [
    { key: 'material', label: 'Material' },
    { key: 'color', label: 'Color' },
    { key: 'size', label: 'Size' },
    { key: 'fit', label: 'Fit' },
    { key: 'sleeveType', label: 'Sleeve Type' }
  ],
  'Maternity Wear': [
    { key: 'material', label: 'Material' },
    { key: 'size', label: 'Size' },
    { key: 'color', label: 'Color' },
    { key: 'nursingFriendly', label: 'Nursing Friendly' },
    { key: 'stretchable', label: 'Stretchable' }
  ],
  'Kids Wear': [
    { key: 'ageGroup', label: 'Age Group' },
    { key: 'size', label: 'Size' },
    { key: 'material', label: 'Material' },
    { key: 'color', label: 'Color' },
    { key: 'gender', label: 'Gender' }
  ],
  'Traditional Wear': [
    { key: 'material', label: 'Material' },
    { key: 'color', label: 'Color' },
    { key: 'size', label: 'Size' },
    { key: 'occasion', label: 'Occasion' }
  ],
  'Couple Combo': [
    { key: 'fabric', label: 'Fabric' },
    { key: 'packageOption1', label: 'Package Option 1' },
    { key: 'packageOption2', label: 'Package Option 2' },
    { key: 'color', label: 'Color' },
    { key: 'size', label: 'Size' }
  ],
  'Modern Wear': [
    { key: 'fabric', label: 'Fabric' },
    { key: 'package', label: 'Package' },
    { key: 'color', label: 'Color' },
    { key: 'size', label: 'Size' },
    { key: 'delivery', label: 'Delivery' }
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Dresses Collections';
  products: Product[] = [];
  categories: string[] = [];
  selectedCategory = 'All Products';
  cart: CartItem[] = [];
  cartCount = 0;
  totalAmount = 0;
  selectedProduct: Product | null = null;
  currentView: 'home' | 'products' | 'checkout' | 'orders' = 'home';
  orderHistory: OrderResponse[] = [];
  adminOrders: OrderResponse[] = [];
  toastMessage = '';
  toastTimer: any;
  checkoutErrors: Record<string, string> = {
    customerName: '',
    mobileNumber: '',
    email: '',
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: ''
  };
  checkoutForm = {
    customerName: '',
    mobileNumber: '',
    email: '',
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'UPI / GPay'
  };
  paymentStep = false;
  paymentProof = {
    utrNumber: '',
    paymentScreenshot: ''
  };
  orderPlaced = false;
  latestOrder: OrderResponse | null = null;
  orderConfirmationMessage = '';
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  authMode: 'login' | 'register' = 'login';
  currentUser: UserAccount | null = null;
  authToken = '';
  authError = '';
  authForm = {
    username: '',
    password: '',
    email: '',
    fullName: '',
    mobile: ''
  };
  adminAuthenticated = false;
  adminToken = '';
  adminUsername = '';
  adminPassword = '';
  adminLoggedInAs = '';
  adminError = '';
  adminAccessVisible = false;
  profileMobile = '';
  profileOrderId = '';
  profileOrders: OrderResponse[] = [];
  adminProductSearch = '';
  adminCategoryFilter = 'All Categories';
  trackingDrafts: Record<string, string> = {};
  adminProductFormMode: 'add' | 'edit' = 'add';
  adminProductEditId: string | null = null;
  adminProductForm: AdminProductForm = {
    name: '',
    category: 'Traditional Wear',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    sku: '',
    sizesText: '',
    colorsText: '',
    images: [],
    details: {}
  };
  selectedProductImageIndex = 0;
  adminRejectionReasons: Record<string, string> = {};
  private ordersRefreshTimer: ReturnType<typeof setInterval> | null = null;
  readonly apiBaseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://dresses-collection-backend-8672.onrender.com';
  readonly homeFeatureImage = `${this.apiBaseUrl}/uploads/dp/WhatsApp Image 2026-09-27 at 1.27.21 PM.jpeg`;
  readonly upiId = 'snehamurugan202002@oksbi';
  readonly upiName = 'Muruganuma';
  readonly paymentQrImage = `${this.apiBaseUrl}/uploads/scanner.jpeg`;
  readonly deliveryCharge = 99;
  readonly categoryDetailsFields = CATEGORY_DETAILS_FIELDS;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.adminAccessVisible = false;
    this.restoreSession();
    this.loadProducts();
    this.loadCategories();
    if (this.currentUser && this.authToken) {
      this.loadCustomerOrders();
    }
    this.startCustomerOrderStatusRefresh();
  }

  ngOnDestroy(): void {
    if (this.ordersRefreshTimer) {
      clearInterval(this.ordersRefreshTimer);
    }
  }

  private startCustomerOrderStatusRefresh(): void {
    this.ordersRefreshTimer = setInterval(() => {
      if (this.currentView === 'orders' && this.currentUser?.mobile) {
        this.refreshCustomerOrderStatuses();
      }
    }, 5000);
  }

  private refreshCustomerOrderStatuses(): void {
    const mobile = this.currentUser?.mobile;
    if (!mobile) {
      return;
    }

    this.http.get<Array<{
      orderId: string;
      orderStatus: string;
      trackingLink: string;
      payment: { status: string; rejectionReason: string };
    }>>(`${this.apiBaseUrl}/api/orders/status-updates`, { headers: this.getUserHeaders() }).subscribe({
      next: (updates) => {
        const statusByOrderId = new Map(updates.map((update) => [update.orderId, update]));
        this.orderHistory = this.orderHistory.map((order) => {
          const update = statusByOrderId.get(order.orderId);
          if (!update) {
            return order;
          }

          return {
            ...order,
            orderStatus: update.orderStatus,
            trackingLink: update.trackingLink || '',
            payment: {
              ...order.payment,
              status: update.payment.status,
              rejectionReason: update.payment.rejectionReason || ''
            }
          };
        });
        this.profileOrders = this.sortOrdersNewestFirst(
          this.orderHistory.filter((order) => order.customer.mobile === mobile)
        );
      }
    });
  }

  private saveSession() {
    if (!this.currentUser || !this.authToken) {
      localStorage.removeItem('dress_store_user');
      localStorage.removeItem('dress_store_token');
      return;
    }

    localStorage.setItem('dress_store_user', JSON.stringify(this.currentUser));
    localStorage.setItem('dress_store_token', this.authToken);
  }

  private restoreSession() {
    try {
      const savedUser = localStorage.getItem('dress_store_user');
      const savedToken = localStorage.getItem('dress_store_token');
      if (savedUser && savedToken) {
        this.currentUser = JSON.parse(savedUser) as UserAccount;
        this.authToken = savedToken;
      }
    } catch (error) {
      localStorage.removeItem('dress_store_user');
      localStorage.removeItem('dress_store_token');
    }
  }

  private normalizeProductImageUrl(image: string | undefined): string {
    if (!image) {
      return '';
    }

    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:image/')) {
      return image;
    }

    if (image.startsWith('/uploads/')) {
      return `${this.apiBaseUrl}${image}`;
    }

    return image;
  }

  loadProducts() {
    this.http.get<Product[]>(`${this.apiBaseUrl}/api/products`).subscribe({
      next: (data) => {
        this.products = data.map((product) => ({
          ...product,
          image: this.normalizeProductImageUrl(product.image),
          images: (product.images || []).map((image) => this.normalizeProductImageUrl(image))
        }));
        this.updateCartSummary();
      },
      error: () => {
        this.showToast('Unable to load products.');
      }
    });
  }

  loadCategories() {
    this.http.get<string[]>(`${this.apiBaseUrl}/api/categories`).subscribe({
      next: (data) => {
        this.categories = data;
        if (!this.adminProductForm.category) {
          this.adminProductForm.category = 'Traditional Wear';
        }
      },
      error: () => {
        this.categories = ['Traditional Wear', "Men's Shirts", 'Sarees', 'Gowns', 'Maternity Wear', 'Kids Wear'];
      }
    });
  }

  loadOrders() {
    if (!this.adminAuthenticated) {
      return;
    }

    this.http.get<OrderResponse[]>(`${this.apiBaseUrl}/api/admin/orders`, { headers: this.getAdminHeaders() }).subscribe({
      next: (data) => {
        this.orderHistory = this.sortOrdersNewestFirst(data.map((order) => this.normalizeOrder(order)));
        this.syncTrackingDrafts(this.orderHistory);
        this.adminOrders = [...this.orderHistory];
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to load admin orders.');
      }
    });
  }

  loadCustomerOrders() {
    if (!this.currentUser || !this.authToken) {
      return;
    }

    this.http.get<OrderResponse[]>(`${this.apiBaseUrl}/api/orders/my-orders`, { headers: this.getUserHeaders() }).subscribe({
      next: (data) => {
        this.orderHistory = this.sortOrdersNewestFirst(data.map((order) => this.normalizeOrder(order)));
        this.profileMobile = this.currentUser?.mobile || '';
        this.profileOrders = [...this.orderHistory];
      },
      error: (error) => {
        if (error.status === 401) {
          this.currentUser = null;
          this.authToken = '';
          this.saveSession();
        }
      }
    });
  }

  private sortOrdersNewestFirst(orders: OrderResponse[]): OrderResponse[] {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private syncTrackingDrafts(orders: OrderResponse[]) {
    for (const order of orders) {
      if (!(order.orderId in this.trackingDrafts)) {
        this.trackingDrafts[order.orderId] = order.trackingLink || '';
      }
    }
  }

  normalizeOrder(order: any): OrderResponse {
    const customer = order.customer || {
      name: order.customerName || '',
      mobile: order.mobileNumber || '',
      email: order.email || ''
    };

    const address = order.address || {
      houseNumber: '',
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: ''
    };

    const payment = order.payment || {
      method: order.paymentMethod || 'UPI / GPay',
      upiId: this.upiId,
      utrNumber: '',
      paymentScreenshot: '',
      status: order.paymentStatus || 'Verification Pending',
      rejectionReason: ''
    };

    const items = order.items || order.products || [];

    return {
      orderId: order.orderId || '',
      customer,
      address,
      items,
      subtotal: Number(order.subtotal || 0),
      deliveryCharge: Number(order.deliveryCharge || this.deliveryCharge),
      totalAmount: Number(order.totalAmount || 0),
      payment: {
        method: payment.method || order.paymentMethod || 'UPI / GPay',
        upiId: payment.upiId || this.upiId,
        utrNumber: payment.utrNumber || '',
        paymentScreenshot: payment.paymentScreenshot || '',
        status: payment.status || order.paymentStatus || 'Verification Pending',
        rejectionReason: payment.rejectionReason || ''
      },
      orderStatus: order.orderStatus || order.status || 'Payment Verification Pending',
      trackingLink: order.trackingLink || '',
      createdAt: order.createdAt || order.orderDate || new Date().toISOString()
    };
  }

  get cartSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + this.getProductDisplayPrice(item.product) * item.quantity, 0);
  }

  get finalAmount(): number {
    return this.cartSubtotal + this.deliveryCharge;
  }

  get visibleCategories(): string[] {
    return this.selectedCategory === 'All Products' ? this.categories : [this.selectedCategory];
  }

  get adminFilteredProducts(): Product[] {
    const search = this.adminProductSearch.trim().toLowerCase();

    return this.products.filter((product) => {
      const matchesSearch = !search || [product.name, product.sku, product.category].some((value) => value.toLowerCase().includes(search));
      const matchesCategory = this.adminCategoryFilter === 'All Categories' || product.category === this.adminCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  getProductDisplayPrice(product: Product): number {
    return product.discountPrice ?? product.price;
  }

  getOriginalProductPrice(product: Product): number {
    return product.price;
  }

  hasProductPrice(product: Product): boolean {
    return Number(product.price) > 0;
  }

  hasProductDiscount(product: Product): boolean {
    return product.discountPrice !== null && product.discountPrice !== undefined && Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price);
  }

  getProductsForCategory(category: string): Product[] {
    return this.products.filter((product) => product.category === category);
  }

  getCategoryImage(category: string): string {
    return this.getProductsForCategory(category).find((product) => product.image)?.image || this.homeFeatureImage;
  }

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'All Products') {
      return this.products;
    }
    return this.products.filter((product) => product.category === this.selectedCategory);
  }

  getProductDetailsList(product: Product): Array<{ label: string; value: string }> {
    return Object.entries(product.details || {}).map(([key, value]) => ({
      label: this.formatDetailLabel(key),
      value: String(value)
    }));
  }

  formatDetailLabel(key: string): string {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/^./, (char) => char.toUpperCase());
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.selectedProduct = null;
    this.currentView = 'products';
  }

  getColorImageIndex(product: Product | null, color: string): number {
    if (!product || !product.images?.length) {
      return 0;
    }

    if (!color) {
      return 0;
    }

    const colorIndex = product.colors?.indexOf(color) ?? -1;
    if (colorIndex >= 0) {
      return Math.min(colorIndex, product.images.length - 1);
    }

    return 0;
  }

  onColorSelect(color: string) {
    this.selectedColor = color;
    if (this.selectedProduct) {
      this.selectedProduct.details = {
        ...this.selectedProduct.details,
        ['color']: color
      };
      this.selectedProduct.image = this.selectedProduct.images[this.getColorImageIndex(this.selectedProduct, color)] || this.selectedProduct.image;
      this.selectedProductImageIndex = this.getColorImageIndex(this.selectedProduct, color);
    }
  }

  openProductDetails(product: Product) {
    this.selectedProduct = product;
    this.selectedSize = product.sizes?.[0] ?? '';
    this.selectedColor = product.colors?.[0] ?? '';
    if (this.selectedProduct.details && this.selectedColor) {
      this.selectedProduct.details['color'] = this.selectedColor;
    }
    this.selectedProduct.image = product.images[this.getColorImageIndex(product, this.selectedColor)] || product.image;
    this.selectedProductImageIndex = this.getColorImageIndex(product, this.selectedColor);
    this.quantity = 1;
    this.currentView = 'products';
  }

  addToCart(product: Product) {
    if (!this.hasProductPrice(product)) {
      this.showToast('Please contact us to confirm the price.');
      return;
    }

    if (product.stock <= 0) {
      this.showToast('This product is out of stock.');
      return;
    }

    const requestedQuantity = Math.max(1, Math.min(Number(this.quantity) || 1, product.stock));

    if (requestedQuantity > product.stock) {
      this.showToast(`Only ${product.stock} units available.`);
      return;
    }

    const existingItem = this.cart.find(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === this.selectedSize &&
        item.selectedColor === this.selectedColor
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;
      if (newQuantity > product.stock) {
        this.showToast(`Only ${product.stock} units available.`);
        return;
      }
      existingItem.quantity = newQuantity;
    } else {
      this.cart.push({
        product,
        quantity: requestedQuantity,
        selectedSize: product.sizes?.length ? this.selectedSize : undefined,
        selectedColor: product.colors?.length ? this.selectedColor : undefined
      });
    }

    this.updateCartSummary();
    this.showToast(`${product.name} added to cart`);
    this.currentView = 'checkout';
  }

  addToCartFromCard(product: Product) {
    this.selectedSize = product.sizes?.[0] ?? '';
    this.selectedColor = product.colors?.[0] ?? '';
    this.quantity = 1;
    this.addToCart(product);
  }

  updateCartSummary() {
    this.cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = this.cart.reduce((sum, item) => sum + this.getProductDisplayPrice(item.product) * item.quantity, 0);
  }

  showToast(message: string) {
    this.toastMessage = message;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 2000);
  }

  onCheckoutFieldChange(field: keyof typeof this.checkoutForm, value: string) {
    this.checkoutForm[field] = value;
    this.validateCheckoutForm();
  }

  validateCheckoutForm(): boolean {
    const nextErrors: Record<string, string> = {
      customerName: '',
      mobileNumber: '',
      email: '',
      houseNumber: '',
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: ''
    };

    const customerName = this.checkoutForm.customerName.trim();
    if (!customerName) {
      nextErrors['customerName'] = 'Full Name is required.';
    } else if (customerName.length < 2 || !/^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(customerName)) {
      nextErrors['customerName'] = 'Enter a valid full name with at least 2 characters.';
    }

    const mobileNumber = this.checkoutForm.mobileNumber.trim();
    if (!mobileNumber) {
      nextErrors['mobileNumber'] = 'Mobile Number is required.';
    } else if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      nextErrors['mobileNumber'] = 'Enter a valid 10-digit Indian mobile number.';
    }

    const email = this.checkoutForm.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors['email'] = 'Enter a valid email address.';
    }

    if (!this.checkoutForm.houseNumber.trim()) {
      nextErrors['houseNumber'] = 'House/Flat Number is required.';
    }
    if (!this.checkoutForm.street.trim()) {
      nextErrors['street'] = 'Street Address is required.';
    }
    if (!this.checkoutForm.area.trim()) {
      nextErrors['area'] = 'Area is required.';
    }
    if (!this.checkoutForm.city.trim()) {
      nextErrors['city'] = 'City is required.';
    }
    if (!this.checkoutForm.state.trim()) {
      nextErrors['state'] = 'State is required.';
    }

    const pincode = this.checkoutForm.pincode.trim();
    if (!pincode) {
      nextErrors['pincode'] = 'Pincode is required.';
    } else if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      nextErrors['pincode'] = 'Enter a valid 6-digit Indian pincode.';
    }

    this.checkoutErrors = nextErrors;
    return Object.values(nextErrors).every((message) => !message);
  }

  isCheckoutFormValid(): boolean {
    return this.cart.length > 0 && this.validateCheckoutForm();
  }

  proceedToPayment() {
    if (!this.isCheckoutFormValid()) {
      return;
    }

    if (this.checkoutForm.paymentMethod === 'Cash on Delivery') {
      this.submitOrder();
      return;
    }

    this.paymentStep = true;
  }

  openUpiApp() {
    const amount = Number(this.finalAmount || 0);
    const paymentUrl = `upi://pay?pa=${encodeURIComponent(this.upiId)}&pn=${encodeURIComponent(this.upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Dress Purchase')}`;

    try {
      window.location.href = paymentUrl;
      this.showToast('Opening your UPI app to complete payment.');
    } catch (error) {
      this.showToast('Unable to open UPI app. Please copy the UPI ID and pay manually.');
    }
  }

  async copyUpiId() {
    try {
      await navigator.clipboard.writeText(this.upiId);
      this.showToast('UPI ID copied successfully');
    } catch (error) {
      this.showToast('Unable to copy UPI ID.');
    }
  }

  handlePaymentScreenshotUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.paymentProof.paymentScreenshot = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  placeOrder() {
    this.submitOrder();
  }

  submitOrder() {
    if (!this.isCheckoutFormValid()) {
      return;
    }

    if (this.checkoutForm.paymentMethod === 'UPI / GPay') {
      if (!this.paymentProof.paymentScreenshot) {
        this.showToast('Please upload the payment screenshot.');
        return;
      }
    }

    const payload = {
      customer: {
        name: this.checkoutForm.customerName.trim(),
        mobile: this.checkoutForm.mobileNumber.trim(),
        email: this.checkoutForm.email.trim()
      },
      address: {
        houseNumber: this.checkoutForm.houseNumber.trim(),
        street: this.checkoutForm.street.trim(),
        area: this.checkoutForm.area.trim(),
        city: this.checkoutForm.city.trim(),
        state: this.checkoutForm.state.trim(),
        pincode: this.checkoutForm.pincode.trim()
      },
      items: this.cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: this.getProductDisplayPrice(item.product),
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || ''
      })),
      subtotal: this.cartSubtotal,
      deliveryCharge: this.deliveryCharge,
      totalAmount: this.finalAmount,
      payment: {
        method: this.checkoutForm.paymentMethod,
        upiId: this.upiId,
        paymentScreenshot: this.paymentProof.paymentScreenshot
      }
    };

    this.http.post<OrderResponse & { emailStatus?: { sent: boolean; recipient?: string } }>(`${this.apiBaseUrl}/api/orders`, payload).subscribe({
      next: (createdOrder) => {
        this.latestOrder = this.normalizeOrder(createdOrder);
        this.orderPlaced = true;
        this.orderHistory = this.sortOrdersNewestFirst([this.latestOrder, ...this.orderHistory]);
        this.adminOrders = [...this.orderHistory];
        this.profileMobile = this.latestOrder.customer.mobile;
        this.profileOrders = this.orderHistory.filter((order) => order.customer.mobile === this.latestOrder?.customer.mobile);
        this.cart = [];
        this.paymentStep = false;
        this.paymentProof = { utrNumber: '', paymentScreenshot: '' };
        this.updateCartSummary();
        this.currentView = 'orders';

        if (createdOrder.emailStatus?.sent) {
          this.showToast(`Order placed successfully. Confirmation email sent to ${createdOrder.emailStatus.recipient}.`);
        } else {
          this.showToast('Order placed successfully. A confirmation email will be sent once the email service is configured.');
        }

        this.orderConfirmationMessage =
          this.checkoutForm.paymentMethod === 'Cash on Delivery'
            ? 'Your COD order has been placed successfully.'
            : 'Your order has been received. Your payment is being verified. We will confirm your order after payment verification.';

        this.loadProducts();
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to place order.');
      }
    });
  }

  verifyPayment(order: OrderResponse) {
    this.http.patch<OrderResponse>(`${this.apiBaseUrl}/api/orders/${order.orderId}/verify-payment`, {}, { headers: this.getAdminHeaders() }).subscribe({
      next: (updatedOrder) => {
        this.refreshOrders(updatedOrder);
        this.showToast('Payment verified successfully.');
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to verify payment.');
      }
    });
  }

  rejectPayment(order: OrderResponse) {
    const rejectionReason = this.adminRejectionReasons[order.orderId] || '';

    this.http.patch<OrderResponse>(`${this.apiBaseUrl}/api/orders/${order.orderId}/reject-payment`, { rejectionReason }, { headers: this.getAdminHeaders() }).subscribe({
      next: (updatedOrder) => {
        this.refreshOrders(updatedOrder);
        this.showToast('Payment rejected.');
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to reject payment.');
      }
    });
  }

  updateOrderStatus(order: OrderResponse, status: string) {
    this.http.patch<OrderResponse>(`${this.apiBaseUrl}/api/orders/${order.orderId}`, { status }, { headers: this.getAdminHeaders() }).subscribe({
      next: (updatedOrder) => {
        this.refreshOrders(updatedOrder);
        this.showToast(`Order status updated to ${status}.`);
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to update order status.');
      }
    });
  }

  updateTrackingLink(order: OrderResponse, trackingLink: string) {
    this.trackingDrafts[order.orderId] = trackingLink;
  }

  saveTrackingLink(order: OrderResponse) {
    const nextLink = (this.trackingDrafts[order.orderId] || '').trim();
    this.http.patch<OrderResponse>(`${this.apiBaseUrl}/api/orders/${order.orderId}`, { trackingLink: nextLink }, { headers: this.getAdminHeaders() }).subscribe({
      next: (updatedOrder) => {
        this.refreshOrders(updatedOrder);
        this.showToast(nextLink ? 'Tracking link updated.' : 'Tracking link cleared.');
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to update tracking link.');
      }
    });
  }

  searchProfileOrders() {
    const mobile = this.profileMobile.trim();
    const orderId = this.profileOrderId.trim();

    if (this.currentUser?.mobile) {
      this.profileOrders = this.sortOrdersNewestFirst(this.orderHistory.filter((order) =>
        !orderId || order.orderId.toLowerCase() === orderId.toLowerCase()
      ));
      return;
    }

    if (!mobile || !orderId) {
      this.showToast('Enter both your mobile number and exact order ID to find an order.');
      return;
    }

    this.http.get<OrderResponse>(`${this.apiBaseUrl}/api/orders/lookup`, { params: { mobile, orderId } }).subscribe({
      next: (order) => {
        this.profileOrders = [this.normalizeOrder(order)];
      },
      error: (error) => {
        this.profileOrders = [];
        this.showToast(error?.error?.message || 'No matching order found.');
      }
    });
  }

  refreshOrders(updatedOrder: OrderResponse) {
    this.orderHistory = this.sortOrdersNewestFirst(this.orderHistory.map((order) =>
      order.orderId === updatedOrder.orderId ? this.normalizeOrder(updatedOrder) : order
    ));
    this.syncTrackingDrafts(this.orderHistory);
    this.adminOrders = [...this.orderHistory];
    if (this.currentUser?.mobile) {
      this.profileOrders = this.orderHistory.filter((order) => order.customer.mobile === this.currentUser?.mobile);
    }
  }

  changeQuantity(item: CartItem, delta: number) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter((cartItem) => cartItem !== item);
    }
    this.updateCartSummary();
  }

  removeFromCart(item: CartItem) {
    this.cart = this.cart.filter((cartItem) => cartItem !== item);
    this.updateCartSummary();
  }

  getProductsSummary(order: OrderResponse): string {
    return (order.items || []).map((item) => `${item.name} x ${item.quantity}`).join(', ');
  }

  openAdminAccess() {
    this.currentView = 'orders';
    this.selectedProduct = null;

    if (this.adminAuthenticated) {
      this.adminAccessVisible = true;
      this.loadOrders();
      return;
    }

    this.adminAccessVisible = false;
    this.adminError = '';
    this.showToast('Admin access is restricted to admins only.');
  }

  navigateTo(path: string) {
    if (path === 'home') {
      this.currentView = 'home';
      this.selectedProduct = null;
    }
    if (path === 'products') {
      this.currentView = 'products';
      this.selectedProduct = null;
    }
    if (path === 'checkout') {
      this.currentView = 'checkout';
    }
    if (path === 'orders') {
      this.currentView = 'orders';
      if (this.adminAuthenticated) {
        this.loadOrders();
      } else if (this.currentUser?.mobile) {
        this.profileMobile = this.currentUser.mobile;
        this.loadCustomerOrders();
      }
    }
  }

  registerUser() {
    const { username, password, email, fullName, mobile } = this.authForm;
    this.authError = '';

    this.http.post<AuthResponse>(`${this.apiBaseUrl}/api/users/register`, {
      username: username.trim(),
      password,
      email: email.trim(),
      fullName: fullName.trim(),
      mobile: mobile.trim()
    }).subscribe({
      next: (response) => {
        this.currentUser = response.user;
        this.authToken = response.token;
        this.saveSession();
        this.loadCustomerOrders();
        this.authForm = { username: '', password: '', email: '', fullName: '', mobile: '' };
        this.showToast(response.message || 'Registration successful.');
      },
      error: (error) => {
        this.authError = error?.error?.message || 'Unable to register.';
      }
    });
  }

  loginUser() {
    const { username, password } = this.authForm;
    this.authError = '';

    this.http.post<AuthResponse>(`${this.apiBaseUrl}/api/users/login`, {
      username: username.trim(),
      password
    }).subscribe({
      next: (response) => {
        this.currentUser = response.user;
        this.authToken = response.token;
        this.saveSession();
        this.loadCustomerOrders();
        this.authForm = { username: '', password: '', email: '', fullName: '', mobile: '' };
        this.showToast(response.message || 'Login successful.');
      },
      error: (error) => {
        this.authError = error?.error?.message || 'Unable to login.';
      }
    });
  }

  logoutUser() {
    this.currentUser = null;
    this.authToken = '';
    this.saveSession();
    this.showToast('Logged out successfully.');
  }

  loginAdmin() {
    this.adminError = '';
    const username = this.adminUsername.trim();
    const password = this.adminPassword;

    this.http.post<{ token: string; message: string }>(`${this.apiBaseUrl}/api/admin/login`, {
      username,
      password
    }).subscribe({
      next: (response) => {
        this.adminAuthenticated = true;
        this.adminToken = response.token;
        this.adminLoggedInAs = username || 'Admin';
        this.adminUsername = '';
        this.adminPassword = '';
        this.currentView = 'orders';
        this.loadOrders();
      },
      error: (error) => {
        this.adminError = error?.error?.message || 'Unable to login as admin.';
      }
    });
  }

  logoutAdmin() {
    this.adminAuthenticated = false;
    this.adminToken = '';
    this.adminLoggedInAs = '';
    this.adminError = '';
    this.adminAccessVisible = false;
    this.adminProductFormMode = 'add';
    this.adminProductEditId = null;
    this.resetAdminProductForm();
  }

  getAdminHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-admin-token': this.adminToken
    });
  }

  getUserHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-user-token': this.authToken
    });
  }

  resetAdminProductForm() {
    this.adminProductForm = this.createEmptyAdminProductForm(this.adminProductForm.category || 'Traditional Wear');
    this.adminProductFormMode = 'add';
    this.adminProductEditId = null;
  }

  createEmptyAdminProductForm(category: string): AdminProductForm {
    return {
      name: '',
      category,
      description: '',
      price: '',
      discountPrice: '',
      stock: '',
      sku: '',
      sizesText: '',
      colorsText: '',
      images: [],
      details: this.getDefaultDetails(category)
    };
  }

  getDefaultDetails(category: string): Record<string, string> {
    const fields = this.categoryDetailsFields[category] || [];
    return fields.reduce((acc, field) => {
      acc[field.key] = '';
      return acc;
    }, {} as Record<string, string>);
  }

  onAdminCategoryChange() {
    this.adminProductForm.details = this.getDefaultDetails(this.adminProductForm.category);
  }

  handleAdminImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (!files.length) {
      return;
    }

    const readNextFile = (index: number) => {
      if (index >= files.length) {
        input.value = '';
        return;
      }

      const file = files[index];
      const reader = new FileReader();
      reader.onload = () => {
        this.adminProductForm.images.push(String(reader.result || ''));
        readNextFile(index + 1);
      };
      reader.readAsDataURL(file);
    };

    readNextFile(0);
  }

  removeAdminImage(index: number) {
    this.adminProductForm.images.splice(index, 1);
  }

  openAddProduct() {
    this.adminProductFormMode = 'add';
    this.adminProductEditId = null;
    this.adminProductForm = this.createEmptyAdminProductForm(this.categories[0] || 'Traditional Wear');
  }

  openEditProduct(product: Product) {
    this.adminProductFormMode = 'edit';
    this.adminProductEditId = product.id;
    this.adminProductForm = {
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice !== null ? String(product.discountPrice) : '',
      stock: String(product.stock),
      sku: product.sku,
      sizesText: (product.sizes || []).join(', '),
      colorsText: (product.colors || []).join(', '),
      images: [...(product.images || [])],
      details: { ...(product.details || {}) }
    };
  }

  saveProduct() {
    if (!this.adminProductForm.name.trim() || !this.adminProductForm.category.trim() || !this.adminProductForm.description.trim()) {
      this.showToast('Please complete the required product details.');
      return;
    }

    if (!this.adminProductForm.price || Number(this.adminProductForm.price) < 0) {
      this.showToast('Please provide a valid price.');
      return;
    }

    if (!this.adminProductForm.stock || Number(this.adminProductForm.stock) < 0) {
      this.showToast('Please provide a valid stock quantity.');
      return;
    }

    if (!this.adminProductForm.sku.trim()) {
      this.showToast('Please provide a product code / SKU.');
      return;
    }

    const normalizedDiscountPrice = this.adminProductForm.discountPrice == null ? '' : String(this.adminProductForm.discountPrice).trim();

    const payload = {
      id: this.adminProductEditId || undefined,
      name: this.adminProductForm.name.trim(),
      category: this.adminProductForm.category,
      description: this.adminProductForm.description.trim(),
      price: Number(this.adminProductForm.price),
      discountPrice: normalizedDiscountPrice ? Number(normalizedDiscountPrice) : null,
      stock: Number(this.adminProductForm.stock),
      sku: this.adminProductForm.sku.trim(),
      sizes: this.adminProductForm.sizesText
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean),
      colors: this.adminProductForm.colorsText
        .split(',')
        .map((color) => color.trim())
        .filter(Boolean),
      images: this.adminProductForm.images,
      details: this.adminProductForm.details
    };

    const request = this.adminProductEditId
      ? this.http.put<Product>(`${this.apiBaseUrl}/api/admin/products/${this.adminProductEditId}`, payload, { headers: this.getAdminHeaders() })
      : this.http.post<Product>(`${this.apiBaseUrl}/api/admin/products`, payload, { headers: this.getAdminHeaders() });

    request.subscribe({
      next: () => {
        this.loadProducts();
        this.loadCategories();
        this.resetAdminProductForm();
        this.showToast(this.adminProductEditId ? 'Product updated successfully.' : 'Product added successfully.');
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to save product.');
      }
    });
  }

  deleteProduct(product: Product) {
    if (!confirm(`Delete ${product.name}?`)) {
      return;
    }

    this.http.delete(`${this.apiBaseUrl}/api/admin/products/${product.id}`, { headers: this.getAdminHeaders() }).subscribe({
      next: () => {
        this.loadProducts();
        this.loadCategories();
        if (this.selectedProduct?.id === product.id) {
          this.selectedProduct = null;
        }
        this.showToast('Product deleted successfully.');
      },
      error: (error) => {
        this.showToast(error?.error?.message || 'Unable to delete product.');
      }
    });
  }

  viewProduct(product: Product) {
    this.openProductDetails(product);
  }
}
