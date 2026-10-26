import type { Product } from '@/lib/products';
import { ColorPalette, fontSize, radius, spacing, useTheme } from '@/lib/theme';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { product: Product };

function ProductCardBase({ product }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const available = product.cheapestPrice !== null;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.meta}>per {product.unit}</Text>
      </View>
      {available ? (
        <View style={styles.right}>
          <Text style={styles.price}>₹{product.cheapestPrice}</Text>
          <Text style={styles.meta}>
            {product.sellerCount} {product.sellerCount === 1 ? 'seller' : 'sellers'}
          </Text>
        </View>
      ) : (
        <Text style={styles.unavailable}>Not available with our sellers</Text>
      )}
    </View>
  );
}

export const ProductCard = memo(ProductCardBase);

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    info: { flex: 1, gap: spacing.xs },
    right: { alignItems: 'flex-end', gap: spacing.xs },
    name: { fontSize: fontSize.lg, fontWeight: '600', color: c.text },
    meta: { fontSize: fontSize.sm, color: c.textMuted },
    price: { fontSize: fontSize.xl, fontWeight: '700', color: c.primary },
    unavailable: {
      flexShrink: 1,
      maxWidth: 120,
      textAlign: 'right',
      fontSize: fontSize.sm,
      color: c.danger,
    },
  });