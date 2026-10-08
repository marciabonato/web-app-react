import { describe, it, expect } from 'vitest';
import {
  productSchema,
  productsResponseSchema,
} from './productSchema';

describe('productSchema - Zod Schemas e Validação', () => {
  it('deve validar com sucesso a estrutura completa de um produto da DummyJSON', () => {
    const validProduct = {
      id: 11,
      title: 'Annibale Colombo Bed',
      description: 'The Annibale Colombo Bed is a luxurious and elegant bed frame.',
      category: 'furniture',
      price: 1899.99,
      discountPercentage: 0.29,
      rating: 4.14,
      stock: 47,
      tags: ['furniture', 'beds'],
      brand: 'Annibale Colombo',
      sku: 'FURN-BED-001',
      weight: 45,
      dimensions: {
        width: 180,
        height: 120,
        depth: 210,
      },
      warrantyInformation: '5 year warranty',
      shippingInformation: 'Ships in 1 month',
      availabilityStatus: 'In Stock',
      reviews: [
        {
          rating: 4,
          comment: 'Great bed!',
          date: '2024-05-23T08:56:21.618Z',
          reviewerName: 'Liam Garcia',
          reviewerEmail: 'liam.garcia@x.dummyjson.com',
        },
      ],
      returnPolicy: '30 days return policy',
      minimumOrderQuantity: 1,
      thumbnail: 'https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Bed/thumbnail.png',
      images: [
        'https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Bed/1.png',
      ],
    };

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(11);
      expect(result.data.title).toBe('Annibale Colombo Bed');
      expect(result.data.price).toBe(1899.99);
    }
  });

  it('deve rejeitar produtos sem campos obrigatórios como id ou title', () => {
    const invalidProduct = {
      description: 'Sem ID e sem título',
      price: 99.9,
    };

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });

  it('deve validar respostas paginadas da DummyJSON com productsResponseSchema', () => {
    const paginatedResponse = {
      products: [
        {
          id: 12,
          title: 'Annibale Colombo Sofa',
          description: 'Luxurious Sofa',
          category: 'furniture',
          price: 2499.99,
          discountPercentage: 5.5,
          rating: 4.7,
          stock: 12,
          tags: ['furniture', 'sofas'],
          thumbnail: 'https://cdn.dummyjson.com/products/images/furniture/sofa/thumbnail.png',
          images: ['https://cdn.dummyjson.com/products/images/furniture/sofa/1.png'],
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    };

    const result = productsResponseSchema.safeParse(paginatedResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.products).toHaveLength(1);
      expect(result.data.total).toBe(1);
    }
  });
});
