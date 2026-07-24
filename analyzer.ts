// ============================================================
// Veritas - Fake News Detection Analysis Engine
// Heuristic text pattern analysis model
// ============================================================

export interface AnalysisResult {
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  probabilities: {
    real: number;
    fake: number;
  };
  insights: Insight[];
  highlightedSegments: HighlightedSegment[];
  textStats: TextStats;
  categoryScores: CategoryScore[];
}

export interface Insight {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'supports-real' | 'supports-fake';
  severity: 'high' | 'medium' | 'low';
  score: number;
}

export interface HighlightedSegment {
  text: string;
  start: number;
  end: number;
  type: 'fake-signal' | 'real-signal';
  category: string;
}

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  capitalRatio: number;
  exclamationDensity: number;
  questionDensity: number;
}

export interface CategoryScore {
  category: string;
  displayCategory: string;
  score: number;
  weightedScore: number;
  weight: number;
  impact: 'real' | 'fake';
  matches: number;
}

export interface SampleArticle {
  key: string;
  label: string;
  description: string;
  text: string;
  expected: 'REAL' | 'FAKE';
}

// ============================================================
// Signal Dictionaries
// ============================================================

const CLICKBAIT_PHRASES = [
  'shocking', 'you won\'t believe', 'bombshell', 'exposed', 'secret',
  'hidden', 'revealed', 'reveal', 'unbelievable', 'jaw-dropping',
  'mind-blowing', 'must read', 'must see', 'before it\'s too late',
  'what they don\'t want', 'the truth about', 'they\'re hiding',
  'miracle', 'miraculous', 'scam', 'fraud', 'hoax',
  'watch this', 'click here', 'you need to know', 'nobody tells you',
  'everyone is talking about', 'can\'t miss', 'game-changing'
];

const SENSATIONAL_WORDS = [
  'amazing', 'incredible', 'outrageous', 'explosive', 'stunning',
  'terrifying', 'horrible', 'disaster', 'catastrophe', 'crisis',
  'chaos', 'nightmare', 'apocalypse', 'devastating', 'unprecedented',
  'worst ever', 'greatest', 'insane', 'crazy', 'massive',
  'colossal', 'epic', 'unreal', 'furious', 'brutal'
];

const CONSPIRACY_PHRASES = [
  'cover-up', 'conspiracy', 'deep state', 'illuminati',
  'they don\'t want', 'hidden truth', 'wake up', 'sheeple',
  'mainstream media lies', 'agenda', 'globalist', 'cabal',
  'suppressed', 'censored', 'they are hiding',
  'truth is being suppressed', 'the real truth',
  'nothing but the truth', 'truth will be revealed',
  'weaponized', 'targeted', 'controlled by'
];

const VAGUE_PHRASES = [
  'some people', 'many believe', 'sources say', 'anonymous source',
  'insider reveals', 'experts claim', 'rumored', 'reportedly',
  'allegedly', 'some experts', 'word on the street',
  'according to sources', 'unnamed official', 'sources close to',
  'people are saying', 'it is said', 'many are saying',
  'insider', 'tip', 'leak'
];

const FACTUAL_WORDS = [
  'study', 'research', 'data', 'statistics', 'peer-reviewed',
  'published', 'journal', 'university', 'institute',
  'according to', 'reported by', 'cited', 'evidence',
  'findings', 'analysis', 'methodology', 'survey',
  'experiment', 'confirmed', 'documented', 'verified',
  'measured', 'quantified', 'demonstrated', 'scientific',
  'empirical', 'objective', 'systematic', 'comprehensive',
  'investigation', 'observation', 'corroborated'
];

const AUTHORITY_WORDS = [
  'professor', 'dr.', 'phd', 'scientist', 'researcher',
  'official', 'spokesperson', 'department', 'agency',
  'organization', 'institution', 'government', 'court',
  'legislature', 'committee', 'minister', 'director',
  'chief', 'president', 'senator', 'representative',
  'expert', 'specialist', 'analyst', 'authorities'
];

const OPINION_PHRASES = [
  'i think', 'in my opinion', 'believe that', 'feel that',
  'personally', 'it seems', 'obviously', 'clearly',
  'everyone knows', 'we all know', 'common sense',
  'anyone can see', 'it\'s obvious', 'without a doubt',
  'undoubtedly', 'certainly', 'definitely'
];

// ============================================================
// Sample Articles
// ============================================================

export const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    key: 'fake-clickbait',
    label: 'Fake — Clickbait Article',
    description: 'Sensational language, clickbait phrases',
    text: 'SHOCKING: What They Don\'t Want You to Know About the Secret Government Program! A bombshell new report has EXPOSED the hidden truth that mainstream media is deliberately covering up. Anonymous sources reveal that a secret cabal of global elites has been running a covert operation right under our noses. You won\'t believe the jaw-dropping details of this incredible conspiracy! The truth is finally out and it\'s more terrifying than anyone could have imagined. Wake up before it\'s too late! This is the most devastating revelation in history and everyone is talking about it. They are hiding the real facts and suppressing the truth. The mainstream media lies about what\'s really happening. Don\'t let them control what you know!',
    expected: 'FAKE'
  },
  {
    key: 'real-scientific',
    label: 'Real — Scientific Report',
    description: 'Factual language, cited sources, research',
    text: 'New Study Published in Nature Reveals Climate Impact Findings. A peer-reviewed study published in the journal Nature has found that global temperatures have increased by 1.1 degrees Celsius since pre-industrial times. The research, conducted by Dr. Sarah Chen at the University of Cambridge\'s Department of Earth Sciences, analyzed temperature data from 1850 to 2023. According to the study\'s findings, the primary driver of this increase is greenhouse gas emissions from human activities. The research methodology involved analyzing over 10,000 data points from weather stations worldwide, and the data was corroborated by independent research from the National Oceanic and Atmospheric Administration. Professor Chen stated that the evidence clearly demonstrates a consistent warming trend. The study was funded by the National Science Foundation and reviewed by an independent panel of climate scientists. Dr. Michael Torres, a researcher at the Institute for Environmental Studies, confirmed the findings, noting that the methodology was systematic and the statistical analysis was comprehensive.',
    expected: 'REAL'
  },
  {
    key: 'suspicious-vague',
    label: 'Suspicious — Vague Sources',
    description: 'Mix of facts with unverifiable claims',
    text: 'Local Residents Report Unusual Activity in Downtown Area. Some people in the community have reportedly seen unusual activity in the downtown area over the past several weeks. Sources say there has been a significant increase in foot traffic near the recently renovated commercial district. According to anonymous sources, the increase might be connected to a new development project that has not been officially announced. City spokesperson Mark Williams stated that the city is aware of the changes and is monitoring the situation. While many believe the development could bring economic growth, others allegedly have concerns about potential environmental impact. Insider reveals that the project could reportedly involve a major retail chain. The city council is reportedly considering new measures. Word on the street is that construction could begin as early as next month, according to sources close to the planning committee.',
    expected: 'FAKE'
  },
  {
    key: 'conspiracy',
    label: 'Fake — Conspiracy Theory',
    description: 'Conspiracy language, opinion-based claims',
    text: 'The Hidden Agenda Behind the New Education Policy Exposed. Many believe that the recently announced education policy changes are part of a larger cover-up by powerful interests. The mainstream media refuses to report on the real story behind these changes. A deep state conspiracy is allegedly working to suppress the truth about what\'s really happening in our schools. They don\'t want you to know that this policy was designed by a secret group of insiders pushing their own agenda. In my opinion, it\'s obvious that something doesn\'t feel right about this. We all know they are hiding the real motivations. Wake up and demand transparency before it\'s too late! This is a devastating blow to our children\'s future. The truth is being suppressed and the globalist cabal is censoring anyone who speaks out. It\'s clear that common sense tells us this is a scam. Everyone knows the real agenda behind this fraud!',
    expected: 'FAKE'
  }
];

// ============================================================
// Analysis Engine
// ============================================================

function findMatches(
  patterns: string[],
  text: string,
  lowerText: string
): { count: number; positions: { start: number; end: number; text: string }[] } {
  let count = 0;
  const positions: { start: number; end: number; text: string }[] = [];

  for (const pattern of patterns) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      count++;
      if (positions.length < 20) {
        positions.push({
          start: match.index,
          end: match.index + match[0].length,
          text: text.substring(match.index, match.index + match[0].length)
        });
      }
    }
  }
  return { count, positions };
}

export function analyzeArticle(text: string): AnalysisResult {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const lowerText = text.toLowerCase();

  // Too short for meaningful analysis
  if (wordCount < 10) {
    return {
      prediction: 'FAKE',
      confidence: 0.25,
      probabilities: { real: 0.25, fake: 0.75 },
      insights: [{
        id: 'short-text',
        category: 'Text Length',
        title: 'Insufficient Text Length',
        description: 'The article is too short for reliable analysis. Provide a longer text (at least 50 words) for more accurate results.',
        impact: 'supports-fake',
        severity: 'high',
        score: 0.8
      }],
      highlightedSegments: [],
      textStats: {
        wordCount, sentenceCount: 0, avgSentenceLength: 0,
        capitalRatio: 0, exclamationDensity: 0, questionDensity: 0
      },
      categoryScores: []
    };
  }

  // ---- Text Statistics ----
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);
  const avgSentenceLength = wordCount / sentenceCount;
  const capitalWords = words.filter(w => w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  const capitalRatio = capitalWords / wordCount;
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const exclamationDensity = exclamations / wordCount;
  const questionDensity = questions / wordCount;

  const textStats: TextStats = {
    wordCount, sentenceCount, avgSentenceLength,
    capitalRatio, exclamationDensity, questionDensity
  };

  // ---- Pattern Matching ----
  const clickbait = findMatches(CLICKBAIT_PHRASES, text, lowerText);
  const sensational = findMatches(SENSATIONAL_WORDS, text, lowerText);
  const conspiracy = findMatches(CONSPIRACY_PHRASES, text, lowerText);
  const vague = findMatches(VAGUE_PHRASES, text, lowerText);
  const factual = findMatches(FACTUAL_WORDS, text, lowerText);
  const authority = findMatches(AUTHORITY_WORDS, text, lowerText);
  const opinion = findMatches(OPINION_PHRASES, text, lowerText);

  // ---- Normalized Scores (per 100 words) ----
  const normFactor = 100 / wordCount;

  const categoryScores: CategoryScore[] = [
    {
      category: 'Clickbait Language',
      displayCategory: 'Clickbait',
      score: clickbait.count * normFactor,
      weightedScore: clickbait.count * normFactor * 3.0,
      weight: 3.0, impact: 'fake', matches: clickbait.count
    },
    {
      category: 'Sensational Language',
      displayCategory: 'Sensational',
      score: sensational.count * normFactor,
      weightedScore: sensational.count * normFactor * 2.0,
      weight: 2.0, impact: 'fake', matches: sensational.count
    },
    {
      category: 'Conspiracy Markers',
      displayCategory: 'Conspiracy',
      score: conspiracy.count * normFactor,
      weightedScore: conspiracy.count * normFactor * 4.0,
      weight: 4.0, impact: 'fake', matches: conspiracy.count
    },
    {
      category: 'Vague Sources',
      displayCategory: 'Vague Sources',
      score: vague.count * normFactor,
      weightedScore: vague.count * normFactor * 2.5,
      weight: 2.5, impact: 'fake', matches: vague.count
    },
    {
      category: 'Opinion Language',
      displayCategory: 'Opinion',
      score: opinion.count * normFactor,
      weightedScore: opinion.count * normFactor * 1.5,
      weight: 1.5, impact: 'fake', matches: opinion.count
    },
    {
      category: 'Excessive Capitalization',
      displayCategory: 'Capitalization',
      score: capitalRatio * 100 * normFactor,
      weightedScore: capitalRatio * 100 * normFactor * 2.0,
      weight: 2.0, impact: 'fake', matches: capitalWords
    },
    {
      category: 'Excessive Punctuation',
      displayCategory: 'Punctuation',
      score: (exclamationDensity + questionDensity) * 100 * normFactor,
      weightedScore: (exclamationDensity + questionDensity) * 100 * normFactor * 1.5,
      weight: 1.5, impact: 'fake', matches: exclamations + questions
    },
    {
      category: 'Factual Language',
      displayCategory: 'Factual',
      score: factual.count * normFactor,
      weightedScore: factual.count * normFactor * 3.0,
      weight: 3.0, impact: 'real', matches: factual.count
    },
    {
      category: 'Authority References',
      displayCategory: 'Authority',
      score: authority.count * normFactor,
      weightedScore: authority.count * normFactor * 2.5,
      weight: 2.5, impact: 'real', matches: authority.count
    }
  ];

  // ---- Compute Probabilities ----
  let fakeScore = 0;
  let realScore = 0;

  for (const cs of categoryScores) {
    if (cs.impact === 'fake') fakeScore += cs.weightedScore;
    else realScore += cs.weightedScore;
  }

  // Baseline: neutral text gets roughly 50/50
  const baseline = 5;
  fakeScore += baseline;
  realScore += baseline;

  const total = fakeScore + realScore;
  let fakeProb = fakeScore / total;
  let realProb = realScore / total;

  // Confidence based on signal strength and text length
  const signalStrength = Math.abs(fakeProb - realProb);
  const lengthConfidence = Math.min(1, Math.max(0.4, wordCount / 150));
  let confidence = lengthConfidence * (0.5 + signalStrength * 0.5);
  confidence = Math.min(0.99, Math.max(0.25, confidence));

  const prediction: 'REAL' | 'FAKE' = realProb >= fakeProb ? 'REAL' : 'FAKE';

  // ---- Generate Insights ----
  const insights: Insight[] = [];

  if (clickbait.count > 0) {
    insights.push({
      id: 'clickbait',
      category: 'Clickbait Language',
      title: 'Clickbait Phrases Detected',
      description: `Found ${clickbait.count} clickbait phrase(s) — language designed to provoke curiosity and clicks rather than convey accurate information.`,
      impact: 'supports-fake',
      severity: clickbait.count >= 3 ? 'high' : clickbait.count >= 2 ? 'medium' : 'low',
      score: Math.min(1, clickbait.count * normFactor * 3)
    });
  }

  if (sensational.count > 0) {
    insights.push({
      id: 'sensational',
      category: 'Sensational Language',
      title: 'Sensational Language Detected',
      description: `Found ${sensational.count} sensational word(s) using emotional exaggeration rather than measured, factual reporting.`,
      impact: 'supports-fake',
      severity: sensational.count >= 4 ? 'high' : sensational.count >= 2 ? 'medium' : 'low',
      score: Math.min(1, sensational.count * normFactor * 2)
    });
  }

  if (conspiracy.count > 0) {
    insights.push({
      id: 'conspiracy',
      category: 'Conspiracy Markers',
      title: 'Conspiracy Language Detected',
      description: `Found ${conspiracy.count} conspiracy-related phrase(s) suggesting cover-ups, hidden agendas, or suppressed information without verifiable evidence.`,
      impact: 'supports-fake',
      severity: conspiracy.count >= 2 ? 'high' : 'medium',
      score: Math.min(1, conspiracy.count * normFactor * 4)
    });
  }

  if (vague.count > 0) {
    insights.push({
      id: 'vague',
      category: 'Vague Sources',
      title: 'Vague or Anonymous Sources',
      description: `Found ${vague.count} instance(s) of vague sourcing — phrases like "sources say" or "anonymous officials" that lack verifiable attribution.`,
      impact: 'supports-fake',
      severity: vague.count >= 3 ? 'high' : vague.count >= 2 ? 'medium' : 'low',
      score: Math.min(1, vague.count * normFactor * 2.5)
    });
  }

  if (opinion.count > 0) {
    insights.push({
      id: 'opinion',
      category: 'Opinion Language',
      title: 'Opinion-Based Language',
      description: `Found ${opinion.count} opinion marker(s) indicating subjective assertions rather than objective, evidence-based reporting.`,
      impact: 'supports-fake',
      severity: opinion.count >= 3 ? 'medium' : 'low',
      score: Math.min(1, opinion.count * normFactor * 1.5)
    });
  }

  if (capitalRatio > 0.08) {
    insights.push({
      id: 'caps',
      category: 'Capitalization',
      title: 'Excessive Capitalization',
      description: `${Math.round(capitalRatio * 100)}% of words are fully capitalized — a pattern characteristic of emotionally charged or attention-seeking content.`,
      impact: 'supports-fake',
      severity: capitalRatio > 0.2 ? 'high' : 'medium',
      score: Math.min(1, capitalRatio * 5)
    });
  }

  if (exclamationDensity > 0.02) {
    insights.push({
      id: 'punctuation',
      category: 'Punctuation',
      title: 'Excessive Exclamation Marks',
      description: `High density of exclamation marks (${exclamations} found), suggesting an emotional rather than factual writing style.`,
      impact: 'supports-fake',
      severity: exclamationDensity > 0.05 ? 'high' : 'medium',
      score: Math.min(1, exclamationDensity * 20)
    });
  }

  if (factual.count > 0) {
    insights.push({
      id: 'factual',
      category: 'Factual Language',
      title: 'Factual Language Present',
      description: `Found ${factual.count} factual marker(s) — references to studies, data, methodology, and evidence-based terminology.`,
      impact: 'supports-real',
      severity: factual.count >= 4 ? 'high' : factual.count >= 2 ? 'medium' : 'low',
      score: Math.min(1, factual.count * normFactor * 3)
    });
  }

  if (authority.count > 0) {
    insights.push({
      id: 'authority',
      category: 'Authority References',
      title: 'Authority Sources Cited',
      description: `Found ${authority.count} reference(s) to authoritative sources — officials, researchers, institutions, or recognized experts.`,
      impact: 'supports-real',
      severity: authority.count >= 3 ? 'high' : authority.count >= 2 ? 'medium' : 'low',
      score: Math.min(1, authority.count * normFactor * 2.5)
    });
  }

  // ---- Highlighted Segments ----
  const allMatches: { start: number; end: number; text: string; type: 'fake-signal' | 'real-signal'; category: string }[] = [];

  const addHighlights = (
    positions: { start: number; end: number; text: string }[],
    type: 'fake-signal' | 'real-signal',
    category: string
  ) => {
    for (const pos of positions) {
      allMatches.push({ ...pos, type, category });
    }
  };

  addHighlights(clickbait.positions, 'fake-signal', 'Clickbait');
  addHighlights(sensational.positions, 'fake-signal', 'Sensational');
  addHighlights(conspiracy.positions, 'fake-signal', 'Conspiracy');
  addHighlights(vague.positions, 'fake-signal', 'Vague');
  addHighlights(opinion.positions, 'fake-signal', 'Opinion');
  addHighlights(factual.positions, 'real-signal', 'Factual');
  addHighlights(authority.positions, 'real-signal', 'Authority');

  // Sort and deduplicate overlapping segments
  allMatches.sort((a, b) => a.start - b.start || b.end - a.end);
  const deduped: typeof allMatches = [];
  for (const m of allMatches) {
    if (deduped.length === 0 || m.start >= deduped[deduped.length - 1].end) {
      deduped.push(m);
    }
  }

  // Take top segments (limit for readability)
  const highlightedSegments: HighlightedSegment[] = deduped.slice(0, 15).map(m => ({
    text: m.text,
    start: m.start,
    end: m.end,
    type: m.type,
    category: m.category
  }));

  // Sort insights: fake first (by severity), then real
  insights.sort((a, b) => {
    if (a.impact === b.impact) {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    if (a.impact === 'supports-fake') return -1;
    return 1;
  });

  return {
    prediction,
    confidence,
    probabilities: { real: realProb, fake: fakeProb },
    insights,
    highlightedSegments,
    textStats,
    categoryScores
  };
}
