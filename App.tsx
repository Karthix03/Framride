import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Header from './components/common/Header';
import FarmerDashboard from './components/farmer/FarmerDashboard';
import BuyerDashboard from './components/buyer/BuyerDashboard';
import Cart from './components/buyer/Cart';
import Checkout from './components/buyer/Checkout';
import Orders from './components/buyer/Orders';
import Chatbot from './components/ai/Chatbot';
import CropFlowchartGenerator from './components/ai/CropFlowchartGenerator';
import SellProducts from './components/seller/SellProducts';
import { Product, CartItem } from './types';

type AuthScreen = 'login' | 'register';
type AppPage = 'home' | 'products' | 'cart' | 'checkout' | 'orders' | 'chatbot' | 'crop-guide' | 'sell' | 'profile';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    // Save orders to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const handleAddToCart = (product: Product, quantity: number) => {
    const existingItemIndex = cartItems.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      setCartItems(prev => 
        prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      const newCartItem: CartItem = {
        id: `cart-${Date.now()}`,
        product_id: product.id,
        quantity,
        product
      };
      setCartItems(prev => [...prev, newCartItem]);
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleOrderComplete = (order: any) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authScreen === 'login' ? (
      <Login onSwitchToRegister={() => setAuthScreen('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthScreen('login')} />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'cart':
        return (
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onNavigate={setCurrentPage}
          />
        );
      case 'checkout':
        return (
          <Checkout
            cartItems={cartItems}
            onNavigate={setCurrentPage}
            onOrderComplete={handleOrderComplete}
            onClearCart={handleClearCart}
          />
        );
      case 'orders':
        return (
          <Orders
            orders={orders}
            onNavigate={setCurrentPage}
          />
        );
      case 'chatbot':
        return <Chatbot onNavigate={setCurrentPage} />;
      case 'crop-guide':
        return <CropFlowchartGenerator onNavigate={setCurrentPage} />;
      case 'sell':
        return <SellProducts onNavigate={setCurrentPage} />;
      case 'products':
        return (
          <BuyerDashboard
            onNavigate={setCurrentPage}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
          />
        );
      case 'home':
      default:
        if (user.role === 'farmer') {
          return <FarmerDashboard onNavigate={setCurrentPage} />;
        } else {
          return (
            <BuyerDashboard
              onNavigate={setCurrentPage}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
            />
          );
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={setCurrentPage} cartItemsCount={cartItems.length} />
      {renderCurrentPage()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;