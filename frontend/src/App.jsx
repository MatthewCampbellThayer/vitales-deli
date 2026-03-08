import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import KitchenPage from './pages/KitchenPage';

function Layout({ children }) {
  return (
    <>
      <Header />
      <CartDrawer />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Kitchen page has its own full-screen layout */}
          <Route path="/kitchen" element={<KitchenPage />} />

          {/* Customer-facing pages share the Header + Cart */}
          <Route path="/" element={<Layout><MenuPage /></Layout>} />
          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/confirmation/:orderNumber" element={<Layout><ConfirmationPage /></Layout>} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
