import { Star } from 'lucide-react';
import { ProviderLayout } from '../../layouts/AppLayout';
import { Avatar, Card, StatCard } from '../../components/ui';

const REVIEWS = [
  { id: 1, customer: 'Vikram S', rating: 5, comment: 'Excellent service! Fixed my phone screen in just 1.5 hours. Very professional.', device: 'Samsung Galaxy S23', date: '2025-06-05' },
  { id: 2, customer: 'Ananya K', rating: 4, comment: 'Good job on the laptop. Took a little longer than expected but quality is great.', device: 'Dell XPS 15', date: '2025-06-02' },
  { id: 3, customer: 'Meena R', rating: 5, comment: 'Replaced battery perfectly. Pickup and delivery was smooth. Highly recommend!', device: 'OnePlus 11 Pro', date: '2025-05-30' },
  { id: 4, customer: 'Surya P', rating: 4, comment: 'MacBook keyboard fixed well. Pricing was fair for the complexity.', device: 'MacBook Pro 14"', date: '2025-05-28' },
  { id: 5, customer: 'Deepa R', rating: 5, comment: 'Super quick turnaround. Very transparent about costs upfront.', device: 'iPhone 14 Pro', date: '2025-05-22' },
];

function Stars({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-surface-200'} />
      ))}
    </div>
  );
}

export function Reviews() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <ProviderLayout title="Reviews">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="col-span-1 flex flex-col items-center justify-center py-6">
          <p className="text-5xl font-bold text-surface-900 mb-1">{avg}</p>
          <Stars rating={Math.round(avg)} size={18} />
          <p className="text-sm text-surface-400 mt-2">Based on {REVIEWS.length} reviews</p>
        </Card>
        <Card className="col-span-2">
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Rating Breakdown</h3>
          {[5,4,3,2,1].map(star => {
            const count = REVIEWS.filter(r => r.rating === star).length;
            const pct = (count / REVIEWS.length) * 100;
            return (
              <div key={star} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-surface-500 w-4">{star}</span>
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-surface-400 w-4">{count}</span>
              </div>
            );
          })}
        </Card>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {REVIEWS.map(r => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <Avatar name={r.customer} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-surface-900">{r.customer}</p>
                  <p className="text-xs text-surface-400">{r.device}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Stars rating={r.rating} />
                <span className="text-xs text-surface-400">{r.date}</span>
              </div>
            </div>
            <p className="text-sm text-surface-600 leading-relaxed">{r.comment}</p>
          </Card>
        ))}
      </div>
    </ProviderLayout>
  );
}
