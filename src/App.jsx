import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, User, Plus, ShoppingCart, Receipt, 
  ClipboardList, Package, Star, TrendingUp, Home, 
  PieChart, CreditCard, Box, ChevronLeft, CheckCircle, 
  Printer, FileText, Edit, Trash2, Banknote, Landmark, 
  MoreHorizontal, Check, X, Camera, Save, Settings, Pencil,
  Calendar, ArrowUpRight, ArrowDownRight, Hourglass, FileX,
  PlusCircle, MinusCircle, Wallet, ClipboardEdit, PackageOpen,
  CloudUpload, Calculator, Barcode, ListTodo, Search, Info,
  ArrowDownUp, Image as ImageIcon,
  Flame, Droplet, Users, Scale, Megaphone, Truck, Wrench, Armchair, Monitor, LayoutGrid, SearchX, UserPlus, Contact,
  BookOpen, UserCircle, ChevronRight, TrendingDown, Minus, Equal, LogOut
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Reusable Components
const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 mt-6">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
      <Icon className="w-10 h-10 text-slate-300" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
    {subtitle && <p className="text-sm font-medium text-slate-500 max-w-[250px] mx-auto leading-relaxed">{subtitle}</p>}
  </div>
);

const Accordion = ({ title, children, defaultOpen = false, rightElement }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-2xl mb-3 bg-white overflow-hidden shadow-sm transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 active:bg-slate-50 transition-colors text-left"
      >
        <span className="font-bold text-slate-800 text-[15px]">{title}</span>
        <div className="flex items-center">
          {rightElement}
          <ChevronDown className={`w-5 h-5 text-slate-400 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
          {children}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, trendValue, trendType, subtitle }) => {
  const getTrendStyles = () => {
    switch (trendType) {
      case 'positive':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: TrendingUp };
      case 'negative':
        return { bg: 'bg-red-100', text: 'text-red-700', Icon: TrendingDown };
      case 'neutral':
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', Icon: Equal };
    }
  };

  const trend = getTrendStyles();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
      <div className="mb-3 flex items-baseline">
        <span className="text-2xl font-black text-slate-800">Q {amount}</span>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        {trendValue && (
          <div className={`flex items-center px-2 py-1 rounded-md ${trend.bg} ${trend.text}`}>
            <trend.Icon className="w-3 h-3 mr-1" />
            <span className="text-[10px] font-bold">{trendValue}</span>
          </div>
        )}
        <span className="text-[10px] font-medium text-slate-400 leading-tight">
          {subtitle}
        </span>
      </div>
    </div>
  );
};

const FloatingActions = ({ onNewSale }) => (
  <div className="fixed bottom-[88px] max-w-md mx-auto w-full flex justify-center gap-3 px-5 z-20 pointer-events-none">
    <button onClick={onNewSale} className="flex-1 flex items-center justify-center bg-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-600/30 pointer-events-auto active:scale-95 transition-transform">
      <PlusCircle className="w-5 h-5 mr-2" />
      Nueva venta
    </button>
    <button onClick={() => window.dispatchEvent(new CustomEvent('openNewExpense'))} className="flex-1 flex items-center justify-center bg-red-800 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-red-900/30 pointer-events-auto active:scale-95 transition-transform">
      <MinusCircle className="w-5 h-5 mr-2" />
      Nuevo gasto
    </button>
  </div>
);


const INITIAL_COMPANIES = [
  { id: 1, name: 'Luces El Tumbador', type: 'Ferretería', phone: '5555-0000', address: '1ra Calle 2-33 Zona 1', city: 'Guatemala', email: 'contacto@luces.com', dpi: '1234567890101', logo: '' },
  { id: 2, name: 'Ferretería Central', type: 'Ferretería', phone: '5555-1111', address: 'Zona 4', city: 'Guatemala', email: 'central@ferre.com', dpi: '', logo: '' }
];

const SortOptionButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-4 rounded-xl text-sm font-bold border-2 transition-colors text-center ${
      isActive ? 'border-sky-400 bg-sky-50 text-blue-950' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-blue-900 shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="w-full bg-white rounded-3xl p-8 shadow-2xl z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Inicia Sesión</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa con tus credenciales de acceso</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-sky-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" 
              placeholder="Ej. admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-sky-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" 
              placeholder="••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/30 active:scale-95 transition-all mt-4 hover:bg-sky-600"
          >
            {loading ? 'Verificando...' : 'Entrar al sistema'}
          </button>
        </form>
      </div>
      <p className="mt-8 text-sky-200 text-sm font-medium z-10">Software de Gestión y Ventas</p>
    </div>
  );
};

export default function App() {
  // Global State
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [activeCompany, setActiveCompany] = useState(companies[0]);
  const [view, setInternalView] = useState('home'); 
  const isPopStateNav = React.useRef(false);

  const setView = (newView) => {
    isPopStateNav.current = false;
    setInternalView(newView);
    if (window.history.state && window.history.state.modal) {
      window.history.replaceState({ view: newView }, '');
    } else {
      window.history.pushState({ view: newView }, '');
    }
  };
  
  React.useEffect(() => {
    window.history.replaceState({ view: 'home' }, '');

    const handler = () => setView('new_expense');
    window.addEventListener('openNewExpense', handler);
    return () => window.removeEventListener('openNewExpense', handler);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [userProfile, setUserProfile] = useState({
    role: 'Propietario',
    avatar: ''
  });
  
  // Modals State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [companyFormMode, setCompanyFormMode] = useState('add'); 
  
  const [isSaleTypeModalOpen, setIsSaleTypeModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isQuoteTypeModalOpen, setIsQuoteTypeModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [cartContext, setCartContext] = useState('sale');
  const [activeSort, setActiveSort] = useState(null);
  const [tempSort, setTempSort] = useState(null);


  // Forms State
  const [companyForm, setCompanyForm] = useState({
    id: null, logo: '', type: '', name: '', phone: '', address: '', city: '', email: '', dpi: ''
  });

  // Expense & Provider State
  const [mockProviders, setMockProviders] = useState([]);
  const [mockExpenses, setMockExpenses] = useState([]);
  const [mockEmployees, setMockEmployees] = useState([]);
  const [mockClients, setMockClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const cid = activeCompany.id || 1;
        const [empRes, provRes, cliRes, expRes, prodRes, salesRes] = await Promise.all([
          fetch(`/api/employees?company_id=${cid}`),
          fetch(`/api/suppliers?company_id=${cid}`),
          fetch(`/api/customers?company_id=${cid}`),
          fetch(`/api/expenses?company_id=${cid}`),
          fetch(`/api/inventory?company_id=${cid}`),
          fetch(`/api/sales?company_id=${cid}`)
        ]);
        
        if (empRes.ok) setMockEmployees(await empRes.json());
        if (provRes.ok) setMockProviders(await provRes.json());
        if (cliRes.ok) setMockClients(await cliRes.json());
        if (expRes.ok) setMockExpenses(await expRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
        if (salesRes.ok) setSales(await salesRes.json());
      } catch (err) {
        console.error('Error fetching data from backend:', err);
      }
    };
    fetchData();
  }, [activeCompany.id]);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isCreateProviderOptionsOpen, setIsCreateProviderOptionsOpen] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');
  
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '', phone: '', document: '', role: 'Vendedor', username: '', password: ''
  });

  const handleEmployeeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!employeeForm.name || !employeeForm.role) return;

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: activeCompany.id || 1,
          ...employeeForm
        })
      });
      if (res.ok) {
        setIsNewEmployeeModalOpen(false);
        const empRes = await fetch(`/api/employees?company_id=${activeCompany.id || 1}`);
        if (empRes.ok) setMockEmployees(await empRes.json());
      }
    } catch (err) {
      console.error('Error creating employee:', err);
    }
  };

  const anyModalOpen = isCompanyModalOpen || isProfileModalOpen || isCompanyFormOpen || isSaleTypeModalOpen || isChangeModalOpen || isQuoteTypeModalOpen || isSortModalOpen || isCategoryModalOpen || isProviderModalOpen || isCreateProviderOptionsOpen || isNewClientModalOpen || isNewEmployeeModalOpen;
  const previousAnyModalOpen = React.useRef(false);
  const anyModalOpenRef = React.useRef(anyModalOpen);
  anyModalOpenRef.current = anyModalOpen;

  React.useEffect(() => {
    if (anyModalOpen && !previousAnyModalOpen.current) {
      window.history.pushState({ modal: true, view }, '');
    } else if (!anyModalOpen && previousAnyModalOpen.current) {
      if (window.history.state && window.history.state.modal) {
        window.history.back();
      }
    }
    previousAnyModalOpen.current = anyModalOpen;
  }, [anyModalOpen, view]);

  React.useEffect(() => {
    const handlePop = (e) => {
      if (anyModalOpenRef.current) {
        setIsCompanyModalOpen(false);
        setIsProfileModalOpen(false);
        setIsCompanyFormOpen(false);
        setIsSaleTypeModalOpen(false);
        setIsChangeModalOpen(false);
        setIsQuoteTypeModalOpen(false);
        setIsSortModalOpen(false);
        setIsCategoryModalOpen(false);
        setIsProviderModalOpen(false);
        setIsCreateProviderOptionsOpen(false);
        setIsNewClientModalOpen(false);
        setIsNewEmployeeModalOpen(false);
      } else {
        if (e.state && e.state.view) {
          isPopStateNav.current = true;
          setInternalView(e.state.view);
        }
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);


  const [expenseForm, setExpenseForm] = useState({
    date: 'Hoy, 07 julio', category: '', value: '', provider: null, concept: ''
  });

  const [providerForm, setProviderForm] = useState({
    name: '', phone: '', documentType: 'NIT', document: '', comments: ''
  });

  // Product Form State
  const [productForm, setProductForm] = useState({
    id: null, name: '', sellPrice: '', code: '', qtyAvailable: '', qtyMin: '', buyPrice: '', category: '', imageFile: null
  });
  
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.sellPrice) return;
    
    const formData = new FormData();
    formData.append('company_id', activeCompany.id || 1);
    formData.append('name', productForm.name);
    formData.append('sell_price', productForm.sellPrice);
    formData.append('code', productForm.code);
    formData.append('stock_qty', productForm.qtyAvailable);
    formData.append('min_qty', productForm.qtyMin);
    formData.append('buy_price', productForm.buyPrice);
    formData.append('category', productForm.category);
    if (productForm.imageFile) {
      formData.append('image', productForm.imageFile);
    }

    try {
      const isEdit = !!productForm.id;
      const url = isEdit ? `/api/inventory/${productForm.id}` : '/api/inventory';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });
      if (res.ok) {
        // Refresh products
        const updatedProductsRes = await fetch(`/api/inventory?company_id=${activeCompany.id || 1}`);
        if (updatedProductsRes.ok) {
          setProducts(await updatedProductsRes.json());
        }
        setProductForm({ id: null, name: '', sellPrice: '', code: '', qtyAvailable: '', qtyMin: '', buyPrice: '', category: '', imageFile: null });
        setView('inventory');
        setIsInventoryEditMode(false);
      } else {
        console.error('Failed to save product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quote State
  const [quoteCart, setQuoteCart] = useState({});
  const [quoteForm, setQuoteForm] = useState({
    expiration: 'No expira', client: null, value: '', discountPercent: '', concept: ''
  });

  // Sale Form State
  const [saleType, setSaleType] = useState('Pagado'); 
  const [saleValue, setSaleValue] = useState('');
  const [saleConcept, setSaleConcept] = useState('');
  const [installments, setInstallments] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [discountPercent, setDiscountPercent] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [amountGiven, setAmountGiven] = useState('');
  const [saleResult, setSaleResult] = useState(null);

  // Local View States
  const [balanceTab, setBalanceTab] = useState('ingresos');
  const [debtTab, setDebtTab] = useState('cobrar');
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [saleCategoryFilter, setSaleCategoryFilter] = useState('Todas');
  const [isInventoryEditMode, setIsInventoryEditMode] = useState(false);

  // Derived Values
  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    
    if (inventoryFilter === 'low_stock') {
      sorted = sorted.filter(p => p.stock_qty <= p.min_qty);
    }
    
    if (view === 'select_products' && saleCategoryFilter !== 'Todas') {
      sorted = sorted.filter(p => p.category === saleCategoryFilter);
    }

    if (!activeSort) return sorted;
    switch (activeSort) {
      case 'stock_asc': sorted.sort((a, b) => a.stock_qty - b.stock_qty); break;
      case 'stock_desc': sorted.sort((a, b) => b.stock_qty - a.stock_qty); break;
      case 'sales_asc': sorted.sort((a, b) => a.id - b.id); break; 
      case 'sales_desc': sorted.sort((a, b) => b.id - a.id); break;
      case 'name_asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'date_asc': sorted.sort((a, b) => a.id - b.id); break;
      case 'date_desc': sorted.sort((a, b) => b.id - a.id); break;
      case 'price_asc': sorted.sort((a, b) => a.sell_price - b.sell_price); break;
      case 'price_desc': sorted.sort((a, b) => b.sell_price - a.sell_price); break;
      default: break;
    }
    return sorted;
  }, [activeSort, products, inventoryFilter]);

  const handleUpdateCart = (productId, delta) => {
    setQuoteCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const prod = products.find(p => p.id === productId);
      if (prod && next > prod.stock_qty) return prev;
      
      const newCart = { ...prev };
      if (next === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = next;
      }
      return newCart;
    });
  };

  const quoteTotalFromCart = useMemo(() => {
    return Object.entries(quoteCart).reduce((acc, [id, qty]) => {
      const prod = products.find(p => p.id === parseInt(id));
      return acc + (prod ? prod.sell_price * qty : 0);
    }, 0);
  }, [quoteCart, products]);
  
  const hasItemsInQuote = Object.keys(quoteCart).length > 0;
  
  const numericQuoteValue = parseFloat(quoteForm.value) || 0;
  const numericQuoteDiscount = parseFloat(quoteForm.discountPercent) || 0;
  
  const finalQuoteTotal = useMemo(() => {
    const baseTotal = hasItemsInQuote ? quoteTotalFromCart : numericQuoteValue;
    if (numericQuoteDiscount > 0) {
      return baseTotal - (baseTotal * (numericQuoteDiscount / 100));
    }
    return baseTotal;
  }, [hasItemsInQuote, quoteTotalFromCart, numericQuoteValue, numericQuoteDiscount]);

  const productTotalCost = useMemo(() => {
    const qty = parseFloat(productForm.qtyAvailable) || 0;
    const cost = parseFloat(productForm.buyPrice) || 0;
    return (qty * cost).toFixed(2);
  }, [productForm.qtyAvailable, productForm.buyPrice]);

  const isProductFormValid = productForm.name.trim() !== '' && parseFloat(productForm.sellPrice) > 0;

  const numericSaleValue = parseFloat(saleValue) || 0;
  const numericDiscount = parseFloat(discountPercent) || 0;
  
  const baseSaleValue = useMemo(() => {
    if (cartContext === 'sale' && hasItemsInQuote) {
      return quoteTotalFromCart;
    }
    return numericSaleValue;
  }, [cartContext, hasItemsInQuote, quoteTotalFromCart, numericSaleValue]);
  
  const finalTotal = useMemo(() => {
    let total = baseSaleValue;
    if (numericDiscount > 0) {
      total = total - (total * (numericDiscount / 100));
    }
    return total;
  }, [baseSaleValue, numericDiscount]);

  const changeToGive = useMemo(() => {
    const given = parseFloat(amountGiven) || 0;
    return given > finalTotal ? given - finalTotal : 0;
  }, [amountGiven, finalTotal]);

  const isExpenseFormValid = expenseForm.category !== '' && parseFloat(expenseForm.value) > 0 && expenseForm.provider !== null;
  const isProviderFormValid = providerForm.name.trim() !== '' && providerForm.phone.trim() !== '';

  const groupedExpenses = useMemo(() => {
    const groups = {};
    mockExpenses.forEach(expense => {
      const pId = expense.provider.id;
      if (!groups[pId]) {
        groups[pId] = {
          provider: expense.provider,
          total: 0,
          count: 0
        };
      }
      groups[pId].total += expense.value;
      groups[pId].count += 1;
    });
    return Object.values(groups);
  }, [mockExpenses]);

  // Handlers
  const handleCreateProvider = () => {
    if (!isProviderFormValid) return;
    const newProvider = { ...providerForm, id: Date.now() };
    setMockProviders([...mockProviders, newProvider]);
    setExpenseForm({ ...expenseForm, provider: newProvider });
    setProviderForm({ name: '', phone: '', documentType: 'NIT', document: '', comments: '' });
    setView('new_expense');
  };

  const handleCreateExpense = () => {
    if (!isExpenseFormValid) return;
    const newExpense = { ...expenseForm, id: Date.now(), value: parseFloat(expenseForm.value) };
    setMockExpenses([...mockExpenses, newExpense]);
    setExpenseForm({ date: 'Hoy, 07 julio', category: '', value: '', provider: null, concept: '' });
    setDebtTab('pagar');
    setView('debts');
  };

  const handleSaleAction = () => {
    if (paymentMethod === 'Efectivo' && saleType === 'Pagado') {
      setIsChangeModalOpen(true);
    } else {
      finalizeSale();
    }
  };

  const finalizeSale = async () => {
    try {
      const items = Object.keys(quoteCart).map(productId => {
        const prod = products.find(p => p.id === parseInt(productId));
        return {
          product_id: prod.id,
          quantity: quoteCart[productId],
          unit_price: prod.sell_price
        };
      });

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: activeCompany.id || 1,
          customer_id: selectedClient?.id || null,
          employee_id: null,
          total_amount: finalTotal,
          payment_method: paymentMethod,
          items: items
        })
      });

      if (res.ok) {
        const data = await res.json();
        const salesRes = await fetch(`/api/sales?company_id=${activeCompany.id || 1}`);
        if (salesRes.ok) setSales(await salesRes.json());
        
        setSaleResult({
          id: data.id,
          concept: saleConcept || `Venta ${data.id}`,
          total: finalTotal,
          date: new Date().toLocaleString(),
          client: selectedClient?.name || 'Consumidor Final',
          method: paymentMethod,
          employee: userProfile.role
        });
        setIsChangeModalOpen(false);
        setView('success_sale');
      }
    } catch (err) {
      console.error('Error saving sale:', err);
    }
  };

  const handleExportPDF = (sale) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(activeCompany.name || 'Empresa', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date(sale.date).toLocaleString()}`, 14, 40);
    doc.text(`Vendedor: ${sale.employee_id || userProfile.role || 'Admin'}`, 14, 48);
    doc.text(`Método de pago: ${sale.payment_method}`, 14, 56);
    doc.text(`Estado: Pagada`, 14, 64);
    doc.text(`Número de transacción: ${sale.id}`, 14, 72);
    doc.text(`Concepto: Venta ${sale.id}`, 14, 80);
    
    doc.setFontSize(16);
    doc.text(`Total: Q ${sale.total_amount.toFixed(2)}`, 14, 100);
    
    doc.save(`comprobante-${sale.id}.pdf`);
  };

  const resetForm = () => {
    setSaleType('Pagado');
    setSaleValue('');
    setSaleConcept('');
    setInstallments(1);
    setPaymentMethod('Efectivo');
    setDiscountPercent('');
    setSelectedClient(null);
    setAmountGiven('');
  };

  const goHome = () => {
    resetForm();
    setView('home');
  };

  const openCompanyForm = (mode, company = null) => {
    setCompanyFormMode(mode);
    if (mode === 'edit' && company) {
      setCompanyForm({ ...company });
    } else {
      setCompanyForm({ id: null, logo: '', type: '', name: '', phone: '', address: '', city: '', email: '', dpi: '' });
    }
    setIsCompanyModalOpen(false);
    setIsProfileModalOpen(false);
    setIsCompanyFormOpen(true);
  };

  const saveCompany = () => {
    if (companyFormMode === 'add') {
      const newCompany = { ...companyForm, id: Date.now() };
      setCompanies([...companies, newCompany]);
      setActiveCompany(newCompany);
    } else {
      const updatedCompanies = companies.map(c => c.id === companyForm.id ? companyForm : c);
      setCompanies(updatedCompanies);
      if (activeCompany.id === companyForm.id) {
        setActiveCompany(companyForm);
      }
    }
    setIsCompanyFormOpen(false);
  };

  // MAIN TABS logic
  const isMainTab = ['home', 'balance', 'debts', 'inventory'].includes(view);

  if (!isAuthenticated) {
    return (
      <LoginScreen onLogin={(user) => {
        setCurrentUser(user);
        setUserProfile({
          role: user.role,
          avatar: ''
        });
        setIsAuthenticated(true);
      }} />
    );
  }

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-slate-50 shadow-2xl overflow-hidden relative text-slate-800 font-sans flex flex-col">
      
      {/* PERSISTENT HEADER */}
      {isMainTab && (
        <header className="bg-sky-400 px-5 pt-8 pb-4 z-10 sticky top-0 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setIsProfileModalOpen(true)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 relative shadow-sm">
              <User className="w-6 h-6 text-slate-800" />
              <div className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full p-0.5">👑</div>
            </button>
            <div>
              <button 
                onClick={() => setIsCompanyModalOpen(true)}
                className="flex items-center text-lg font-bold text-slate-900 leading-tight"
              >
                <span className="truncate max-w-[150px]">{activeCompany.name}</span>
                <ChevronDown className="w-4 h-4 ml-1 opacity-80 flex-shrink-0" />
              </button>
              <p className="text-blue-900/80 text-xs font-semibold mt-0.5">{userProfile.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-900 active:scale-95 transition-transform"><Search className="w-6 h-6" /></button>
            <button className="text-slate-900 active:scale-95 transition-transform"><Pencil className="w-6 h-6" /></button>
          </div>
        </header>
      )}

      {/* VIEW: HOME */}
      {view === 'home' && (
        <main className="flex-1 animate-fade-in px-5 py-6 overflow-y-auto pb-28">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Acceso rápido</h2>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <button 
              onClick={() => setIsSaleTypeModalOpen(true)}
              className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-center leading-tight">Registrar<br/>Venta</span>
            </button>
            <button 
              onClick={() => setView('new_expense')}
              className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-center leading-tight">Registrar<br/>Gasto</span>
            </button>
            <button 
              onClick={() => setView('inventory')}
              className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-center leading-tight">Conteo<br/>Inventario</span>
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-700 mb-4">Estadísticas Rápidas</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
              <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mr-4">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Producto Estrella</p>
                <p className="font-bold text-slate-800">Cemento Tolteca</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Ingresos del Mes</p>
                <p className="font-bold text-slate-800">Q 0.00</p>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-700 mb-4 mt-8">Sugeridos para ti</h2>
          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center justify-center bg-white py-5 px-2 rounded-2xl shadow-sm border border-slate-100 opacity-50 cursor-not-allowed">
              <BookOpen className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-center text-slate-700">Catálogo<br/>Virtual</span>
            </button>
            <button onClick={() => setIsQuoteTypeModalOpen(true)} className="flex flex-col items-center justify-center bg-white py-5 px-2 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform relative">
              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">NUEVO</div>
              <FileText className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-center text-slate-700">Cotizaciones</span>
            </button>
            <button onClick={() => setView('debts')} className="flex flex-col items-center justify-center bg-white py-5 px-2 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
              <Wallet className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-center text-slate-700">Deudas</span>
            </button>
            <button onClick={() => setView('statistics')} className="flex flex-col items-center justify-center bg-white py-5 px-2 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
              <PieChart className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-center text-slate-700">Estadísticas</span>
            </button>
            <button onClick={() => setView('clients')} className="flex flex-col items-center justify-center bg-white py-5 px-2 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
              <Users className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-center text-slate-700">Clientes</span>
            </button>
            <button onClick={() => setView('providers')} className="flex flex-col items-center justify-center bg-white py-5 px-2 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
              <Truck className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-center text-slate-700">Proveedores</span>
            </button>
            <button onClick={() => setView('employees')} className="flex flex-col items-center justify-center bg-white py-5 px-2 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
              <UserCircle className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-center text-slate-700">Empleados</span>
            </button>
          </div>
        </main>
      )}

      {/* VIEW: BALANCE */}
      {view === 'balance' && (
        <main className="flex-1 animate-fade-in overflow-y-auto bg-slate-50 pb-36 relative">
          <div className="flex justify-center items-center py-4 text-slate-600 font-bold bg-white border-b border-slate-100 sticky top-0 z-10">
            <Calendar className="w-4 h-4 mr-2" />
            07 jul
            <ChevronDown className="w-4 h-4 ml-1" />
          </div>

          <div className="p-5">
            <div className="bg-slate-900 rounded-3xl p-6 animate-slide-up hover:shadow-lg transition-all hover:-translate-y-1 text-white mb-6 shadow-xl shadow-slate-900/20">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Balance</p>
              <h2 className="text-4xl font-black mb-6">
                Q {(sales.reduce((acc, s) => acc + s.total_amount, 0) - mockExpenses.reduce((acc, e) => acc + e.amount, 0)).toFixed(2)}
              </h2>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3">
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ingresos</p>
                    <p className="font-bold">Q {sales.reduce((acc, s) => acc + s.total_amount, 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Egresos</p>
                    <p className="font-bold">Q {mockExpenses.reduce((acc, e) => acc + e.amount, 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Descargar Reportes</button>
                <button 
                  onClick={() => setView('balance_detail')} 
                  className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Ver Balance {'>'}
                </button>
              </div>
            </div>

            <div className="flex border-b border-slate-200 mb-2 bg-slate-50 sticky top-[53px] z-10 pt-2">
              <button 
                onClick={() => setBalanceTab('ingresos')}
                className={`flex-1 pb-3 font-bold transition-colors ${balanceTab === 'ingresos' ? 'text-slate-800 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Ingresos
              </button>
              <button 
                onClick={() => setBalanceTab('egresos')}
                className={`flex-1 pb-3 font-bold transition-colors ${balanceTab === 'egresos' ? 'text-slate-800 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Egresos
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {balanceTab === 'ingresos' ? (
                sales.length > 0 ? (
                  sales.map(sale => (
                    <div 
                      key={sale.id} 
                      onClick={() => { setSelectedSale(sale); setView('sale_detail'); }}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Venta {sale.id}</p>
                          <p className="text-xs text-slate-500">{sale.payment_method} • {new Date(sale.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">Q {sale.total_amount.toFixed(2)}</p>
                        <p className="text-xs font-bold text-emerald-600">Pagado</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={Hourglass} title="No tienes ingresos registrados" />
                )
              ) : (
                mockExpenses.length > 0 ? (
                  mockExpenses.map(expense => (
                    <div key={expense.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                          <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{expense.concept}</p>
                          <p className="text-xs text-slate-500">{expense.category} • {new Date(expense.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">Q {expense.amount.toFixed(2)}</p>
                        <p className="text-xs font-bold text-red-600">Pagado</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={Hourglass} title="No tienes egresos registrados" />
                )
              )}
            </div>
          </div>
          <FloatingActions onNewSale={() => setIsSaleTypeModalOpen(true)} />
        </main>
      )}

      {/* VIEW: BALANCE DETAIL */}
      {view === 'balance_detail' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-30 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center sticky top-0 z-20 shadow-sm">
            <button onClick={() => setView('balance')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors mr-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold flex-1 text-slate-800">Detalle del balance</h1>
            <div className="flex items-center text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4 mr-1" />
              07 jul
            </div>
          </header>

          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-12">
            {/* Same Top Card */}
            <div className="bg-slate-900 rounded-3xl p-6 animate-slide-up hover:shadow-lg transition-all hover:-translate-y-1 text-white mb-6 shadow-xl shadow-slate-900/20">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Balance</p>
              <h2 className="text-4xl font-black mb-6">Q 0.00</h2>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3">
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ingresos</p>
                    <p className="font-bold">Q 0.00</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Egresos</p>
                    <p className="font-bold">Q 0.00</p>
                  </div>
                </div>
              </div>
            </div>

            <Accordion title="Ganancia" defaultOpen={true}>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed pt-2">
                Se calcula restando de tus ventas el costo que tienes registrado en los productos.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Ventas</span>
                  <span className="font-bold text-slate-800">Q 0.00</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Costo de productos que vendiste</span>
                  <span className="font-bold text-red-500">Q -0.00</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-slate-800">Ganancia estimada</span>
                  <span className="font-black text-emerald-600 text-lg">Q 0.00</span>
                </div>
              </div>
            </Accordion>

            <Accordion title="Efectivo" rightElement={<span className="font-bold text-slate-600 mr-2">Q 0.00</span>}>
              <p className="text-sm text-slate-500 py-2">Sin movimientos registrados.</p>
            </Accordion>

            <Accordion title="Tarjeta" rightElement={<span className="font-bold text-slate-600 mr-2">Q 0.00</span>}>
              <p className="text-sm text-slate-500 py-2">Sin movimientos registrados.</p>
            </Accordion>

            <Accordion title="Transferencia bancaria" rightElement={<span className="font-bold text-slate-600 mr-2">Q 0.00</span>}>
              <p className="text-sm text-slate-500 py-2">Sin movimientos registrados.</p>
            </Accordion>
          </main>
        </div>
      )}

      {/* VIEW: DEBTS */}
      {view === 'debts' && (
        <main className="flex-1 animate-fade-in overflow-y-auto bg-slate-50 pb-36 relative">
          <div className="bg-white px-5 pt-4 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <div className="flex">
              <button 
                onClick={() => setDebtTab('cobrar')}
                className={`flex-1 pb-3 font-bold transition-colors ${debtTab === 'cobrar' ? 'text-slate-800 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Por cobrar
              </button>
              <button 
                onClick={() => setDebtTab('pagar')}
                className={`flex-1 pb-3 font-bold transition-colors ${debtTab === 'pagar' ? 'text-slate-800 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Por pagar
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {debtTab === 'pagar' && groupedExpenses.length > 0 ? (
              groupedExpenses.map(group => (
                <div key={group.provider.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{group.provider.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{group.count} {group.count === 1 ? 'factura pendiente' : 'facturas pendientes'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-red-500">Q {group.total.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Por pagar</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState 
                icon={Wallet} 
                title={`No tienes deudas por ${debtTab}`} 
                subtitle="Créalas en 'Nuevo gasto' o 'Nueva venta'"
              />
            )}
          </div>
          <FloatingActions onNewSale={() => setIsSaleTypeModalOpen(true)} />
        </main>
      )}

      {/* VIEW: INVENTORY */}
      {view === 'inventory' && (
        <main className="flex-1 animate-fade-in overflow-y-auto bg-slate-50 pb-36 px-4 pt-4 relative flex flex-col">
          {/* Top Actions */}
          <div className="flex gap-2 mb-4">
            <button className="w-12 h-12 flex items-center justify-center border border-slate-900 rounded-xl flex-shrink-0 active:bg-slate-100">
              <ArrowDownRight className="w-6 h-6 text-slate-900" />
            </button>
            <button 
              onClick={() => setIsSaleTypeModalOpen(true)}
              className="flex-1 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <PackageOpen className="w-5 h-5" /> Venta de productos
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-800 mb-2">Total de referencias</p>
              <p className="text-xl font-medium text-slate-500">{products.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-800 mb-2">Costo total</p>
              <p className="text-xl font-bold text-slate-600">Q {products.reduce((acc, p) => acc + (p.buy_price * p.stock_qty), 0)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 hide-scrollbar">
            <button onClick={() => setIsSortModalOpen(true)} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <ArrowDownUp className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsInventoryEditMode(!isInventoryEditMode)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${isInventoryEditMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setInventoryFilter('all')}
              className={`px-4 h-10 font-bold rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${inventoryFilter === 'all' ? 'bg-sky-400 text-slate-900 shadow-sm border-sky-400' : 'bg-white border-slate-200 text-slate-600 border'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setInventoryFilter('low_stock')}
              className={`px-4 h-10 rounded-xl flex items-center justify-center gap-2 flex-shrink-0 font-medium transition-colors ${inventoryFilter === 'low_stock' ? 'bg-sky-400 text-slate-900 shadow-sm border-sky-400' : 'bg-white border-slate-200 text-slate-600 border'}`}
            >
              <Info className="w-4 h-4" /> Unidades bajas
            </button>
          </div>

          {/* Product List */}
          <div className="space-y-3 flex-1">
            {sortedProducts.length === 0 ? (
              <EmptyState 
                icon={PackageOpen} 
                title="Aún no tienes productos creados" 
                subtitle="Empieza agregando uno en el botón 'Crear producto'."
              />
            ) : (
              sortedProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-3 flex gap-4 items-center shadow-sm relative">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-purple-100 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-purple-300 font-black text-4xl">{product.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 py-1">
                    <h3 className="font-bold text-slate-800 text-lg uppercase leading-tight mb-1">{product.name}</h3>
                    <div className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mb-2 ${product.stock_qty <= product.min_qty ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {product.stock_qty} disponibles
                    </div>
                    <p className="font-bold text-slate-800 text-lg">Q {product.sell_price}</p>
                  </div>
                  {product.stock_qty <= product.min_qty && !isInventoryEditMode && (
                    <div className="absolute top-3 right-3 text-red-400">
                      <Info className="w-5 h-5" />
                    </div>
                  )}
                  {isInventoryEditMode && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-end pr-4 z-10">
                      <button 
                        onClick={() => {
                          setProductForm({
                            id: product.id,
                            name: product.name,
                            sellPrice: product.sell_price || '',
                            code: product.code || '',
                            qtyAvailable: product.stock_qty || '',
                            qtyMin: product.min_qty || '',
                            buyPrice: product.buy_price || '',
                            category: product.category || '',
                            imageFile: null
                          });
                          setView('new_product');
                        }}
                        className="w-12 h-12 bg-sky-400 text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-[88px] w-full max-w-md mx-auto px-4 z-20 pointer-events-none left-0 right-0 flex gap-3">
             <button className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-3.5 rounded-2xl font-bold active:scale-95 transition-transform pointer-events-auto">
               Nuevo conteo
             </button>
             <button 
               onClick={() => {
                 setProductForm({ id: null, name: '', sellPrice: '', code: '', qtyAvailable: '', qtyMin: '', buyPrice: '', category: '', imageFile: null });
                 setView('new_product');
               }}
               className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-900/20 active:scale-95 transition-transform pointer-events-auto"
             >
               Crear producto
             </button>
          </div>
        </main>
      )}

      {/* VIEW: NEW EXPENSE */}
      {view === 'new_expense' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-40 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center sticky top-0 z-20 shadow-sm">
            <button onClick={() => setView('debts')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-2">Nuevo gasto</h1>
          </header>
          
          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-6">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Al finalizar te llevaremos a la sección <strong>'Deudas'</strong>.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Fecha del gasto *</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <Calendar className="w-5 h-5 text-slate-400 mr-3" />
                  <span className="font-bold text-slate-700">{expenseForm.date}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Categoría del gasto *</label>
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 active:bg-slate-100 transition-colors text-left"
                >
                  <span className={`font-bold ${expenseForm.category ? 'text-slate-800' : 'text-slate-400'}`}>
                    {expenseForm.category || 'Selecciona una categoría'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Valor *</label>
              <div className="flex items-center border-b-2 border-sky-200 pb-2 mb-2 focus-within:border-sky-400 transition-colors">
                <span className="text-2xl font-bold text-slate-400 mr-2">Q</span>
                <input 
                  type="number" 
                  value={expenseForm.value}
                  onChange={(e) => setExpenseForm({...expenseForm, value: e.target.value})}
                  placeholder="0.00"
                  className="w-full text-3xl font-black text-slate-800 focus:outline-none bg-transparent"
                />
              </div>
              <p className="text-xs font-bold text-slate-400 text-right">Valor total: <span className="text-slate-700">Q {parseFloat(expenseForm.value || 0).toFixed(2)}</span></p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Proveedor *</label>
                <button 
                  onClick={() => setIsProviderModalOpen(true)}
                  className="w-full flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 active:bg-slate-100 transition-colors text-left"
                >
                  <span className={`font-bold ${expenseForm.provider ? 'text-slate-800' : 'text-slate-400'}`}>
                    {expenseForm.provider?.name || 'Selecciona un proveedor'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Concepto</label>
                <input 
                  type="text" 
                  value={expenseForm.concept}
                  onChange={(e) => setExpenseForm({...expenseForm, concept: e.target.value})}
                  placeholder="Dale un nombre a este gasto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all text-sm"
                />
              </div>
            </div>
          </main>

          <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 pb-8 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-20">
             <button 
                onClick={handleCreateExpense}
                disabled={!isExpenseFormValid}
                className={`w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 flex justify-center items-center ${isExpenseFormValid ? 'bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/30' : 'bg-slate-200 text-slate-400 shadow-none'}`}
              >
                Crear gasto
              </button>
          </div>
        </div>
      )}

      {/* VIEW: NEW PROVIDER */}
      {view === 'new_provider' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-[60] animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center sticky top-0 z-20 shadow-sm">
            <button onClick={() => setView('new_expense')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-2">Crear proveedor</h1>
          </header>
          
          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nombre *</label>
                <input 
                  type="text" 
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({...providerForm, name: e.target.value})}
                  placeholder="Nombre de la empresa o contacto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Número de celular *</label>
                <div className="flex gap-2">
                  <select className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 font-medium focus:outline-none focus:border-sky-400 text-center">
                    <option>🇬🇹 +502</option>
                  </select>
                  <input 
                    type="tel" 
                    value={providerForm.phone}
                    onChange={(e) => setProviderForm({...providerForm, phone: e.target.value})}
                    placeholder="0000 0000"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-sky-400 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Identificación</label>
                <div className="flex gap-2">
                  <select 
                    value={providerForm.documentType}
                    onChange={(e) => setProviderForm({...providerForm, documentType: e.target.value})}
                    className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 font-bold focus:outline-none focus:border-sky-400 text-center"
                  >
                    <option value="NIT">NIT</option>
                    <option value="DPI">DPI</option>
                  </select>
                  <input 
                    type="text" 
                    value={providerForm.document}
                    onChange={(e) => setProviderForm({...providerForm, document: e.target.value})}
                    placeholder="Número"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Comentarios</label>
                <textarea 
                  value={providerForm.comments}
                  onChange={(e) => setProviderForm({...providerForm, comments: e.target.value})}
                  placeholder="Detalles importantes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all h-24 resize-none"
                />
              </div>
            </div>
          </main>

          <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 pb-8 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-20">
             <button 
                onClick={handleCreateProvider}
                disabled={!isProviderFormValid}
                className={`w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 flex justify-center items-center ${isProviderFormValid ? 'bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/30' : 'bg-slate-200 text-slate-400 shadow-none'}`}
              >
                Crear proveedor
              </button>
          </div>
        </div>
      )}

      {/* PERSISTENT BOTTOM NAVIGATION */}
      {isMainTab && (
        <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center pb-safe z-40 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.05)]">
          {[
            { id: 'home', icon: Home, label: 'Inicio' },
            { id: 'balance', icon: PieChart, label: 'Balance' },
            { id: 'debts', icon: CreditCard, label: 'Deudas' },
            { id: 'inventory', icon: Box, label: 'Inventario' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex flex-col items-center transition-colors ${view === tab.id ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* VIEW: NEW PRODUCT */}
      {view === 'new_product' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-50 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center sticky top-0 z-20 shadow-sm">
            <button onClick={() => setView('inventory')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors mr-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">{productForm.id ? 'Editar producto' : 'Nuevo producto'}</h1>
          </header>

          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            
            {/* TARJETA 1: Detalles del producto */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
              <label className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-6 flex flex-col items-center justify-center mb-6 cursor-pointer hover:bg-blue-50 transition-colors">
                <CloudUpload className="w-10 h-10 text-blue-400 mb-2" />
                <span className="font-bold text-slate-700">Cargar imagen</span>
                <span className="text-xs text-slate-400 mt-1">{productForm.imageFile ? productForm.imageFile.name : 'Agrega la imagen del producto'}</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProductForm({...productForm, imageFile: e.target.files[0]});
                    }
                  }} 
                />
              </label>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nombre del producto *</label>
                  <input 
                    type="text" 
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Ej. Cemento Portland 50kg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">¿A cuánto lo vendes? *</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 focus-within:border-sky-400 transition-all">
                      <span className="font-bold text-slate-400 mr-2">Q</span>
                      <input 
                        type="number" 
                        value={productForm.sellPrice}
                        onChange={(e) => setProductForm({...productForm, sellPrice: e.target.value})}
                        placeholder="0.00"
                        className="w-full py-3 bg-transparent font-black text-lg focus:outline-none text-slate-800"
                      />
                    </div>
                    <button className="w-[52px] h-[52px] bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0">
                      <Calculator className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TARJETA 2: Variantes */}
            <Accordion 
              title={
                <div className="flex items-center gap-2">
                  Variantes
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">Nuevo</span>
                </div>
              }
            >
              <p className="text-sm text-slate-500 mb-4 pt-1 leading-relaxed">¿Tu producto maneja tallas, colores, peso u otras versiones?</p>
              <button className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center shadow-md active:scale-95 transition-transform">
                <Plus className="w-5 h-5 mr-2" />
                Agregar variantes
              </button>
            </Accordion>

            {/* TARJETA 3: Inventario */}
            <Accordion title="Inventario">
              <div className="space-y-5 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Código de producto</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={productForm.code}
                      onChange={(e) => setProductForm({...productForm, code: e.target.value})}
                      placeholder="Escríbelo o escanéalo"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all text-sm"
                    />
                    <button className="w-[52px] h-[52px] bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0">
                      <Barcode className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cant. disponible</label>
                    <input 
                      type="number" 
                      value={productForm.qtyAvailable}
                      onChange={(e) => setProductForm({...productForm, qtyAvailable: e.target.value})}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all text-center text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cant. mínima</label>
                    <input 
                      type="number" 
                      value={productForm.qtyMin}
                      onChange={(e) => setProductForm({...productForm, qtyMin: e.target.value})}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all text-center text-lg font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">¿A cuánto lo compras?</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 focus-within:border-sky-400 transition-all mb-3">
                    <span className="font-bold text-slate-400 mr-2">Q</span>
                    <input 
                      type="number" 
                      value={productForm.buyPrice}
                      onChange={(e) => setProductForm({...productForm, buyPrice: e.target.value})}
                      placeholder="0.00"
                      className="w-full py-3 bg-transparent font-bold text-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                  <p className="text-sm font-bold text-slate-500 text-right">
                    Costo total: <span className="text-emerald-700 font-black ml-1">Q {productTotalCost}</span>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Categoría</label>
                  <div className="relative">
                    <select 
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 font-medium focus:outline-none focus:border-sky-400 appearance-none text-slate-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="materiales">Materiales de Construcción</option>
                      <option value="herramientas">Herramientas</option>
                      <option value="electricidad">Electricidad</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </Accordion>

            {/* TARJETA 4: Catálogo virtual */}
            <Accordion title="Catálogo virtual">
              <p className="text-sm text-slate-500 pt-1 pb-3 leading-relaxed">Opciones para publicar tu producto en el catálogo en línea para tus clientes.</p>
            </Accordion>

          </main>

          {/* FOOTER FIJO */}
          <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 pb-8 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-20">
             <button 
                disabled={!isProductFormValid}
                onClick={handleSaveProduct}
                className={`w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 flex justify-center items-center ${isProductFormValid ? 'bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/30' : 'bg-slate-200 text-slate-400 shadow-none'}`}
              >
                {productForm.id ? 'Guardar cambios' : 'Crear producto'}
              </button>
          </div>
        </div>
      )}

      {/* VIEW: SELECT PRODUCTS (QUOTE/SALE) */}
      {view === 'select_products' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-50 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
              <button onClick={goHome} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold ml-2">Seleccionar productos</h1>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full"><Search className="w-5 h-5"/></button>
              <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full"><Barcode className="w-5 h-5"/></button>
            </div>
          </header>

          <main className="flex-1 animate-fade-in overflow-y-auto pb-32">
            <div className="px-5 pt-4">
              {cartContext === 'quote' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-5">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Al crear la cotización <strong>No se descontarán</strong> las unidades seleccionadas del inventario.
                  </p>
                </div>
              )}

              <button 
                onClick={() => {
                  setProductForm({ id: null, name: '', sellPrice: '', code: '', qtyAvailable: '', qtyMin: '', buyPrice: '', category: '', imageFile: null });
                  setView('new_product');
                }}
                className="w-full py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold shadow-sm active:bg-slate-50 transition-colors mb-5"
              >
                + Nuevo producto
              </button>
            </div>

            <div className="px-5 mb-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 pl-5 pr-5">
              <button 
                onClick={() => { setTempSort(activeSort); setIsSortModalOpen(true); }} 
                className={`p-2 border rounded-full flex-shrink-0 transition-colors ${activeSort ? 'bg-sky-50 border-sky-300 text-sky-600' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-200 flex-shrink-0 mx-1"></div>
              
              {['Todas', 'Materiales', 'Herramientas'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSaleCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${saleCategoryFilter === cat ? 'bg-sky-400 text-blue-950' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
              
              <button className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-full flex-shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 space-y-3 relative">
              {Object.keys(quoteCart).length === 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -mt-4 flex flex-col items-center pointer-events-none z-10 animate-bounce-short">
                  <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg mb-1 relative">
                    Selecciona el producto.
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
                  </div>
                </div>
              )}

              {sortedProducts.map(product => {
                const qty = quoteCart[product.id] || 0;
                const limitReached = qty >= product.stock_qty;
                
                return (
                  <div key={product.id} className={`bg-white rounded-2xl p-4 flex gap-4 border shadow-sm items-center transition-colors ${qty > 0 ? 'border-sky-300 bg-sky-50/10' : 'border-slate-100'}`}>
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{product.name}</h4>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 ${limitReached ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {product.stock_qty} disponibles
                      </span>
                      <p className="font-black text-slate-700">Q {(product.sell_price || 0).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-10">
                      <button 
                        onClick={() => handleUpdateCart(product.id, -1)}
                        className={`w-10 h-full flex items-center justify-center ${qty > 0 ? 'text-slate-700 active:bg-slate-200' : 'text-slate-300'}`}
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                      <span className={`w-6 text-center font-bold text-sm ${limitReached ? 'text-red-600' : ''}`}>{qty}</span>
                      <button 
                        disabled={limitReached}
                        onClick={() => handleUpdateCart(product.id, 1)}
                        className={`w-10 h-full flex items-center justify-center ${limitReached ? 'text-slate-200' : 'text-slate-700 active:bg-slate-200'}`}
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 pb-8 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-20">
             <button 
                disabled={!hasItemsInQuote}
                onClick={() => {
                  if (cartContext === 'quote') {
                    setView('new_quote');
                  } else {
                    const totalQty = Object.values(quoteCart).reduce((a, b) => a + b, 0);
                    setSaleConcept(`Venta de ${totalQty} productos`);
                    setView('new_free_sale');
                  }
                }}
                className={`w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 flex justify-center items-center ${hasItemsInQuote ? 'bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/30' : 'bg-slate-200 text-slate-400 shadow-none'}`}
              >
                Añadir productos Q {quoteTotalFromCart.toFixed(2)} {'>'}
              </button>
          </div>
        </div>
      )}

      {/* VIEW: NEW QUOTE FORM */}
      {view === 'new_quote' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-50 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center sticky top-0 z-20 shadow-sm">
            <button 
              onClick={() => {
                if (hasItemsInQuote) setView('select_products');
                else goHome();
              }} 
              className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-2">Nueva cotización</h1>
          </header>

          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Fecha de la cotización</label>
              <p className="font-bold text-slate-800 text-lg">07 julio 2026</p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Tiempo de expiración de cotización</label>
              <div className="flex flex-wrap gap-2">
                {['1 semana', '15 días', '1 mes', 'No expira'].map(time => (
                  <button
                    key={time}
                    onClick={() => setQuoteForm({...quoteForm, expiration: time})}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${quoteForm.expiration === time ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cliente *</label>
              <div className="relative">
                <select 
                  value={quoteForm.client?.id || ''}
                  onChange={(e) => setQuoteForm({...quoteForm, client: CLIENTS.find(c => c.id === parseInt(e.target.value)) || CLIENTS[3]})}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 font-bold focus:outline-none focus:border-sky-400 appearance-none text-slate-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  <option value="" disabled>Seleccionar cliente</option>
                  {CLIENTS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
              {!hasItemsInQuote ? (
                <>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Valor *</label>
                  <div className="flex items-center border-b-2 border-slate-200 pb-2 mb-5 focus-within:border-sky-400 transition-colors">
                    <span className="text-2xl font-bold text-slate-400 mr-2">Q</span>
                    <input 
                      type="number" 
                      value={quoteForm.value}
                      onChange={(e) => setQuoteForm({...quoteForm, value: e.target.value})}
                      placeholder="0.00"
                      className="w-full text-3xl font-black text-slate-800 focus:outline-none bg-transparent"
                    />
                  </div>
                </>
              ) : (
                <div className="mb-5 flex justify-between items-center border-b-2 border-slate-100 pb-4">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Subtotal productos</span>
                  <span className="font-black text-xl text-slate-800">Q {quoteTotalFromCart.toFixed(2)}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Desc. (%)</label>
                  <input 
                    type="number"
                    value={quoteForm.discountPercent}
                    onChange={(e) => setQuoteForm({...quoteForm, discountPercent: e.target.value})}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Valor total</label>
                  <span className="font-black text-emerald-600 text-xl">Q {finalQuoteTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Concepto</label>
              <input 
                type="text" 
                value={quoteForm.concept}
                onChange={(e) => setQuoteForm({...quoteForm, concept: e.target.value})}
                placeholder="Dale un nombre a tu cotización"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
              />
            </div>

          </main>

          <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 pb-8 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-20">
             <button 
                disabled={finalQuoteTotal <= 0}
                onClick={goHome} // MOCK SUBMIT
                className={`w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 flex justify-center items-center ${finalQuoteTotal > 0 ? 'bg-sky-400 hover:bg-sky-500 text-blue-950 shadow-lg shadow-sky-400/30' : 'bg-slate-200 text-slate-400 shadow-none'}`}
              >
                Crear cotización Q {finalQuoteTotal.toFixed(2)} {'>'}
              </button>
          </div>
        </div>
      )}

      {/* VIEW: NEW FREE SALE */}
      {view === 'new_free_sale' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-50 animate-in slide-in-from-right">
          <header className="bg-white px-5 pt-10 pb-4 border-b border-slate-200 flex items-center sticky top-0 z-20 shadow-sm">
            <button onClick={goHome} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-2">Nueva Venta</h1>
          </header>

          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            <div className="flex bg-slate-200 p-1 rounded-full mb-6 relative">
              <button 
                onClick={() => setSaleType('Pagado')}
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-all z-10 ${saleType === 'Pagado' ? 'text-emerald-700 shadow-sm bg-white' : 'text-slate-500'}`}
              >
                [Pagado]
              </button>
              <button 
                onClick={() => setSaleType('Deuda')}
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-all z-10 ${saleType === 'Deuda' ? 'text-red-700 shadow-sm bg-white' : 'text-slate-500'}`}
              >
                [Deuda]
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
              {cartContext === 'sale' && hasItemsInQuote ? (
                <div className="mb-5 flex justify-between items-center border-b-2 border-slate-100 pb-4">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Subtotal productos</span>
                  <span className="font-black text-xl text-slate-800">Q {quoteTotalFromCart.toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Valor (Q)</label>
                  <div className="flex items-center border-b-2 border-sky-200 pb-2 mb-5 focus-within:border-sky-400 transition-colors">
                    <span className="text-2xl font-bold text-slate-400 mr-2">Q</span>
                    <input 
                      type="number" 
                      value={saleValue}
                      onChange={(e) => setSaleValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full text-3xl font-black text-slate-800 focus:outline-none bg-transparent"
                    />
                  </div>
                </>
              )}
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Concepto</label>
              <input 
                type="text" 
                value={saleConcept}
                onChange={(e) => setSaleConcept(e.target.value)}
                placeholder="Ej. Venta de materiales..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>

            {saleType === 'Deuda' && (
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Número de Pagos</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <button
                      key={num}
                      onClick={() => setInstallments(num)}
                      className={`w-10 h-10 rounded-full font-bold transition-colors ${installments === num ? 'bg-sky-400 text-blue-950 shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Método de Pago</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'Efectivo', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                  { id: 'Tarjeta', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { id: 'Transferencia', icon: Landmark, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
                  { id: 'Otro', icon: MoreHorizontal, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? `${method.border} ${method.bg} shadow-sm scale-100` : 'border-slate-100 bg-white scale-95 opacity-70 hover:opacity-100'}`}
                  >
                    <method.icon className={`w-6 h-6 mb-2 ${paymentMethod === method.id ? method.color : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold ${paymentMethod === method.id ? 'text-slate-800' : 'text-slate-500'}`}>{method.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Desc. (%)</label>
                <input 
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cliente</label>
                <div className="relative">
                  <select 
                    value={selectedClient?.id || ''}
                    onChange={(e) => setSelectedClient(mockClients.find(c => c.id === parseInt(e.target.value)) || null)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 font-bold focus:outline-none focus:border-sky-400 appearance-none text-slate-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    <option value="">Selecciona un cliente</option>
                    {mockClients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </main>

          <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 pb-8 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-20">
             <button 
                onClick={handleSaleAction}
                disabled={finalTotal <= 0}
                className="w-full bg-sky-400 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-blue-950 font-black text-lg py-4 rounded-2xl shadow-lg shadow-sky-400/30 transition-all active:scale-95 flex justify-center items-center"
              >
                Crear venta • Q {finalTotal.toFixed(2)}
              </button>
          </div>
        </div>
      )}

      {/* VIEW: SUCCESS SALE */}
      {view === 'success_sale' && saleResult && (
        <div className="flex flex-col h-full bg-emerald-500 absolute inset-0 z-50 animate-in fade-in zoom-in-95">
          <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 animate-bounce-short">
              <Check className="w-12 h-12 text-emerald-500" strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-black text-white mb-8 text-center drop-shadow-sm">¡Creaste una venta!</h1>
            
            <div className="bg-white w-full rounded-3xl p-6 shadow-2xl text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-sky-400"></div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Resumen de la Venta</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-500">ID Venta</span>
                  <span className="font-bold text-slate-800">{saleResult.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Concepto</span>
                  <span className="font-bold text-slate-800 text-right max-w-[60%] truncate">{saleResult.concept || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 bg-emerald-50/50 -mx-6 px-6 py-2">
                  <span className="text-emerald-700 font-bold">Valor Total</span>
                  <span className="font-black text-xl text-emerald-700">Q {saleResult.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Cliente</span>
                  <span className="font-bold text-slate-800">{saleResult.client || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Método</span>
                  <span className="font-bold text-slate-800">{saleResult.method || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Empleado</span>
                  <span className="font-bold text-slate-800">{saleResult.employee || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 w-full bg-white rounded-t-3xl p-6 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
            <button 
              onClick={goHome}
              className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl active:bg-slate-200 transition-colors mt-2"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PROFILE */}
      {isProfileModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsProfileModalOpen(false)}></div>
          <div className="bg-white rounded-t-3xl w-full p-6 relative animate-in slide-in-from-bottom shadow-2xl">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-6">Información de perfil</h3>
            
            <div className="space-y-4">
              {userProfile.role === 'Propietario' && (
                <button 
                  onClick={() => openCompanyForm('add')}
                  className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-2xl active:bg-slate-50"
                >
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-slate-800">Agregar otro negocio</h4>
                    <p className="text-xs text-slate-500">Crear una nueva empresa</p>
                  </div>
                </button>
              )}

              <button className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-2xl active:bg-slate-50">
                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mr-4">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-bold text-slate-800">Tipo de Rol</h4>
                  <p className="text-xs text-slate-500">Actual: {userProfile.role}</p>
                </div>
              </button>

              <button className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-2xl active:bg-slate-50">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-bold text-slate-800">Colocar Foto de Perfil</h4>
                  <p className="text-xs text-slate-500">Actualizar avatar</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  setIsAuthenticated(false);
                  setCurrentUser(null);
                  setIsProfileModalOpen(false);
                }}
                className="w-full flex items-center p-4 bg-white border border-red-200 rounded-2xl active:bg-red-50 mt-4"
              >
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-bold text-red-600">Cerrar sesión</h4>
                  <p className="text-xs text-red-400">Salir de la cuenta actual</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPANIES BOTTOM SHEET */}
      {isCompanyModalOpen && (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCompanyModalOpen(false)}></div>
          <div className="bg-white rounded-t-3xl w-full p-6 relative animate-in slide-in-from-bottom shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Cambiar sucursal</h3>
            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto">
              {companies.map(company => (
                <div key={company.id} className={`w-full flex items-center justify-between p-2 rounded-2xl border-2 transition-all ${activeCompany.id === company.id ? 'border-sky-400 bg-sky-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                  <button 
                    onClick={() => {
                      setActiveCompany(company);
                      setIsCompanyModalOpen(false);
                    }}
                    className="flex items-center flex-1 p-2 text-left"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${activeCompany.id === company.id ? 'bg-sky-400 text-blue-950' : 'bg-slate-100 text-slate-500'}`}>
                      <Box className="w-5 h-5" />
                    </div>
                    <span className={`font-bold ${activeCompany.id === company.id ? 'text-blue-950' : 'text-slate-700'}`}>{company.name}</span>
                  </button>
                  {activeCompany.id === company.id && userProfile.role === 'Propietario' && (
                    <button 
                      onClick={() => openCompanyForm('edit', company)}
                      className="p-3 text-sky-600 hover:bg-sky-100 rounded-full mr-1 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {userProfile.role === 'Propietario' && (
              <button 
                onClick={() => openCompanyForm('add')}
                className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir nueva empresa
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT COMPANY FORM */}
      {isCompanyFormOpen && (
        <div className="absolute inset-0 z-[70] flex flex-col bg-slate-50 animate-in slide-in-from-right">
          <header className="bg-white px-5 pt-10 pb-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setIsCompanyFormOpen(false)} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold ml-2">{companyFormMode === 'add' ? 'Nuevo Negocio' : 'Editar Negocio'}</h1>
            </div>
            <button onClick={saveCompany} className="text-emerald-600 font-bold flex items-center">
              <Save className="w-5 h-5 mr-1" />
              Guardar
            </button>
          </header>

          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden mb-3">
                {companyForm.logo ? (
                  <img src={companyForm.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <button className="text-sm font-bold text-sky-600">Cambiar Imagen/Logo</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nombre de Negocio</label>
                <input 
                  type="text" 
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                  placeholder="Ej. Mi Ferretería..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tipo de Negocio</label>
                <input 
                  type="text" 
                  value={companyForm.type}
                  onChange={(e) => setCompanyForm({...companyForm, type: e.target.value})}
                  placeholder="Ej. Ferretería, Tienda, etc."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Número de Celular</label>
                <input 
                  type="tel" 
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                  placeholder="Ej. 5555-0000"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Dirección</label>
                <input 
                  type="text" 
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                  placeholder="Calle, Avenida, Zona..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ciudad</label>
                  <input 
                    type="text" 
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({...companyForm, city: e.target.value})}
                    placeholder="Ciudad"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">DPI / NIT</label>
                  <input 
                    type="text" 
                    value={companyForm.dpi}
                    onChange={(e) => setCompanyForm({...companyForm, dpi: e.target.value})}
                    placeholder="1234..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all shadow-sm"
                />
              </div>
            </div>
            
          </main>
        </div>
      )}

      {/* MODAL: SALE TYPE BOTTOM SHEET */}
      {isSaleTypeModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSaleTypeModalOpen(false)}></div>
          <div className="bg-white rounded-t-3xl w-full p-6 relative animate-in slide-in-from-bottom shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">¿Qué deseas registrar?</h3>
            <div className="space-y-3 mb-4">
              <button 
                onClick={() => {
                  setIsSaleTypeModalOpen(false);
                  setCartContext('sale');
                  setQuoteCart({});
                  setView('select_products');
                }}
                className="w-full flex items-center p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center mr-4">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-emerald-950">Venta de productos</h4>
                  <p className="text-xs text-emerald-900/70">Seleccionar del inventario</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  setIsSaleTypeModalOpen(false);
                  setCartContext('sale');
                  setQuoteCart({});
                  setView('new_free_sale');
                }}
                className="w-full flex items-center p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mr-4">
                  <Banknote className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-700">Venta libre</h4>
                  <p className="text-xs text-slate-500">Ingresar valor directo</p>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  setIsSaleTypeModalOpen(false);
                  setIsQuoteTypeModalOpen(true);
                }}
                className="w-full flex items-center p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-700">Cotizaciones</h4>
                  <p className="text-xs text-slate-500">Crear o gestionar proformas</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUOTE TYPE BOTTOM SHEET */}
      {isQuoteTypeModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsQuoteTypeModalOpen(false)}></div>
          <div className="bg-white rounded-t-3xl w-full p-6 relative animate-in slide-in-from-bottom shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Nueva cotización</h3>
            <p className="text-sm text-slate-500 mb-6">Selecciona el tipo de cotización que quieres hacer.</p>
            
            <div className="space-y-3 mb-4">
              <button 
                onClick={() => {
                  setIsQuoteTypeModalOpen(false);
                  setCartContext('quote');
                  setQuoteCart({});
                  setView('select_products');
                }}
                className="w-full flex items-center p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mr-4">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-700">Cotización con productos</h4>
                  <p className="text-xs text-slate-500">Seleccionando de tu inventario</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  setIsQuoteTypeModalOpen(false);
                  setQuoteCart({});
                  setView('new_quote');
                }}
                className="w-full flex items-center p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mr-4">
                  <ListTodo className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-700">Cotización libre</h4>
                  <p className="text-xs text-slate-500">Sin seleccionar inventario</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE CALCULATOR */}
      {isChangeModalOpen && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsChangeModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full p-6 relative animate-in zoom-in-95 shadow-2xl">
            <button 
              onClick={() => setIsChangeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 p-2 hover:bg-slate-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <Banknote className="w-8 h-8 text-sky-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-1">Calcula el cambio</h3>
            <p className="text-slate-500 text-center text-sm mb-6">Total a cobrar: <span className="font-bold text-slate-800">Q {finalTotal.toFixed(2)}</span></p>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block text-center">¿Con cuánto paga tu cliente?</label>
            <div className="flex items-center justify-center border-b-2 border-slate-200 pb-2 mb-8 focus-within:border-sky-400 transition-colors w-3/4 mx-auto">
              <span className="text-2xl font-bold text-slate-400 mr-2">Q</span>
              <input 
                type="number" 
                value={amountGiven}
                onChange={(e) => setAmountGiven(e.target.value)}
                placeholder="0.00"
                className="w-full text-4xl font-black text-slate-800 text-center focus:outline-none bg-transparent"
                autoFocus
              />
            </div>
            <div className={`p-4 rounded-2xl mb-6 text-center ${changeToGive >= 0 && amountGiven ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cambio a entregar</p>
              <p className={`text-3xl font-black ${changeToGive >= 0 && amountGiven ? 'text-emerald-600' : 'text-slate-400'}`}>
                Q {changeToGive.toFixed(2)}
              </p>
            </div>
            <button 
              onClick={finalizeSale}
              disabled={parseFloat(amountGiven || 0) < finalTotal}
              className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
            >
              Confirmar y Finalizar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORIES */}
      {isCategoryModalOpen && (
        <div className="absolute inset-0 z-[70] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="bg-white rounded-t-2xl w-full relative animate-in slide-in-from-bottom flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Escoge una categoría</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto pb-8">
              {[
                { name: 'Servicios públicos', icon: Droplet },
                { name: 'Compra de productos e insumos', icon: Package },
                { name: 'Arriendo', icon: Home },
                { name: 'Nómina', icon: Users },
                { name: 'Gastos administrativos', icon: Scale },
                { name: 'Mercadeo y publicidad', icon: Megaphone },
                { name: 'Transporte, domicilios y logística', icon: Truck },
                { name: 'Mantenimiento y reparaciones', icon: Wrench },
                { name: 'Muebles, equipos o maquinaria', icon: Monitor },
                { name: 'Otros', icon: LayoutGrid },
              ].map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setExpenseForm({ ...expenseForm, category: cat.name });
                    setIsCategoryModalOpen(false);
                  }}
                  className="w-full flex items-center px-5 py-4 border-b border-slate-50 active:bg-slate-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${expenseForm.category === cat.name ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-sm flex-1 text-left ${expenseForm.category === cat.name ? 'text-sky-600' : 'text-slate-700'}`}>{cat.name}</span>
                  {expenseForm.category === cat.name && <CheckCircle className="w-5 h-5 text-sky-500 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROVIDERS */}
      {isProviderModalOpen && (
        <div className="absolute inset-0 z-[70] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsProviderModalOpen(false)}></div>
          <div className="bg-white rounded-t-2xl w-full relative animate-in slide-in-from-bottom flex flex-col h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex flex-col bg-white rounded-t-2xl sticky top-0 z-10 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Escoge un proveedor</h3>
                <button onClick={() => setIsProviderModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  placeholder="Buscar proveedor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-medium focus:outline-none focus:border-sky-400 transition-all text-sm"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {mockProviders.filter(p => p.name.toLowerCase().includes(providerSearch.toLowerCase())).length === 0 ? (
                <EmptyState 
                  icon={SearchX} 
                  title="No encontramos resultados." 
                  subtitle="Intenta con otro nombre o crea el proveedor."
                />
              ) : (
                mockProviders.filter(p => p.name.toLowerCase().includes(providerSearch.toLowerCase())).map(provider => (
                  <button 
                    key={provider.id}
                    onClick={() => {
                      setExpenseForm({ ...expenseForm, provider });
                      setIsProviderModalOpen(false);
                    }}
                    className="w-full flex items-center px-5 py-4 border-b border-slate-50 active:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-4 text-slate-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800 text-sm">{provider.name}</p>
                      <p className="text-xs text-slate-400">{provider.documentType}: {provider.document}</p>
                    </div>
                    {expenseForm.provider?.id === provider.id && <CheckCircle className="w-5 h-5 text-sky-500 ml-auto" />}
                  </button>
                ))
              )}
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white shrink-0">
              <button 
                onClick={() => {
                  setIsProviderModalOpen(false);
                  setIsCreateProviderOptionsOpen(true);
                }}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 font-bold py-4 rounded-xl active:scale-95 transition-all"
              >
                Crear nuevo proveedor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PROVIDER OPTIONS */}
      {isCreateProviderOptionsOpen && (
        <div className="absolute inset-0 z-[80] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateProviderOptionsOpen(false)}></div>
          <div className="bg-white rounded-t-2xl w-full relative animate-in slide-in-from-bottom flex flex-col">
            <div className="p-5 pb-8 space-y-3">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <button 
                onClick={() => {
                  setIsCreateProviderOptionsOpen(false);
                  setView('new_provider');
                }}
                className="w-full flex items-center p-4 rounded-2xl border border-slate-200 bg-white active:bg-slate-50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Crear contacto</h4>
                  <p className="text-xs text-slate-500">Añadir los datos manualmente</p>
                </div>
              </button>

              <button 
                className="w-full flex items-center p-4 rounded-2xl border border-slate-200 bg-white active:bg-slate-50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4">
                  <Contact className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Importar contacto</h4>
                  <p className="text-xs text-slate-500">Desde la agenda de tu teléfono</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: STATISTICS */}
      {view === 'statistics' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-40 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setView('home')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold ml-2">Estadísticas</h1>
            </div>
            <div className="flex items-center text-slate-500 text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 mr-2" />
              07 jul
            </div>
          </header>
          
          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatCard 
                title="Total ventas" 
                amount="0.00" 
                trendValue="" 
                trendType="neutral"
                subtitle="Sin datos"
              />
              <StatCard 
                title="Ganancias" 
                amount="0.00" 
                trendValue="" 
                trendType="neutral"
                subtitle="Sin datos"
              />
            </div>
            
            <div className="mb-4">
              <StatCard 
                title="Total gastos" 
                amount="0.00" 
                trendValue="= 0%" 
                trendType="neutral"
                subtitle="No tienes gastos registrados"
              />
            </div>

            <div className="mb-4">
              <StatCard 
                title="Ventas por empleado" 
                amount="0.00" 
                trendValue="" 
                trendType="neutral"
                subtitle="Propietario (100%)"
              />
            </div>
          </main>
        </div>
      )}

      {/* VIEW: SALE DETAIL */}
      {view === 'sale_detail' && selectedSale && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-50 animate-in slide-in-from-right">
          <header className="bg-sky-400 px-5 py-4 border-b border-sky-500 flex items-center sticky top-0 z-20 shadow-sm">
            <button onClick={() => setView('balance')} className="p-2 -ml-2 text-blue-950 active:bg-sky-500 rounded-full transition-colors mr-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold flex-1 text-blue-950">Detalle de la venta</h1>
          </header>

          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-28">
            <div className="bg-white rounded-3xl p-6 animate-slide-up hover:shadow-md transition-shadow shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Resumen de la venta</h2>
              <p className="text-xs text-slate-400 mb-6 pb-4 border-b border-slate-100">Transacción #{selectedSale.id}</p>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Concepto</p>
                  <p className="font-bold text-slate-800 text-lg">Venta {selectedSale.id}</p>
                </div>

                <div className="pb-6 border-b border-slate-100 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Valor</p>
                    <p className="font-black text-3xl text-slate-800">Q{selectedSale.total_amount}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                    Pagada
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-500">
                      <Calendar className="w-4 h-4 mr-2" /> Fecha y hora
                    </div>
                    <span className="font-bold text-slate-800">{new Date(selectedSale.date).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-500">
                      <Banknote className="w-4 h-4 mr-2" /> Método de pago
                    </div>
                    <span className="font-bold text-slate-800">{selectedSale.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-500">
                      <Users className="w-4 h-4 mr-2" /> Cliente
                    </div>
                    <span className="font-bold text-slate-800">{selectedSale.customer_name || 'Consumidor Final'}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-20 flex justify-around">
            <button className="flex flex-col items-center p-2 text-slate-800">
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center mb-1">
                <Printer className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold">Imprimir</span>
            </button>
            <button 
              onClick={() => handleExportPDF(selectedSale)}
              className="flex flex-col items-center p-2 text-slate-800"
            >
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center mb-1">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold">Comprobante</span>
            </button>
            <button className="flex flex-col items-center p-2 text-slate-800">
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center mb-1">
                <Edit className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold">Editar</span>
            </button>
            <button className="flex flex-col items-center p-2 text-red-500">
              <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center mb-1">
                <Trash2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold">Eliminar</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: CLIENTES */}
      {view === 'clients' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-40 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setView('home')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold ml-2">Clientes</h1>
            </div>
            <button onClick={() => setIsNewClientModalOpen(true)} className="p-2 text-blue-600 active:bg-blue-50 rounded-full transition-colors">
              <UserPlus className="w-6 h-6" />
            </button>
          </header>
          
          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
              />
            </div>

            <div className="space-y-3">
              {mockClients.map(client => (
                <div key={client.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold text-lg">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{client.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Tel: {client.phone || 'No registrado'}</p>
                  </div>
                  {client.balance > 0 && (
                    <div className="ml-3 text-right">
                      <p className="text-[10px] font-bold text-red-500 uppercase">Saldo pendiente</p>
                      <p className="font-black text-red-600">Q {client.balance}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* VIEW: PROVEEDORES */}
      {view === 'providers' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-40 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setView('home')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold ml-2">Proveedores</h1>
            </div>
            <button onClick={() => setView('new_provider')} className="p-2 text-purple-600 active:bg-purple-50 rounded-full transition-colors">
              <UserPlus className="w-6 h-6" />
            </button>
          </header>
          
          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar proveedor..." 
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700"
              />
            </div>

            <div className="space-y-3">
              {mockProviders.map(provider => (
                <div key={provider.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold text-lg">
                    {provider.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{provider.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Tel: {provider.phone || 'No registrado'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{provider.type}: {provider.document}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* VIEW: EMPLEADOS */}
      {view === 'employees' && (
        <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-40 animate-in slide-in-from-right">
          <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setView('home')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold ml-2">Empleados</h1>
            </div>
            <button 
              onClick={() => {
                setSelectedEmployee(null);
                setEmployeeForm({ name: '', phone: '', document: '', role: 'Vendedor', username: '', password: '' });
                setIsNewEmployeeModalOpen(true);
              }} 
              className="p-2 text-indigo-600 active:bg-indigo-50 rounded-full transition-colors"
            >
              <UserPlus className="w-6 h-6" />
            </button>
          </header>
          
          <main className="flex-1 animate-fade-in overflow-y-auto px-5 py-6 pb-32">
            <div className="space-y-3">
              {mockEmployees.map(emp => (
                <div key={emp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative">
                  <button 
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setIsNewEmployeeModalOpen(true);
                    }}
                    className="absolute top-4 right-2 p-2 text-slate-400 hover:text-slate-600 rounded-full active:bg-slate-50"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="flex items-center mb-3 pr-8">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold text-lg">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{emp.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-700">
                      Q {emp.salary}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* MODAL: NUEVO CLIENTE */}
      {isNewClientModalOpen && (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNewClientModalOpen(false)}></div>
          <div className="bg-white rounded-t-2xl w-full h-[90%] relative animate-in slide-in-from-bottom flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Nuevo Cliente</h3>
              <button onClick={() => setIsNewClientModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nombre del cliente *</label>
                <input type="text" placeholder="Ej. Juan Pérez" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Teléfono</label>
                <input type="tel" placeholder="Ej. 1234-5678" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">NIT / Documento</label>
                <input type="text" placeholder="Ej. 123456-7" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Dirección</label>
                <textarea rows="2" placeholder="Opcional" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700 resize-none"></textarea>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-white shrink-0">
              <button onClick={() => setIsNewClientModalOpen(false)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95 transition-transform flex justify-center items-center">
                Guardar cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO EMPLEADO */}
      {isNewEmployeeModalOpen && (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNewEmployeeModalOpen(false)}></div>
          <div className="bg-slate-50 rounded-t-2xl w-full h-[95%] relative animate-in slide-in-from-bottom flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white shrink-0 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button onClick={() => setIsNewEmployeeModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form id="employeeForm" onSubmit={handleEmployeeSubmit} className="p-5 space-y-4">
                
                <div className="space-y-4 p-4 border border-slate-200 rounded-2xl bg-white mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nombre completo *</label>
                    <input type="text" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} required className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Teléfono</label>
                    <input type="tel" value={employeeForm.phone} onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">DPI / Documento</label>
                    <input type="text" value={employeeForm.document} onChange={e => setEmployeeForm({...employeeForm, document: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Rol en la empresa *</label>
                    <select value={employeeForm.role} onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700 bg-white appearance-none">
                      <option value="Vendedor">Vendedor</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 p-4 border border-slate-200 rounded-2xl bg-white mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">Credenciales de Acceso (Opcional)</h4>
                  <p className="text-xs text-slate-500">Asigna un usuario para que este empleado pueda iniciar sesión.</p>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Usuario</label>
                    <input type="text" value={employeeForm.username} onChange={e => setEmployeeForm({...employeeForm, username: e.target.value})} placeholder="Ej. vendedor1" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Contraseña</label>
                    <input type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} placeholder="••••••" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-0 outline-none transition-colors font-medium text-slate-700" />
                  </div>
                </div>
                
              </form>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-white shrink-0">
              <button type="submit" form="employeeForm" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform flex justify-center items-center">
                {selectedEmployee ? 'Guardar cambios' : 'Guardar empleado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ORDENAR INVENTARIO */}
      {isSortModalOpen && (
        <div className="absolute inset-0 z-[70] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSortModalOpen(false)}></div>
          <div className="bg-white rounded-t-2xl w-full relative animate-in slide-in-from-bottom flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Ordenar inventario</h3>
                <p className="text-xs text-slate-500">Solo puedes aplicar un orden a la vez</p>
              </div>
              <button onClick={() => setIsSortModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Por stock</h4>
                <div className="grid grid-cols-2 gap-3">
                  <SortOptionButton label="Menos stock" isActive={tempSort === 'stock_asc'} onClick={() => setTempSort('stock_asc')} />
                  <SortOptionButton label="Más stock" isActive={tempSort === 'stock_desc'} onClick={() => setTempSort('stock_desc')} />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Por ventas (últimos 30 días)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <SortOptionButton label="Menos vendidos" isActive={tempSort === 'sales_asc'} onClick={() => setTempSort('sales_asc')} />
                  <SortOptionButton label="Más vendidos" isActive={tempSort === 'sales_desc'} onClick={() => setTempSort('sales_desc')} />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Por nombre</h4>
                <div className="grid grid-cols-2 gap-3">
                  <SortOptionButton label="Nombre A-Z" isActive={tempSort === 'name_asc'} onClick={() => setTempSort('name_asc')} />
                  <SortOptionButton label="Nombre Z-A" isActive={tempSort === 'name_desc'} onClick={() => setTempSort('name_desc')} />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Por fecha de creación</h4>
                <div className="grid grid-cols-2 gap-3">
                  <SortOptionButton label="Más antiguo" isActive={tempSort === 'date_asc'} onClick={() => setTempSort('date_asc')} />
                  <SortOptionButton label="Más reciente" isActive={tempSort === 'date_desc'} onClick={() => setTempSort('date_desc')} />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Por precio</h4>
                <div className="grid grid-cols-2 gap-3">
                  <SortOptionButton label="Más bajo" isActive={tempSort === 'price_asc'} onClick={() => setTempSort('price_asc')} />
                  <SortOptionButton label="Más alto" isActive={tempSort === 'price_desc'} onClick={() => setTempSort('price_desc')} />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white space-y-3 shrink-0">
              <button 
                onClick={() => {
                  setActiveSort(tempSort);
                  setIsSortModalOpen(false);
                }}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
              >
                Aplicar
              </button>
              <button 
                onClick={() => {
                  setActiveSort(null);
                  setIsSortModalOpen(false);
                }}
                className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-4 rounded-xl active:bg-slate-50 transition-all"
              >
                Limpiar orden
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
