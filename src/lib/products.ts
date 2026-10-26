import { supabase } from '@/lib/supabase';

export type Category = { id: number; name: string };

export type Product = {
  id: number;
  name: string;
  unit: string;
  categoryId: number;
  cheapestPrice: number | null; // null = no registered seller has stock
  sellerCount: number;
};

type ProductRow = {
  id: number;
  name: string;
  unit: string;
  category_id: number;
  seller_inventory: { price: number; stock: number }[];
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('id');
  if (error) throw error;
  return data ?? [];
}

export async function fetchProducts(
  search: string,
  categoryId: number | null,
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('id, name, unit, category_id, seller_inventory(price, stock)')
    .order('name');

  // Strip characters that have special meaning in a LIKE pattern
  const term = search.trim().replace(/[%_,]/g, '');
  if (term) query = query.ilike('name', `%${term}%`);
  if (categoryId !== null) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw error;

  return (data as unknown as ProductRow[]).map((row) => {
    const inStock = row.seller_inventory.filter((i) => i.stock > 0);
    return {
      id: row.id,
      name: row.name,
      unit: row.unit,
      categoryId: row.category_id,
      cheapestPrice: inStock.length ? Math.min(...inStock.map((i) => i.price)) : null,
      sellerCount: inStock.length,
    };
  });
}