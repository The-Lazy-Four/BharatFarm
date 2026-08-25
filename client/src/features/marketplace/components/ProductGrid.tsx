import React from 'react';
import { ProductListing } from '../types/marketplace.types.js';
import { ProductCard } from './ProductCard.js';

export const ProductGrid: React.FC<{ products: ProductListing[] }> = ({ products }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {products.map(prod => (
        <ProductCard key={prod.id} product={prod} />
      ))}
    </div>
  );
};
