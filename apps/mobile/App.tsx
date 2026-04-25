import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors, typography, spacing, borderRadius } from './src/theme';
import { useAuthStore } from './src/store';
import HomeScreen from './src/screens/HomeScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TasksScreen from './src/screens/TasksScreen';
import QuizScreen from './src/screens/QuizScreen';
import ReferralScreen from './src/screens/ReferralScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
    },
  },
});

type Tab = 'home' | 'tasks' | 'leaderboard' | 'rewards' | 'profile';
type Modal = 'quiz' | 'referral' | 'premium' | null;

function AppContent() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeModal, setActiveModal] = useState<Modal>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={s.splash}>
        <Text style={s.splashLogo}>⚡</Text>
        <Text style={s.splashTitle}>SOLANA SEEKER</Text>
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
      </View>
    );
  }

  if (!isAuthenticated || showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setShowOnboarding(false);
          useAuthStore.getState().setAuthenticated(true);
        }}
      />
    );
  }

  // Modal overlay screens
  if (activeModal === 'quiz') {
    return (
      <View style={s.main}>
        <QuizScreen />
        <TouchableOpacity style={s.closeModal} onPress={() => setActiveModal(null)}>
          <Text style={s.closeModalText}>✕ Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activeModal === 'referral') {
    return (
      <View style={s.main}>
        <ReferralScreen />
        <TouchableOpacity style={s.closeModal} onPress={() => setActiveModal(null)}>
          <Text style={s.closeModalText}>✕ Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activeModal === 'premium') {
    return (
      <View style={s.main}>
        <PremiumScreen />
        <TouchableOpacity style={s.closeModal} onPress={() => setActiveModal(null)}>
          <Text style={s.closeModalText}>✕ Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen onOpenModal={setActiveModal} />;
      case 'tasks': return <TasksScreen />;
      case 'leaderboard': return <LeaderboardScreen />;
      case 'rewards': return <RewardsScreen onUpgrade={() => setActiveModal('premium')} />;
      case 'profile': return <ProfileScreen onOpenModal={setActiveModal} />;
      default: return <HomeScreen onOpenModal={setActiveModal} />;
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'tasks', label: 'Missions', icon: '⚡' },
    { key: 'leaderboard', label: 'Rank', icon: '🏆' },
    { key: 'rewards', label: 'Rewards', icon: '💎' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={s.main}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={s.screenArea}>{renderScreen()}</View>
      <View style={s.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={s.tabItem}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabIcon, activeTab === tab.key && s.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppContent />
    </QueryClientProvider>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: { fontSize: 72 },
  splashTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['4xl'],
    color: colors.textPrimary,
    letterSpacing: 3,
    marginTop: 16,
  },
  main: { flex: 1, backgroundColor: colors.background },
  screenArea: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface + 'F8',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
    paddingBottom: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabIcon: { fontSize: 20, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: 9,
    color: colors.textMuted,
  },
  tabLabelActive: { color: colors.primary },
  closeModal: {
    position: 'absolute',
    top: spacing['3xl'],
    right: spacing.lg,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    zIndex: 100,
  },
  closeModalText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
