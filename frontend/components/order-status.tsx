const statuses=['RECEIVED','CONFIRMED','PROCUREMENT','PACKING','OUT_FOR_DELIVERY','DELIVERED'];
const labels={RECEIVED:'Order Received',CONFIRMED:'Confirmed',PROCUREMENT:'Procurement',PACKING:'Packing',OUT_FOR_DELIVERY:'Out for Delivery',DELIVERED:'Delivered'} as Record<string,string>;
export function OrderStatus({status}:{status:string}){const idx=statuses.indexOf(status);return <div className="steps">{statuses.map((s,i)=><div key={s} className={`step ${(idx>=i)?'active':''}`}>{labels[s]}</div>)}</div>}
