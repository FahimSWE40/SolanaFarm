import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, PrimaryButton, SectionHeader, XPProgressBar } from '../components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

// ─── Quiz List View ───────────────────────────────────────────────────────────
export default function QuizScreen() {
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => api.getQuizzes(),
  });

  if (activeQuiz) {
    return (
      <QuizPlayer
        quizId={activeQuiz.id}
        onClose={() => setActiveQuiz(null)}
      />
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>🧠 Learn & Earn</Text>
        <Text style={s.subtitle}>Complete quizzes to earn XP</Text>

        {isLoading && (
          <Text style={s.loading}>Loading quizzes...</Text>
        )}

        {quizzes?.map((quiz: any) => (
          <GlassCard
            key={quiz.id}
            glowColor={colors.tertiary}
            onPress={() => setActiveQuiz(quiz)}
            style={s.quizCard}
          >
            <View style={s.quizHeader}>
              <Text style={s.quizIcon}>🧠</Text>
              <View style={s.quizInfo}>
                <Text style={s.quizTitle}>{quiz.title}</Text>
                <Text style={s.quizMeta}>
                  {(quiz.questions as any[])?.length || 0} questions
                </Text>
              </View>
              <View style={s.xpBadge}>
                <Text style={s.xpBadgeVal}>+{quiz.xpReward}</Text>
                <Text style={s.xpBadgeLbl}>XP</Text>
              </View>
            </View>
            {quiz.lessonContent && (
              <Text style={s.quizDesc} numberOfLines={2}>
                {quiz.lessonContent}
              </Text>
            )}
            <View style={s.quizFooter}>
              <Text style={s.quizStart}>Start Quiz →</Text>
            </View>
          </GlassCard>
        ))}

        {quizzes?.length === 0 && !isLoading && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📚</Text>
            <Text style={s.emptyText}>No quizzes available yet. Check back soon!</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Quiz Player ─────────────────────────────────────────────────────────────
function QuizPlayer({
  quizId,
  onClose,
}: {
  quizId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [phase, setPhase] = useState<'lesson' | 'quiz' | 'result'>('lesson');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => api.getQuiz(quizId),
  });

  const submitMutation = useMutation({
    mutationFn: (ans: number[]) => api.submitQuiz(quizId, ans),
    onSuccess: (data) => {
      setResult(data);
      setPhase('result');
      qc.invalidateQueries({ queryKey: ['xp-summary'] });
    },
  });

  const questions: any[] = (quiz?.questions as any[]) || [];
  const currentQuestion = questions[currentQ];

  const handleSelectAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer!];
    setAnswers(newAnswers);
    setSelectedAnswer(null);
    setShowExplanation(false);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitMutation.mutate(newAnswers);
    }
  };

  if (!quiz) {
    return (
      <View style={s.container}>
        <View style={s.loadingCenter}>
          <Text style={s.loading}>Loading quiz...</Text>
        </View>
      </View>
    );
  }

  // Lesson phase
  if (phase === 'lesson') {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={s.scroll}>
          <TouchableOpacity onPress={onClose} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.quizTitle}>{quiz.title}</Text>
          <GlassCard glowColor={colors.tertiary} style={s.lessonCard}>
            <Text style={s.lessonTitle}>📖 Lesson</Text>
            <Text style={s.lessonContent}>{quiz.lessonContent}</Text>
          </GlassCard>
          <View style={s.lessonFooter}>
            <PrimaryButton
              title="Start Quiz →"
              onPress={() => setPhase('quiz')}
              size="lg"
            />
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // Result phase
  if (phase === 'result' && result) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.resultHeader}>
            <Text style={s.resultEmoji}>{result.isPerfect ? '🎉' : result.score >= 60 ? '✅' : '😅'}</Text>
            <Text style={s.resultScore}>{result.score}%</Text>
            <Text style={s.resultCorrect}>
              {result.correct}/{result.total} correct
            </Text>
            {result.isPerfect && (
              <View style={s.perfectBadge}>
                <Text style={s.perfectText}>Perfect Score! 1.5x XP bonus</Text>
              </View>
            )}
          </View>

          <GlassCard glowColor={colors.secondary} style={s.xpResultCard}>
            <Text style={s.xpResultLabel}>XP Earned</Text>
            <Text style={s.xpResultVal}>+{result.xpAwarded}</Text>
          </GlassCard>

          <Text style={s.reviewTitle}>Review Answers</Text>
          {result.results?.map((r: any, i: number) => (
            <GlassCard key={i} style={[s.reviewCard, r.correct ? s.reviewCorrect : s.reviewWrong]}>
              <Text style={s.reviewQ}>{r.question}</Text>
              <Text style={[s.reviewResult, { color: r.correct ? colors.secondary : colors.error }]}>
                {r.correct ? '✓ Correct' : '✗ Incorrect'}
              </Text>
              {r.explanation && (
                <Text style={s.reviewExplanation}>{r.explanation}</Text>
              )}
            </GlassCard>
          ))}

          <PrimaryButton title="Done" onPress={onClose} style={s.doneBtn} />
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // Quiz phase
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.quizTopBar}>
        <TouchableOpacity onPress={onClose}>
          <Text style={s.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={s.qProgress}>{currentQ + 1}/{questions.length}</Text>
        <View style={s.qProgressBar}>
          <XPProgressBar progress={((currentQ + 1) / questions.length) * 100} height={6} color={colors.tertiary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.quizBody}>
        <Text style={s.questionText}>{currentQuestion?.question}</Text>

        <View style={s.options}>
          {currentQuestion?.options?.map((option: string, idx: number) => {
            const isSelected = selectedAnswer === idx;
            const optStyle = isSelected ? [s.option, s.optionSelected] : [s.option];
            const optTextStyle = isSelected ? [s.optionText, { color: colors.primary }] : [s.optionText];

            return (
              <TouchableOpacity
                key={idx}
                style={optStyle}
                onPress={() => handleSelectAnswer(idx)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.7}
              >
                <Text style={s.optionLetter}>
                  {String.fromCharCode(65 + idx)}
                </Text>
                <Text style={optTextStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && currentQuestion?.explanation && (
          <GlassCard style={s.explanationCard}>
            <Text style={s.explanationTitle}>💡 Explanation</Text>
            <Text style={s.explanationText}>{currentQuestion.explanation}</Text>
          </GlassCard>
        )}

        {selectedAnswer !== null && (
          <PrimaryButton
            title={currentQ < questions.length - 1 ? 'Next Question →' : 'Submit Quiz'}
            onPress={handleNextQuestion}
            style={s.nextBtn}
            disabled={submitMutation.isPending}
          />
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'] },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['4xl'],
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  loading: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  quizCard: { marginBottom: spacing.md },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  quizIcon: { fontSize: 28 },
  quizInfo: { flex: 1 },
  quizTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
  },
  quizMeta: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer + '40',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  xpBadgeVal: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  xpBadgeLbl: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.primaryDim,
  },
  quizDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  quizFooter: { alignItems: 'flex-end' },
  quizStart: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.tertiary,
  },
  empty: { alignItems: 'center', paddingVertical: spacing['6xl'] },
  emptyIcon: { fontSize: 48, marginBottom: spacing.lg },
  emptyText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  backBtn: { marginBottom: spacing.lg },
  backText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  lessonCard: { marginBottom: spacing.xl },
  lessonTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  lessonContent: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  lessonFooter: { marginTop: spacing.lg },
  resultHeader: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  resultEmoji: { fontSize: 64, marginBottom: spacing.md },
  resultScore: {
    fontFamily: typography.fontFamily.heading,
    fontSize: 64,
    color: colors.textPrimary,
  },
  resultCorrect: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xl,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  perfectBadge: {
    backgroundColor: colors.secondary + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  perfectText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.secondary,
  },
  xpResultCard: { alignItems: 'center', marginBottom: spacing['2xl'] },
  xpResultLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  xpResultVal: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['6xl'],
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  reviewTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['2xl'],
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  reviewCard: { marginBottom: spacing.md },
  reviewCorrect: { borderColor: colors.secondary + '40' },
  reviewWrong: { borderColor: colors.error + '40' },
  reviewQ: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reviewResult: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  reviewExplanation: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  doneBtn: { marginTop: spacing.xl },
  quizTopBar: {
    paddingTop: spacing['5xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  qProgress: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  qProgressBar: { marginBottom: spacing.md },
  quizBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  questionText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['2xl'],
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
    lineHeight: 32,
  },
  options: { gap: spacing.md, marginBottom: spacing['2xl'] },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  optionSelected: {
    borderColor: colors.primary + '80',
    backgroundColor: colors.primaryContainer + '20',
  },
  optionCorrect: {
    borderColor: colors.secondary + '80',
    backgroundColor: colors.secondary + '10',
  },
  optionWrong: {
    borderColor: colors.error + '80',
    backgroundColor: colors.error + '10',
  },
  optionLetter: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.lg,
    color: colors.textMuted,
    width: 28,
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  explanationCard: {
    borderColor: colors.tertiary + '40',
    marginBottom: spacing.xl,
  },
  explanationTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.lg,
    color: colors.tertiary,
    marginBottom: spacing.sm,
  },
  explanationText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  nextBtn: { marginTop: spacing.md },
});
