/**
 * src/schemas/productSchema.ts
 *
 * Schemas Zod que espelham exatamente a estrutura retornada pela DummyJSON
 * para os endpoints de Móveis e Decoração.
 *
 * Os tipos TypeScript são derivados automaticamente via `z.infer`, eliminando
 * a necessidade de manutenção paralela de interfaces manuais.
 *
 * Compatível com Zod v4 (zod@4.x).
 */

import { z } from 'zod';

// ─── Sub-schemas reutilizáveis ──────────────────────────────────────────────────

export const productReviewSchema = z.object({
  rating: z.number().min(0).max(5),
  comment: z.string(),
  date: z.string(),
  reviewerName: z.string(),
  reviewerEmail: z.string(), // DummyJSON pode retornar emails não-padrão ou vazios
});

export const productDimensionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  depth: z.number(),
});

// ─── Schema principal do produto ────────────────────────────────────────────────

export const productSchema = z.object({
  /** Identificador único do produto */
  id: z.number().int().positive(),

  /** Nome exibido no catálogo */
  title: z.string().min(1),

  /** Descrição longa do produto */
  description: z.string(),

  /** Categoria: furniture | home-decoration | textiles (+ outras da DummyJSON) */
  category: z.string(),

  /** Preço em USD (DummyJSON) – convertido/exibido em BRL no front */
  price: z.number().nonnegative(),

  /** Percentual de desconto (0-100) */
  discountPercentage: z.number().min(0).max(100).default(0),

  /** Avaliação média (0–5) */
  rating: z.number().min(0).max(5),

  /** Unidades disponíveis em estoque */
  stock: z.number().int().nonnegative(),

  /** Tags para busca e filtragem */
  tags: z.array(z.string()).default([]),

  /** Marca (opcional em alguns produtos DummyJSON) */
  brand: z.string().optional(),

  /** SKU interno */
  sku: z.string().default(''),

  /** Peso em kg */
  weight: z.number().nonnegative().default(0),

  /** Dimensões do produto (pode estar ausente) */
  dimensions: productDimensionsSchema.optional(),

  /** Texto de garantia */
  warrantyInformation: z.string().optional(),

  /** Informações de frete */
  shippingInformation: z.string().optional(),

  /** Disponibilidade textual */
  availabilityStatus: z.string().optional(),

  /** Avaliações individuais de clientes */
  reviews: z.array(productReviewSchema).optional(),

  /** Política de devolução */
  returnPolicy: z.string().optional(),

  /** Quantidade mínima de pedido */
  minimumOrderQuantity: z.number().int().positive().optional(),

  /** URL da imagem de capa (thumbnail) */
  // Usa z.string().min(1) em vez de z.string().url() pois o Zod v4 é mais estrito
  // e rejeita URLs com parâmetros de query como as do Unsplash/DummyJSON CDN.
  thumbnail: z.string().min(1),

  /** Lista de URLs de imagens adicionais */
  images: z.array(z.string().min(1)),
});

// ─── Schema da resposta paginada da DummyJSON ───────────────────────────────────

export const productsResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

// ─── Tipos TypeScript derivados automaticamente ─────────────────────────────────

/** Tipo de um produto individual — derivado do Zod, sem duplicação manual */
export type Product = z.infer<typeof productSchema>;

/** Tipo da revisão de produto */
export type ProductReview = z.infer<typeof productReviewSchema>;

/** Tipo das dimensões do produto */
export type ProductDimensions = z.infer<typeof productDimensionsSchema>;

/** Tipo da resposta paginada */
export type ProductsResponse = z.infer<typeof productsResponseSchema>;
