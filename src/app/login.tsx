import { supabase } from '@/lib/supabase';
import { ColorPalette, fontSize, radius, spacing, useTheme } from '@/lib/theme';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function onLogin() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) Alert.alert('Login failed', error.message);
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.btn} onPress={onLogin} disabled={busy}>
        <Text style={styles.btnText}>{busy ? 'Please wait...' : 'Log in'}</Text>
      </Pressable>
      <Link href="/signup" style={styles.link}>
        New here? Create an account
      </Link>
    </View>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    box: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
      backgroundColor: c.background,
    },
    title: {
      fontSize: fontSize.title,
      fontWeight: '700',
      marginBottom: spacing.sm,
      color: c.text,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      padding: spacing.md,
      color: c.text,
    },
    btn: {
      backgroundColor: c.primary,
      padding: spacing.lg,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    btnText: { color: c.primaryText, fontWeight: '600' },
    link: { textAlign: 'center', color: c.primary, marginTop: spacing.sm },
  });