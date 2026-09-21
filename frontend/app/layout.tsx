import './globals.css';
import { CartProvider } from '@/components/cart-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = { title: 'Field to Family', description: 'Fresh vegetables from farm to family' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><CartProvider><Header />{children}</CartProvider></body></html>;
}
