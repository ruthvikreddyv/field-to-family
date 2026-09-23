import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  );
}
