import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Linking } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const handleConnectPhantom = async () => {
    // In production, this would deep link to Phantom wallet
    // For now, simulate the flow
    try {
      const phantomUrl = `https://phantom.app/ul/v1/connect?app_url=https://solanaseeker.app&redirect_link=solanaseeker://`;
      const supported = await Linking.canOpenURL(phantomUrl);
      if (supported) {
        await Linking.openURL(phantomUrl);
      } else {
        // Fallback: simulate connection for development
        console.log('Phantom not installed, simulating...');
        onComplete();
      }
    } catch (e) {
      console.error('Error connecting wallet:', e);
      onComplete();
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Background glow effects */}
      <View style={s.glowTop} />
      <View style={s.glowBottom} />

      {/* Content */}
      <View style={s.content}>
        {/* Logo */}
        <View style={s.logoSection}>
          <Text style={s.logo}>⚡</Text>
          <Text style={s.appName}>SOLANA SEEKER</Text>
          <Text style={s.tagline}>Quest. Earn. Rise.</Text>
        </View>

        {/* Features */}
        <View style={s.features}>
          <View style={s.featureRow}>
            <Text style={s.featureIcon}>🎯</Text>
            <View><Text style={s.featureTitle}>Complete Missions</Text><Text style={s.featureDesc}>Daily tasks and quests to earn XP</Text></View>
          </View>
          <View style={s.featureRow}>
            <Text style={s.featureIcon}>🏆</Text>
            <View><Text style={s.featureTitle}>Climb the Ranks</Text><Text style={s.featureDesc}>Compete globally on the leaderboard</Text></View>
          </View>
          <View style={s.featureRow}>
            <Text style={s.featureIcon}>💎</Text>
            <View><Text style={s.featureTitle}>Earn Rewards</Text><Text style={s.featureDesc}>Qualify for future airdrops and prizes</Text></View>
          </View>
        </View>

        {/* CTA */}
        <View style={s.ctaSection}>
          <TouchableOpacity style={s.primaryBtn} onPress={handleConnectPhantom} activeOpacity={0.8}>
            <Text style={s.primaryBtnIcon}>👻</Text>
            <Text style={s.primaryBtnText}>Connect with Phantom</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.secondaryBtn} onPress={onComplete} activeOpacity={0.8}>
            <Text style={s.secondaryBtnText}>Connect Other Wallet</Text>
          </TouchableOpacity>

          <Text style={s.disclaimer}>By connecting, you agree to our Terms of Service</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.background },
  glowTop: { position:'absolute', top:-100, left:width/2-150, width:300, height:300, borderRadius:150, backgroundColor: colors.primary+'15' },
  glowBottom: { position:'absolute', bottom:-50, right:-50, width:200, height:200, borderRadius:100, backgroundColor: colors.secondary+'10' },
  content: { flex:1, justifyContent:'space-between', paddingHorizontal: spacing['2xl'], paddingTop: spacing['6xl'], paddingBottom: spacing['3xl'] },
  logoSection: { alignItems:'center', marginTop: spacing['4xl'] },
  logo: { fontSize:64, marginBottom: spacing.lg },
  appName: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['6xl'], color: colors.textPrimary, letterSpacing:3 },
  tagline: { fontFamily: typography.fontFamily.headingLight, fontSize: typography.sizes.xl, color: colors.primaryDim, marginTop: spacing.sm, letterSpacing:2 },
  features: { gap: spacing.xl },
  featureRow: { flexDirection:'row', alignItems:'center', gap: spacing.lg },
  featureIcon: { fontSize:28, width:44 },
  featureTitle: { fontFamily: typography.fontFamily.headingMedium, fontSize: typography.sizes.lg, color: colors.textPrimary },
  featureDesc: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted, marginTop:2 },
  ctaSection: { gap: spacing.md },
  primaryBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.xl, gap: spacing.md },
  primaryBtnIcon: { fontSize:22 },
  primaryBtnText: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes.lg, color: colors.onPrimary },
  secondaryBtn: { alignItems:'center', justifyContent:'center', paddingVertical: spacing.md, borderRadius: borderRadius.xl, borderWidth:1, borderColor: colors.outline },
  secondaryBtnText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.sizes.lg, color: colors.textSecondary },
  disclaimer: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs, color: colors.textMuted, textAlign:'center', marginTop: spacing.sm },
});
