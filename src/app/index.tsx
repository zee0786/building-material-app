import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { ColorPalette, fontSize, spacing, useTheme } from '@/lib/theme';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const { session, role } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>Logged in as {session?.user.email}</Text>
      <Text style={styles.text}>Role: {role ?? 'loading...'}</Text>
      <Pressable onPress={() => supabase.auth.signOut()}>
        <Text style={styles.link}>Log out</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    box: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.background,
    },
    heading: { fontSize: fontSize.xl, color: c.text },
    text: { color: c.text },
    link: { color: c.primary },
  });