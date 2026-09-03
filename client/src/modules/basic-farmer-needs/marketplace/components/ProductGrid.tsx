import React from 'react';
import { ProductListing } from '../types/marketplace.types';
import { ProductCard } from './ProductCard';

export const ProductGrid: React.FC<{ products: ProductListing[] }> = ({ products }) => {
  return (
    <div className="product-catalog-grid">
      {products.map(prod => (
        <ProductCard key={prod.id} product={prod} />
      ))}
    </div>
  );
};
