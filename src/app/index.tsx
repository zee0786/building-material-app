import { ProductCard } from '@/components/ProductCard';
import { Category, fetchCategories, fetchProducts, Product } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { ColorPalette, fontSize, radius, spacing, useTheme } from '@/lib/theme';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable, ScrollView,
  StyleSheet,
  Text, TextInput,
  View,
} from 'react-native';

export default function Home() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setError('Could not load categories'));
  }, []);

  // Wait 300ms after typing stops, so we don't query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reload products when the search text or category changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts(debounced, categoryId)
      .then((rows) => !cancelled && setProducts(rows))
      .catch(() => !cancelled && setError('Could not load products'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [debounced, categoryId]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Find materials</Text>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={styles.link}>Log out</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search cement, tiles, pipes..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={categoryId === null} onPress={() => setCategoryId(null)} styles={styles} />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={categoryId === c.id}
              onPress={() => setCategoryId(c.id)}
              styles={styles}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.center} />
      ) : error ? (
        <Text style={[styles.center, styles.error]}>{error}</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
        />
      )}
    </View>
  );
}

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
};

function Chip({ label, active, onPress, styles }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={active ? styles.chipTextOn : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background, paddingTop: spacing.xl * 2, gap: spacing.md },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    title: { fontSize: fontSize.title, fontWeight: '700', color: c.text },
    link: { color: c.primary },
    input: {
      marginHorizontal: spacing.xl,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      padding: spacing.md,
      color: c.text,
    },
    chips: { paddingHorizontal: spacing.xl, gap: spacing.sm },
    chip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
    },
    chipOn: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.text },
    chipTextOn: { color: c.primaryText, fontWeight: '600' },
    list: { padding: spacing.xl, gap: spacing.md },
    center: { marginTop: spacing.xl * 2, alignSelf: 'center' },
    error: { color: c.danger },
    empty: { textAlign: 'center', color: c.textMuted, marginTop: spacing.xl },
  });