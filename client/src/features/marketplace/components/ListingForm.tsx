import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input.js';
import { Button } from '../../../components/ui/Button.js';
import { CreateListingInput } from '../types/marketplace.types.js';
import { MARKETPLACE_CONSTANTS } from '../constants/marketplace.constants.js';

/**
 * Adapted from the OLD project's sell form (`handleSellSubmit` in
 * js/marketplace.js). The old form used an AI crop-metadata lookup to
 * auto-fill an image and category; that lookup is out of scope for this
 * migration (not one of the approved features), so category is a plain
 * select here and the seller enters their own details directly.
 */
export const ListingForm: React.FC<{ onSubmit: (data: CreateListingInput) => Promise<void> | void }> = ({ onSubmit }) => {
  const [form, setForm] = useState<CreateListingInput>({
    title: '',
    category: 'crops',
    price: 0,
    unit: 'kg',
    quantityAvailable: 0,
    location: '',
    sellerPhone: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof CreateListingInput, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError('Please enter a listing title.');
    if (form.price <= 0) return setError('Price must be greater than 0.');
    if (form.quantityAvailable <= 0) return setError('Quantity must be greater than 0.');
    if (!form.location.trim()) return setError('Please enter your location.');

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ title: '', category: 'crops', price: 0, unit: 'kg', quantityAvailable: 0, location: '', sellerPhone: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>
      <Input
        label="Listing Title"
        placeholder="e.g. Premium Basmati Rice"
        value={form.title}
        onChange={e => update('title', e.target.value)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Category</label>
        <select
          value={form.category}
          onChange={e => update('category', e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '0.66rem 1rem',
            color: 'var(--text-main)',
            fontSize: '0.95rem'
          }}
        >
          {MARKETPLACE_CONSTANTS.CATEGORIES.filter(cat => cat !== 'all').map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Input
          label="Price (₹)"
          type="number"
          placeholder="2500"
          value={form.price || ''}
          onChange={e => update('price', Number(e.target.value))}
        />
        <Input label="Unit" placeholder="kg / quintal / unit" value={form.unit} onChange={e => update('unit', e.target.value)} />
      </div>

      <Input
        label="Quantity Available"
        type="number"
        placeholder="10"
        value={form.quantityAvailable || ''}
        onChange={e => update('quantityAvailable', Number(e.target.value))}
      />

      <Input
        label="Location"
        placeholder="District, State"
        value={form.location}
        onChange={e => update('location', e.target.value)}
      />

      <Input
        label="Contact Phone (for WhatsApp / Call)"
        type="tel"
        placeholder="+91 98765 43210"
        value={form.sellerPhone}
        onChange={e => update('sellerPhone', e.target.value)}
      />

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

      <Button type="submit" isLoading={isSubmitting}>
        Post Agri Listing
      </Button>
    </form>
  );
};
