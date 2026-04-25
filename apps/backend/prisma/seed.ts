import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============ Create Admin Users ============
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.adminUser.upsert({
    where: { email: 'admin@solanaseeker.app' },
    update: {},
    create: {
      email: 'admin@solanaseeker.app',
      passwordHash,
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
    },
  });

  // ============ Create Default Badges ============
  const badges = [
    { name: 'First Task', description: 'Completed your first task', icon: 'stars', rarity: 'COMMON' as const, condition: { type: 'first_task' } },
    { name: '7-Day Streak', description: 'Maintained a 7-day login streak', icon: 'local_fire_department', rarity: 'UNCOMMON' as const, condition: { type: 'streak', days: 7 } },
    { name: '14-Day Streak', description: 'Maintained a 14-day login streak', icon: 'local_fire_department', rarity: 'RARE' as const, condition: { type: 'streak', days: 14 } },
    { name: '30-Day Streak', description: 'Maintained a 30-day login streak', icon: 'whatshot', rarity: 'EPIC' as const, condition: { type: 'streak', days: 30 } },
    { name: 'Top 10%', description: 'Reached the top 10% of all seekers', icon: 'leaderboard', rarity: 'RARE' as const, condition: { type: 'top_percent', rank: 10 } },
    { name: 'Early Seeker', description: 'Joined during the early phase', icon: 'rocket_launch', rarity: 'EPIC' as const, condition: { type: 'xp_total', amount: 0 } },
    { name: 'Quiz Master', description: 'Completed 10 quizzes with perfect scores', icon: 'psychology', rarity: 'RARE' as const, condition: { type: 'xp_total', amount: 5000 } },
    { name: 'Solana Explorer', description: 'Made 100+ on-chain transactions', icon: 'explore', rarity: 'UNCOMMON' as const, condition: { type: 'xp_total', amount: 2000 } },
    { name: 'Referral Builder', description: 'Referred 5 active users', icon: 'group_add', rarity: 'RARE' as const, condition: { type: 'referrals', count: 5 } },
    { name: 'Premium Seeker', description: 'Subscribed to premium', icon: 'workspace_premium', rarity: 'EPIC' as const, condition: { type: 'level', level: 5 } },
    { name: 'XP Legend', description: 'Earned 50,000 total XP', icon: 'military_tech', rarity: 'LEGENDARY' as const, condition: { type: 'xp_total', amount: 50000 } },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  // ============ Create Default Tasks ============
  const tasks = [
    { title: 'Daily Check-in', description: 'Check in every day to maintain your streak', taskType: 'DAILY_CHECKIN' as const, xpReward: 10, difficulty: 'EASY' as const, frequency: 'DAILY' as const, validationType: 'AUTOMATIC' as const, iconName: 'login' },
    { title: 'Daily Quiz', description: 'Complete the daily Web3 knowledge quiz', taskType: 'QUIZ' as const, xpReward: 25, difficulty: 'MEDIUM' as const, frequency: 'DAILY' as const, validationType: 'QUIZ' as const, iconName: 'psychology' },
    { title: 'Follow @SolanaSeeker', description: 'Follow our official Twitter account', taskType: 'SOCIAL_FOLLOW' as const, xpReward: 15, difficulty: 'EASY' as const, frequency: 'ONCE' as const, validationType: 'SOCIAL' as const, iconName: 'person_add' },
    { title: 'Join Discord Community', description: 'Join our Discord server and say hello', taskType: 'SOCIAL_JOIN' as const, xpReward: 20, difficulty: 'EASY' as const, frequency: 'ONCE' as const, validationType: 'SOCIAL' as const, iconName: 'forum' },
    { title: 'Share Quest Progress', description: 'Share your progress on social media', taskType: 'SOCIAL_FOLLOW' as const, xpReward: 15, difficulty: 'EASY' as const, frequency: 'DAILY' as const, validationType: 'SOCIAL' as const, iconName: 'ios_share' },
    { title: 'Refer a Friend', description: 'Invite a friend to join Solana Seeker', taskType: 'REFERRAL' as const, xpReward: 100, difficulty: 'MEDIUM' as const, frequency: 'ONCE' as const, validationType: 'AUTOMATIC' as const, iconName: 'group_add' },
    { title: 'Weekly Mission: Swap Master', description: 'Complete 3 token swaps on a Solana DEX', taskType: 'SOLANA_TRANSACTION' as const, xpReward: 150, difficulty: 'HARD' as const, frequency: 'WEEKLY' as const, validationType: 'BLOCKCHAIN' as const, iconName: 'bolt' },
    { title: 'Hold an NFT', description: 'Own at least 1 NFT in your connected wallet', taskType: 'NFT_HOLD' as const, xpReward: 50, difficulty: 'MEDIUM' as const, frequency: 'ONCE' as const, validationType: 'BLOCKCHAIN' as const, iconName: 'diamond' },
    { title: 'Weekly Learning Module', description: 'Complete the weekly Web3 education module', taskType: 'LEARNING_MODULE' as const, xpReward: 300, difficulty: 'HARD' as const, frequency: 'WEEKLY' as const, validationType: 'QUIZ' as const, iconName: 'school' },
  ];

  for (const task of tasks) {
    const existing = await prisma.task.findFirst({ where: { title: task.title } });
    if (!existing) {
      await prisma.task.create({ data: task });
    }
  }

  // ============ Create Default Quiz ============
  await prisma.quizModule.upsert({
    where: { id: 'default-web3-quiz' },
    update: {},
    create: {
      id: 'default-web3-quiz',
      title: 'Web3 Basics Quiz',
      lessonContent: 'Learn about the fundamentals of Web3, blockchain technology, and decentralized applications. A crypto wallet is a tool that allows you to store, send, and receive digital assets. Unlike traditional bank accounts, crypto wallets give you full control over your funds through cryptographic keys.',
      xpReward: 250,
      questions: [
        { question: 'What is the main purpose of a crypto wallet?', options: ['Store cryptocurrencies', 'Send and receive digital assets', 'Mine new coins', 'Track NFT prices'], correctAnswer: 1, explanation: 'A crypto wallet primarily allows you to send and receive digital assets securely using your private keys.' },
        { question: 'What consensus mechanism does Solana primarily use?', options: ['Proof of Work', 'Proof of Stake', 'Proof of History', 'Delegated Proof of Stake'], correctAnswer: 2, explanation: 'Solana uses Proof of History (PoH) combined with Proof of Stake for its consensus mechanism.' },
        { question: 'What is an NFT?', options: ['A type of cryptocurrency', 'A non-fungible token', 'A network fee', 'A new file type'], correctAnswer: 1, explanation: 'NFT stands for Non-Fungible Token, a unique digital asset on the blockchain.' },
        { question: 'What is a DApp?', options: ['A digital application', 'A decentralized application', 'A data protocol', 'A distributed archive'], correctAnswer: 1, explanation: 'DApp stands for Decentralized Application, running on a blockchain network.' },
        { question: 'What is SOL?', options: ['A stablecoin', 'The native token of Solana', 'A DeFi protocol', 'A wallet app'], correctAnswer: 1, explanation: 'SOL is the native cryptocurrency of the Solana blockchain.' },
      ],
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
