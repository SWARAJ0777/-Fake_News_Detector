import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type {
  AnalysisResult,
  CategoryScore,
  Insight,
  HighlightedSegment,
} from '../utils/analyzer';

// ---- Animation Trigger Hook ----

function useAnimated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setReady(true);
      });
    });
  }, []);
  return ready;
}

// ============================================================
// Prediction Banner
// ============================================================

function PredictionBanner({
  prediction,
  confidence,
}: {
  prediction: 'REAL' | 'FAKE';
  confidence: number;
}) {
  const isFake = prediction === 'FAKE';

  return (
    <div
      className={`animate-scale-in flex items-center gap-4 p-5 rounded-2xl shadow-sm ${
        isFake
          ? 'bg-ruby-50 border border-ruby-200/80'
          : 'bg-emerald-50 border border-emerald-200/80'
      }`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-sm ${
          isFake ? 'bg-ruby-500' : 'bg-emerald-600'
        } text-white`}
      >
        {isFake ? (
          <ShieldAlert className="w-6 h-6" />
        ) : (
          <ShieldCheck className="w-6 h-6" />
        )}
      </div>
      <div className="min-w-0">
        <div
          className={`text-xl font-bold tracking-tight ${
            isFake ? 'text-ruby-700' : 'text-emerald-700'
          }`}
        >
          {prediction} NEWS
        </div>
        <div className="text-sm text-gray-500 mt-0.5">
          Predicted with{' '}
          <span className="font-semibold text-gray-700">
            {Math.round(confidence * 100)}%
          </span>{' '}
          confidence
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Confidence Gauge (SVG Circular)
// ============================================================

function ConfidenceGauge({
  confidence,
  prediction,
}: {
  confidence: number;
  prediction: 'REAL' | 'FAKE';
}) {
  const ready = useAnimated();
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - confidence);
  const isFake = prediction === 'FAKE';
  const strokeColor = isFake ? '#9B111E' : '#059669';
  const bgColor = isFake ? '#F5C0CA' : '#A7F3D0';

  return (
    <div
      className="animate-fade-in flex flex-col items-center justify-center"
      style={{ animationDelay: '0.15s' }}
    >
      <svg
        width="152"
        height="152"
        viewBox="0 0 152 152"
        className="drop-shadow-sm"
      >
        {/* Background circle */}
        <circle
          cx="76"
          cy="76"
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth="12"
        />
        {/* Animated foreground arc */}
        <circle
          cx="76"
          cy="76"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={ready ? targetOffset : circumference}
          className="gauge-circle"
          transform="rotate(-90 76 76)"
        />
        {/* Center text */}
        <text
          x="76"
          y="70"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="#1F2937"
        >
          {Math.round(confidence * 100)}%
        </text>
        <text
          x="76"
          y="92"
          textAnchor="middle"
          fontSize="11"
          fontWeight="500"
          fill="#9CA3AF"
        >
          confidence
        </text>
      </svg>
    </div>
  );
}

// ============================================================
// Probability Bars
// ============================================================

function ProbabilityBars({
  probabilities,
}: {
  probabilities: { real: number; fake: number };
}) {
  const ready = useAnimated();

  return (
    <div
      className="animate-fade-in-up space-y-4"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Real */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-semibold text-emerald-700">
            Real News Probability
          </span>
          <span className="text-sm font-bold text-emerald-700 tabular-nums">
            {Math.round(probabilities.real * 100)}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full prob-bar"
            style={{ width: ready ? `${probabilities.real * 100}%` : '0%' }}
          />
        </div>
      </div>
      {/* Fake */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-semibold text-ruby-700">
            Fake News Probability
          </span>
          <span className="text-sm font-bold text-ruby-700 tabular-nums">
            {Math.round(probabilities.fake * 100)}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ruby-400 to-ruby-500 rounded-full prob-bar"
            style={{ width: ready ? `${probabilities.fake * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Signal Strength Chart (Custom CSS Bars)
// ============================================================

function SignalChart({ categoryScores }: { categoryScores: CategoryScore[] }) {
  const ready = useAnimated();

  // Filter to meaningful signals, sort by strength
  const chartData = categoryScores
    .filter((cs) => cs.weightedScore > 0.3 || cs.matches > 0)
    .sort((a, b) => b.weightedScore - a.weightedScore);

  const maxScore = Math.max(...chartData.map((d) => d.weightedScore), 1);

  return (
    <div
      className="animate-fade-in-up space-y-3"
      style={{ animationDelay: '0.35s' }}
    >
      {chartData.map((item) => {
        const barWidth = (item.weightedScore / maxScore) * 100;
        const barColor =
          item.impact === 'fake'
            ? 'from-ruby-400 to-ruby-500'
            : 'from-emerald-400 to-emerald-500';

        return (
          <div key={item.category} className="flex items-center gap-3">
            <span
              className="text-xs font-medium text-gray-500 w-28 truncate text-right shrink-0"
            >
              {item.displayCategory}
            </span>
            <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full signal-bar bg-gradient-to-r ${barColor}`}
                style={{
                  width: ready ? `${barWidth}%` : '0%',
                  opacity: 0.85,
                }}
              />
            </div>
            <span
              className="text-xs font-semibold text-gray-600 w-8 tabular-nums text-right shrink-0"
            >
              {item.matches}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Insight Cards
// ============================================================

function InsightCards({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {insights.map((insight, index) => {
        const isFake = insight.impact === 'supports-fake';
        const severityColors: Record<string, Record<string, string>> = {
          'supports-fake': {
            high: 'bg-ruby-200/80 text-ruby-800',
            medium: 'bg-amber-100 text-amber-700',
            low: 'bg-gray-100 text-gray-500',
          },
          'supports-real': {
            high: 'bg-emerald-200/80 text-emerald-800',
            medium: 'bg-blue-100 text-blue-700',
            low: 'bg-gray-100 text-gray-500',
          },
        };

        return (
          <div
            key={insight.id}
            className={`animate-fade-in-up p-4 rounded-xl border ${
              isFake
                ? 'bg-ruby-50/50 border-ruby-200/50'
                : 'bg-emerald-50/50 border-emerald-200/50'
            }`}
            style={{ animationDelay: `${0.4 + index * 0.08}s` }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  isFake ? 'bg-ruby-500' : 'bg-emerald-500'
                }`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800 leading-tight">
                    {insight.title}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      severityColors[insight.impact][insight.severity]
                    }`}
                  >
                    {insight.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Keyword Highlighting
// ============================================================

function KeywordHighlight({
  originalText,
  highlightedSegments,
}: {
  originalText: string;
  highlightedSegments: HighlightedSegment[];
}) {
  if (!highlightedSegments || highlightedSegments.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No specific key phrases detected for highlighting.
      </p>
    );
  }

  // Deduplicate overlapping segments (sorted by start, keep longer)
  const sorted = [...highlightedSegments].sort(
    (a, b) => a.start - b.start || b.end - a.end
  );
  const filtered: HighlightedSegment[] = [];
  for (const seg of sorted) {
    if (filtered.length === 0 || seg.start >= filtered[filtered.length - 1].end) {
      filtered.push(seg);
    }
  }

  // Build alternating text/highlight parts
  const parts: { text: string; type?: string; category?: string }[] = [];
  let lastEnd = 0;

  for (const seg of filtered) {
    if (seg.start > lastEnd) {
      parts.push({ text: originalText.substring(lastEnd, seg.start) });
    }
    const end = Math.min(seg.end, originalText.length);
    parts.push({
      text: originalText.substring(seg.start, end),
      type: seg.type,
      category: seg.category,
    });
    lastEnd = end;
  }

  if (lastEnd < originalText.length) {
    parts.push({ text: originalText.substring(lastEnd) });
  }

  return (
    <div
      className="animate-fade-in-up p-4 bg-gray-50/80 rounded-xl text-sm leading-relaxed max-h-44 overflow-y-auto custom-scrollbar border border-gray-200/60"
      style={{ animationDelay: '0.5s' }}
    >
      {parts.map((part, i) =>
        part.type ? (
          <span
            key={i}
            className={`px-0.5 rounded-sm ${
              part.type === 'fake-signal'
                ? 'bg-ruby-200/70 text-ruby-900 font-medium'
                : 'bg-emerald-200/70 text-emerald-900 font-medium'
            }`}
            title={part.category}
          >
            {part.text}
          </span>
        ) : (
          <span key={i} className="text-gray-700">{part.text}</span>
        )
      )}
    </div>
  );
}

// ============================================================
// Text Statistics Display
// ============================================================

function TextStatsDisplay({
  textStats,
}: {
  textStats: AnalysisResult['textStats'];
}) {
  const items = [
    { label: 'Words', value: textStats.wordCount },
    { label: 'Sentences', value: textStats.sentenceCount },
    {
      label: 'Avg Length',
      value: `${textStats.avgSentenceLength.toFixed(1)} words`,
    },
    {
      label: 'CAPS Ratio',
      value: `${(textStats.capitalRatio * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div
      className="animate-fade-in-up flex flex-wrap gap-3"
      style={{ animationDelay: '0.55s' }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200/60"
        >
          <span className="text-xs text-gray-400">{item.label}: </span>
          <span className="text-xs font-semibold text-gray-700 tabular-nums">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Main Results Section
// ============================================================

export default function ResultsSection({
  results,
  originalText,
}: {
  results: AnalysisResult;
  originalText: string;
}) {
  const hasSignals = results.categoryScores.some(
    (cs) => cs.weightedScore > 0.3 || cs.matches > 0
  );

  return (
    <div className="space-y-6 pt-2">
      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Section Title */}
      <h2 className="animate-fade-in text-lg font-bold text-gray-900 tracking-tight">
        Analysis Results
      </h2>

      {/* Row 1: Prediction + Confidence Gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
        <div className="sm:col-span-3">
          <PredictionBanner
            prediction={results.prediction}
            confidence={results.confidence}
          />
        </div>
        <div className="sm:col-span-2 flex justify-center">
          <ConfidenceGauge
            confidence={results.confidence}
            prediction={results.prediction}
          />
        </div>
      </div>

      {/* Row 2: Probability Breakdown */}
      <div className="animate-fade-in-up p-5 bg-white border border-gray-200 rounded-2xl shadow-sm" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-bold text-gray-800 mb-4">
          Probability Breakdown
        </h3>
        <ProbabilityBars probabilities={results.probabilities} />
      </div>

      {/* Row 3: Signal Strength Chart */}
      {hasSignals && (
        <div className="animate-fade-in-up p-5 bg-white border border-gray-200 rounded-2xl shadow-sm" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-bold text-gray-800 mb-4">
            Signal Strength Analysis
          </h3>
          <SignalChart categoryScores={results.categoryScores} />
          <div
            className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-ruby-400 to-ruby-500 opacity-85" />
              Fake indicators
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-85" />
              Real indicators
            </div>
            <span className="text-gray-300">|</span>
            <span>Match count on right</span>
          </div>
        </div>
      )}

      {/* Row 4: Key Findings */}
      {results.insights.length > 0 && (
        <div>
          <h3 className="animate-fade-in text-sm font-bold text-gray-800 mb-3">
            Key Findings
          </h3>
          <InsightCards insights={results.insights} />
        </div>
      )}

      {/* Row 5: Key Phrases */}
      <div>
        <h3 className="animate-fade-in text-sm font-bold text-gray-800 mb-3">
          Key Phrases Detected
        </h3>
        <KeywordHighlight
          originalText={originalText}
          highlightedSegments={results.highlightedSegments}
        />
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-ruby-200/70" />
            Fake language patterns
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-emerald-200/70" />
            Real language patterns
          </div>
        </div>
      </div>

      {/* Row 6: Text Statistics */}
      <div>
        <h3 className="animate-fade-in text-sm font-bold text-gray-800 mb-3">
          Text Statistics
        </h3>
        <TextStatsDisplay textStats={results.textStats} />
      </div>

      {/* Disclaimer */}
      <div className="animate-fade-in pt-4 text-center" style={{ animationDelay: '0.6s' }}>
        <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
          Results are based on heuristic text pattern analysis and should be
          interpreted as indicators, not definitive proof. This tool is for
          educational purposes and should not be the sole basis for determining
          article authenticity.
        </p>
      </div>
    </div>
  );
}
