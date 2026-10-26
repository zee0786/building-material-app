import { supabase } from '@/lib/supabase';
import { ColorPalette, fontSize, radius, spacing, useTheme } from '@/lib/theme';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [busy, setBusy] = useState(false);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function onSignup() {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role } },
    });
    setBusy(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }

    if (data.session) {
      Alert.alert('Account created', `Welcome, ${name}!`);
    } else {
      Alert.alert('Check your email', 'We sent a confirmation link. Tap it, then log in.');
    }
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Create account</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
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
        placeholder="Password (min 6 chars)"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.row}>
        {(['buyer', 'seller'] as const).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[styles.chip, role === r && styles.chipOn]}
          >
            <Text style={role === r ? styles.chipTextOn : styles.chipText}>
              {r === 'buyer' ? 'I want to buy' : 'I am a seller'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.btn} onPress={onSignup} disabled={busy}>
        <Text style={styles.btnText}>{busy ? 'Please wait...' : 'Sign up'}</Text>
      </Pressable>
      <Link href="/login" style={styles.link}>
        Already have an account? Log in
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
    row: { flexDirection: 'row', gap: spacing.sm },
    chip: {
      flex: 1,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    chipOn: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.text },
    chipTextOn: { color: c.primaryText, fontWeight: '600' },
    btn: {
      backgroundColor: c.primary,
      padding: spacing.lg,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    btnText: { color: c.primaryText, fontWeight: '600' },
    link: { textAlign: 'center', color: c.primary, marginTop: spacing.sm },
  });