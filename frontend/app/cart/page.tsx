'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart-context';
import { money } from '@/lib/api';

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();

  if (!items.length) {
    return (
      <main className="page">
        <div className="container empty">
          <div style={{ fontSize: 50 }}>🧺</div>
          <h1>Your cart is empty</h1>
          <p className="muted">Fresh vegetables are waiting.</p>
          <Link href="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <h1 className="h2">Your cart</h1>

        <div className="checkout-grid">
          <div className="card card-pad">
            {items.map((item) => {
              const step = Number(item.product.quantity_step);
              const minimum = Number(item.product.minimum_quantity);
              const price = Number(item.product.selling_price);

              return (
                <div key={item.product.id} className="row">
                  <div>
                    <b>{item.product.name}</b>
                    <div className="small muted">
                      {money(price)} / {item.product.unit}
                    </div>
                  </div>

                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => {
                        const nextQuantity = item.quantity - step;
                        if (nextQuantity < minimum) {
                          remove(item.product.id);
                        } else {
                          setQty(item.product.id, Number(nextQuantity.toFixed(3)));
                        }
                      }}
                      aria-label={`Decrease ${item.product.name}`}
                    >
                      <Minus size={15} />
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      type="button"
                      onClick={() =>
                        setQty(
                          item.product.id,
                          Number((item.quantity + step).toFixed(3)),
                        )
                      }
                      aria-label={`Increase ${item.product.name}`}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <b>{money(item.quantity * price)}</b>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => remove(item.product.id)}
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}

            <div className="divider" />
            <p className="small muted">
              Payment: <b>Pay on delivery</b>. No card, UPI or bank details are
              required.
            </p>
          </div>

          <aside className="card card-pad summary">
            <h3>Order summary</h3>
            <div className="row">
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div className="row">
              <span>Delivery</span>
              <b>₹0.00</b>
            </div>
            <div className="row">
              <span>Discount</span>
              <b>₹0.00</b>
            </div>
            <div className="divider" />
            <div className="row total">
              <span>Total</span>
              <span>{money(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
            >
              Continue to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
