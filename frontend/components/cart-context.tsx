'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product } from '@/lib/types';

type Ctx={items:CartItem[]; add:(p:Product)=>void; addQuantity:(p:Product,q:number)=>void; remove:(id:number)=>void; setQty:(id:number,q:number)=>void; clear:()=>void; subtotal:number};
const CartCtx=createContext<Ctx|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){
  const [items,setItems]=useState<CartItem[]>([]);
  useEffect(()=>{try{const raw=localStorage.getItem('f2f-cart');if(raw)setItems(JSON.parse(raw))}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem('f2f-cart',JSON.stringify(items))}catch{}},[items]);
  const add=(product:Product)=>setItems(xs=>{const x=xs.find(i=>i.product.id===product.id);const step=Number(product.quantity_step);return x?xs.map(i=>i.product.id===product.id?{...i,quantity:Number((i.quantity+step).toFixed(3))}:i):[...xs,{product,quantity:Number(product.minimum_quantity)}]});
  const addQuantity=(product:Product,q:number)=>setItems(xs=>{const x=xs.find(i=>i.product.id===product.id);return x?xs.map(i=>i.product.id===product.id?{...i,quantity:Number((i.quantity+q).toFixed(3))}:i):[...xs,{product,quantity:q}]});
  const remove=(id:number)=>setItems(xs=>xs.filter(i=>i.product.id!==id));
  const setQty=(id:number,q:number)=>setItems(xs=>xs.map(i=>i.product.id===id?{...i,quantity:q}:i));
  const clear=()=>setItems([]);
  const subtotal=useMemo(()=>items.reduce((s,i)=>s+i.quantity*Number(i.product.selling_price),0),[items]);
  return <CartCtx.Provider value={{items,add,addQuantity,remove,setQty,clear,subtotal}}>{children}</CartCtx.Provider>
}
export const useCart=()=>{const c=useContext(CartCtx);if(!c)throw new Error('CartProvider missing');return c};
