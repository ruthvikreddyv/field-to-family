'use client';
import Link from 'next/link';
import { ShoppingCart, UserCircle2 } from 'lucide-react';
import { useCart } from './cart-context';
export function Header(){const {items}=useCart();return <header className="header"><div className="container nav"><Link href="/" className="brand">Field <span>to</span> Family</Link><nav className="navlinks"><Link href="/shop">Shop</Link><Link href="/track">Track Order</Link><Link href="/about">About</Link><Link href="/bulk">Bulk Orders</Link><Link href="/account"><UserCircle2 size={19}/></Link><Link href="/cart"><ShoppingCart size={19}/><span className="tag">{items.reduce((n,i)=>n+i.quantity,0)}</span></Link></nav><Link href="/cart" className="btn btn-secondary mobile-hide"><ShoppingCart size={18}/>{items.length}</Link></div></header>}
