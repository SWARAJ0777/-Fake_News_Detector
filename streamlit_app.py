"""
Veritas — AI-Powered Fake News Detection (Streamlit Version)

A heuristic text pattern analysis model that evaluates news articles
for authenticity indicators. For educational and research purposes only.
"""

import streamlit as st
import plotly.graph_objects as go
import re
import math
import time
from dataclasses import dataclass, field
from typing import List, Optional, Literal

# ============================================================
# Page Configuration
# ============================================================

st.set_page_config(
    page_title="Veritas — AI-Powered Fake News Detection",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ============================================================
# Custom CSS
# ============================================================

CUSTOM_CSS = """
<style>
    /* Hide Streamlit default elements */
    #MainMenu, footer, header { visibility: hidden; }
    [data-testid="collapsedControl"] { display: none !important; }

    /* Main container styling */
    .block-container {
        max-width: 720px !important;
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
    }

    /* Section headers */
    .section-header {
        font-size: 0.9rem;
        font-weight: 700;
        color: #1F2937;
        margin-bottom: 0.75rem;
        margin-top: 1.5rem;
    }

    /* Prediction banners */
    .prediction-fake {
        background: linear-gradient(135deg, #FEF2F4 0%, #FDE5E9 100%);
        border: 1px solid rgba(245, 192, 202, 0.8);
        border-radius: 16px;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .prediction-real {
        background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
        border: 1px solid rgba(167, 243, 208, 0.8);
        border-radius: 16px;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .prediction-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
    }

    .prediction-icon-fake {
        background: #9B111E;
        color: white;
    }

    .prediction-icon-real {
        background: #059669;
        color: white;
    }

    .prediction-label {
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.02em;
    }

    .prediction-label-fake { color: #720D16; }
    .prediction-label-real { color: #047857; }

    .prediction-sublabel {
        font-size: 0.85rem;
        color: #6B7280;
        margin-top: 2px;
    }

    .prediction-sublabel span {
        font-weight: 600;
        color: #374151;
    }

    /* Insight cards */
    .insight-card {
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 8px;
        border: 1px solid transparent;
    }

    .insight-card-fake {
        background: rgba(254, 242, 244, 0.5);
        border-color: rgba(245, 192, 202, 0.5);
    }

    .insight-card-real {
        background: rgba(236, 253, 245, 0.5);
        border-color: rgba(167, 243, 208, 0.5);
    }

    .insight-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        margin-top: 6px;
        flex-shrink: 0;
    }

    .insight-dot-fake { background: #9B111E; }
    .insight-dot-real { background: #059669; }

    /* Severity badges */
    .severity-high-fake {
        background: rgba(212, 107, 128, 0.8);
        color: #720D16;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }

    .severity-medium-fake {
        background: rgba(245, 158, 11, 0.15);
        color: #B45309;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }

    .severity-low-fake {
        background: #F3F4F6;
        color: #6B7280;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }

    .severity-high-real {
        background: rgba(52, 211, 153, 0.6);
        color: #047857;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }

    .severity-medium-real {
        background: rgba(59, 130, 246, 0.15);
        color: #1D4ED8;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }

    .severity-low-real {
        background: #F3F4F6;
        color: #6B7280;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }

    /* Keyword highlight */
    .keyword-highlight-fake {
        background: rgba(245, 192, 202, 0.7);
        color: #5A0A12;
        font-weight: 500;
        padding: 1px 3px;
        border-radius: 3px;
    }

    .keyword-highlight-real {
        background: rgba(167, 243, 208, 0.7);
        color: #065F46;
        font-weight: 500;
        padding: 1px 3px;
        border-radius: 3px;
    }

    /* Stat badge */
    .stat-badge {
        background: #F9FAFB;
        border: 1px solid rgba(229, 231, 235, 0.6);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 0.75rem;
        display: inline-block;
        margin-right: 8px;
        margin-bottom: 4px;
    }

    .stat-label { color: #9CA3AF; }
    .stat-value { color: #374151; font-weight: 600; }

    /* Divider */
    .section-divider {
        height: 1px;
        background: #E5E7EB;
        margin: 1rem 0;
    }

    /* Buttons */
    .stButton > button:first-child {
        transition: all 0.2s ease;
    }

    /* Footer */
    .app-footer {
        font-size: 0.75rem;
        color: #9CA3AF;
        text-align: center;
        padding-top: 2rem;
        padding-bottom: 1rem;
        line-height: 1.6;
    }

    /* Disclaimer */
    .disclaimer {
        font-size: 0.75rem;
        color: #9CA3AF;
        text-align: center;
        padding-top: 1.5rem;
        line-height: 1.6;
        max-width: 560px;
        margin: 0 auto;
    }

    /* Results container animation */
    .results-container {
        animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Plotly chart container */
    .js-plotly-plot .plotly .modebar { display: none !important; }
</style>
"""

st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ============================================================
# Data Classes
# ============================================================

@dataclass
class Insight:
    id: str
    category: str
    title: str
    description: str
    impact: str  # 'supports-real' | 'supports-fake'
    severity: str  # 'high' | 'medium' | 'low'
    score: float


@dataclass
class HighlightedSegment:
    text: str
    start: int
    end: int
    type: str  # 'fake-signal' | 'real-signal'
    category: str


@dataclass
class TextStats:
    word_count: int
    sentence_count: int
    avg_sentence_length: float
    capital_ratio: float
    exclamation_density: float
    question_density: float


@dataclass
class CategoryScore:
    category: str
    display_category: str
    score: float
    weighted_score: float
    weight: float
    impact: str  # 'real' | 'fake'
    matches: int


@dataclass
class SampleArticle:
    key: str
    label: str
    description: str
    text: str
    expected: str  # 'REAL' | 'FAKE'


@dataclass
class AnalysisResult:
    prediction: str  # 'REAL' | 'FAKE'
    confidence: float
    probabilities: dict  # { 'real': float, 'fake': float }
    insights: List[Insight]
    highlighted_segments: List[HighlightedSegment]
    text_stats: TextStats
    category_scores: List[CategoryScore]


# ============================================================
# Signal Dictionaries
# ============================================================

CLICKBAIT_PHRASES = [
    'shocking', 'you won\'t believe', 'bombshell', 'exposed', 'secret',
    'hidden', 'revealed', 'reveal', 'unbelievable', 'jaw-dropping',
    'mind-blowing', 'must read', 'must see', 'before it\'s too late',
    'what they don\'t want', 'the truth about', 'they\'re hiding',
    'miracle', 'miraculous', 'scam', 'fraud', 'hoax',
    'watch this', 'click here', 'you need to know', 'nobody tells you',
    'everyone is talking about', 'can\'t miss', 'game-changing'
]

SENSATIONAL_WORDS = [
    'amazing', 'incredible', 'outrageous', 'explosive', 'stunning',
    'terrifying', 'horrible', 'disaster', 'catastrophe', 'crisis',
    'chaos', 'nightmare', 'apocalypse', 'devastating', 'unprecedented',
    'worst ever', 'greatest', 'insane', 'crazy', 'massive',
    'colossal', 'epic', 'unreal', 'furious', 'brutal'
]

CONSPIRACY_PHRASES = [
    'cover-up', 'conspiracy', 'deep state', 'illuminati',
    'they don\'t want', 'hidden truth', 'wake up', 'sheeple',
    'mainstream media lies', 'agenda', 'globalist', 'cabal',
    'suppressed', 'censored', 'they are hiding',
    'truth is being suppressed', 'the real truth',
    'nothing but the truth', 'truth will be revealed',
    'weaponized', 'targeted', 'controlled by'
]

VAGUE_PHRASES = [
    'some people', 'many believe', 'sources say', 'anonymous source',
    'insider reveals', 'experts claim', 'rumored', 'reportedly',
    'allegedly', 'some experts', 'word on the street',
    'according to sources', 'unnamed official', 'sources close to',
    'people are saying', 'it is said', 'many are saying',
    'insider', 'tip', 'leak'
]

FACTUAL_WORDS = [
    'study', 'research', 'data', 'statistics', 'peer-reviewed',
    'published', 'journal', 'university', 'institute',
    'according to', 'reported by', 'cited', 'evidence',
    'findings', 'analysis', 'methodology', 'survey',
    'experiment', 'confirmed', 'documented', 'verified',
    'measured', 'quantified', 'demonstrated', 'scientific',
    'empirical', 'objective', 'systematic', 'comprehensive',
    'investigation', 'observation', 'corroborated'
]

AUTHORITY_WORDS = [
    'professor', 'dr.', 'phd', 'scientist', 'researcher',
    'official', 'spokesperson', 'department', 'agency',
    'organization', 'institution', 'government', 'court',
    'legislature', 'committee', 'minister', 'director',
    'chief', 'president', 'senator', 'representative',
    'expert', 'specialist', 'analyst', 'authorities'
]

OPINION_PHRASES = [
    'i think', 'in my opinion', 'believe that', 'feel that',
    'personally', 'it seems', 'obviously', 'clearly',
    'everyone knows', 'we all know', 'common sense',
    'anyone can see', 'it\'s obvious', 'without a doubt',
    'undoubtedly', 'certainly', 'definitely'
]

# ============================================================
# Sample Articles
# ============================================================

SAMPLE_ARTICLES = [
    SampleArticle(
        key='fake-clickbait',
        label='Fake — Clickbait Article',
        description='Sensational language, clickbait phrases',
        text='SHOCKING: What They Don\'t Want You to Know About the Secret Government Program! A bombshell new report has EXPOSED the hidden truth that mainstream media is deliberately covering up. Anonymous sources reveal that a secret cabal of global elites has been running a covert operation right under our noses. You won\'t believe the jaw-dropping details of this incredible conspiracy! The truth is finally out and it\'s more terrifying than anyone could have imagined. Wake up before it\'s too late! This is the most devastating revelation in history and everyone is talking about it. They are hiding the real facts and suppressing the truth. The mainstream media lies about what\'s really happening. Don\'t let them control what you know!',
        expected='FAKE'
    ),
    SampleArticle(
        key='real-scientific',
        label='Real — Scientific Report',
        description='Factual language, cited sources, research',
        text='New Study Published in Nature Reveals Climate Impact Findings. A peer-reviewed study published in the journal Nature has found that global temperatures have increased by 1.1 degrees Celsius since pre-industrial times. The research, conducted by Dr. Sarah Chen at the University of Cambridge\'s Department of Earth Sciences, analyzed temperature data from 1850 to 2023. According to the study\'s findings, the primary driver of this increase is greenhouse gas emissions from human activities. The research methodology involved analyzing over 10,000 data points from weather stations worldwide, and the data was corroborated by independent research from the National Oceanic and Atmospheric Administration. Professor Chen stated that the evidence clearly demonstrates a consistent warming trend. The study was funded by the National Science Foundation and reviewed by an independent panel of climate scientists. Dr. Michael Torres, a researcher at the Institute for Environmental Studies, confirmed the findings, noting that the methodology was systematic and the statistical analysis was comprehensive.',
        expected='REAL'
    ),
    SampleArticle(
        key='suspicious-vague',
        label='Suspicious — Vague Sources',
        description='Mix of facts with unverifiable claims',
        text='Local Residents Report Unusual Activity in Downtown Area. Some people in the community have reportedly seen unusual activity in the downtown area over the past several weeks. Sources say there has been a significant increase in foot traffic near the recently renovated commercial district. According to anonymous sources, the increase might be connected to a new development project that has not been officially announced. City spokesperson Mark Williams stated that the city is aware of the changes and is monitoring the situation. While many believe the development could bring economic growth, others allegedly have concerns about potential environmental impact. Insider reveals that the project could reportedly involve a major retail chain. The city council is reportedly considering new measures. Word on the street is that construction could begin as early as next month, according to sources close to the planning committee.',
        expected='FAKE'
    ),
    SampleArticle(
        key='conspiracy',
        label='Fake — Conspiracy Theory',
        description='Conspiracy language, opinion-based claims',
        text='The Hidden Agenda Behind the New Education Policy Exposed. Many believe that the recently announced education policy changes are part of a larger cover-up by powerful interests. The mainstream media refuses to report on the real story behind these changes. A deep state conspiracy is allegedly working to suppress the truth about what\'s really happening in our schools. They don\'t want you to know that this policy was designed by a secret group of insiders pushing their own agenda. In my opinion, it\'s obvious that something doesn\'t feel right about this. We all know they are hiding the real motivations. Wake up and demand transparency before it\'s too late! This is a devastating blow to our children\'s future. The truth is being suppressed and the globalist cabal is censoring anyone who speaks out. It\'s clear that common sense tells us this is a scam. Everyone knows the real agenda behind this fraud!',
        expected='FAKE'
    )
]


# ============================================================
# Analysis Functions
# ============================================================

def find_matches(patterns: List[str], text: str, lower_text: str):
    """Find all occurrences of patterns in text, return count and positions."""
    count = 0
    positions = []

    for pattern in patterns:
        escaped = re.escape(pattern)
        regex = re.compile(escaped, re.IGNORECASE)
        for match in regex.finditer(lower_text):
            count += 1
            if len(positions) < 20:
                positions.append({
                    'start': match.start(),
                    'end': match.end(),
                    'text': text[match.start():match.end()]
                })

    return count, positions


def analyze_article(text: str) -> AnalysisResult:
    """Main analysis function that processes article text and returns analysis result."""

    words = text.split()
    words = [w for w in words if len(w) > 0]
    word_count = len(words)
    lower_text = text.lower()

    # Too short for meaningful analysis
    if word_count < 10:
        return AnalysisResult(
            prediction='FAKE',
            confidence=0.25,
            probabilities={'real': 0.25, 'fake': 0.75},
            insights=[Insight(
                id='short-text',
                category='Text Length',
                title='Insufficient Text Length',
                description='The article is too short for reliable analysis. Provide a longer text (at least 50 words) for more accurate results.',
                impact='supports-fake',
                severity='high',
                score=0.8
            )],
            highlighted_segments=[],
            text_stats=TextStats(
                word_count=word_count, sentence_count=0,
                avg_sentence_length=0, capital_ratio=0,
                exclamation_density=0, question_density=0
            ),
            category_scores=[]
        )

    # ---- Text Statistics ----
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    sentence_count = max(len(sentences), 1)
    avg_sentence_length = word_count / sentence_count

    capital_words = [w for w in words if len(w) > 1 and w == w.upper() and re.search(r'[A-Z]', w)]
    capital_ratio = len(capital_words) / word_count

    exclamations = len(re.findall(r'!', text))
    questions = len(re.findall(r'\?', text))
    exclamation_density = exclamations / word_count
    question_density = questions / word_count

    text_stats = TextStats(
        word_count=word_count,
        sentence_count=sentence_count,
        avg_sentence_length=avg_sentence_length,
        capital_ratio=capital_ratio,
        exclamation_density=exclamation_density,
        question_density=question_density
    )

    # ---- Pattern Matching ----
    clickbait_count, clickbait_positions = find_matches(CLICKBAIT_PHRASES, text, lower_text)
    sensational_count, sensational_positions = find_matches(SENSATIONAL_WORDS, text, lower_text)
    conspiracy_count, conspiracy_positions = find_matches(CONSPIRACY_PHRASES, text, lower_text)
    vague_count, vague_positions = find_matches(VAGUE_PHRASES, text, lower_text)
    factual_count, factual_positions = find_matches(FACTUAL_WORDS, text, lower_text)
    authority_count, authority_positions = find_matches(AUTHORITY_WORDS, text, lower_text)
    opinion_count, opinion_positions = find_matches(OPINION_PHRASES, text, lower_text)

    # ---- Normalized Scores (per 100 words) ----
    norm_factor = 100 / word_count

    category_scores = [
        CategoryScore('Clickbait Language', 'Clickbait',
                      clickbait_count * norm_factor,
                      clickbait_count * norm_factor * 3.0,
                      3.0, 'fake', clickbait_count),
        CategoryScore('Sensational Language', 'Sensational',
                      sensational_count * norm_factor,
                      sensational_count * norm_factor * 2.0,
                      2.0, 'fake', sensational_count),
        CategoryScore('Conspiracy Markers', 'Conspiracy',
                      conspiracy_count * norm_factor,
                      conspiracy_count * norm_factor * 4.0,
                      4.0, 'fake', conspiracy_count),
        CategoryScore('Vague Sources', 'Vague Sources',
                      vague_count * norm_factor,
                      vague_count * norm_factor * 2.5,
                      2.5, 'fake', vague_count),
        CategoryScore('Opinion Language', 'Opinion',
                      opinion_count * norm_factor,
                      opinion_count * norm_factor * 1.5,
                      1.5, 'fake', opinion_count),
        CategoryScore('Excessive Capitalization', 'Capitalization',
                      capital_ratio * 100 * norm_factor,
                      capital_ratio * 100 * norm_factor * 2.0,
                      2.0, 'fake', len(capital_words)),
        CategoryScore('Excessive Punctuation', 'Punctuation',
                      (exclamation_density + question_density) * 100 * norm_factor,
                      (exclamation_density + question_density) * 100 * norm_factor * 1.5,
                      1.5, 'fake', exclamations + questions),
        CategoryScore('Factual Language', 'Factual',
                      factual_count * norm_factor,
                      factual_count * norm_factor * 3.0,
                      3.0, 'real', factual_count),
        CategoryScore('Authority References', 'Authority',
                      authority_count * norm_factor,
                      authority_count * norm_factor * 2.5,
                      2.5, 'real', authority_count),
    ]

    # ---- Compute Probabilities ----
    fake_score = 0.0
    real_score = 0.0

    for cs in category_scores:
        if cs.impact == 'fake':
            fake_score += cs.weighted_score
        else:
            real_score += cs.weighted_score

    # Baseline: neutral text gets roughly 50/50
    baseline = 5.0
    fake_score += baseline
    real_score += baseline

    total = fake_score + real_score
    fake_prob = fake_score / total
    real_prob = real_score / total

    # Confidence based on signal strength and text length
    signal_strength = abs(fake_prob - real_prob)
    length_confidence = min(1.0, max(0.4, word_count / 150))
    confidence = length_confidence * (0.5 + signal_strength * 0.5)
    confidence = min(0.99, max(0.25, confidence))

    prediction = 'REAL' if real_prob >= fake_prob else 'FAKE'

    # ---- Generate Insights ----
    insights = []

    if clickbait_count > 0:
        sev = 'high' if clickbait_count >= 3 else ('medium' if clickbait_count >= 2 else 'low')
        insights.append(Insight(
            id='clickbait', category='Clickbait Language',
            title='Clickbait Phrases Detected',
            description=f'Found {clickbait_count} clickbait phrase(s) — language designed to provoke curiosity and clicks rather than convey accurate information.',
            impact='supports-fake', severity=sev,
            score=min(1, clickbait_count * norm_factor * 3)
        ))

    if sensational_count > 0:
        sev = 'high' if sensational_count >= 4 else ('medium' if sensational_count >= 2 else 'low')
        insights.append(Insight(
            id='sensational', category='Sensational Language',
            title='Sensational Language Detected',
            description=f'Found {sensational_count} sensational word(s) using emotional exaggeration rather than measured, factual reporting.',
            impact='supports-fake', severity=sev,
            score=min(1, sensational_count * norm_factor * 2)
        ))

    if conspiracy_count > 0:
        sev = 'high' if conspiracy_count >= 2 else 'medium'
        insights.append(Insight(
            id='conspiracy', category='Conspiracy Markers',
            title='Conspiracy Language Detected',
            description=f'Found {conspiracy_count} conspiracy-related phrase(s) suggesting cover-ups, hidden agendas, or suppressed information without verifiable evidence.',
            impact='supports-fake', severity=sev,
            score=min(1, conspiracy_count * norm_factor * 4)
        ))

    if vague_count > 0:
        sev = 'high' if vague_count >= 3 else ('medium' if vague_count >= 2 else 'low')
        insights.append(Insight(
            id='vague', category='Vague Sources',
            title='Vague or Anonymous Sources',
            description=f'Found {vague_count} instance(s) of vague sourcing — phrases like "sources say" or "anonymous officials" that lack verifiable attribution.',
            impact='supports-fake', severity=sev,
            score=min(1, vague_count * norm_factor * 2.5)
        ))

    if opinion_count > 0:
        sev = 'medium' if opinion_count >= 3 else 'low'
        insights.append(Insight(
            id='opinion', category='Opinion Language',
            title='Opinion-Based Language',
            description=f'Found {opinion_count} opinion marker(s) indicating subjective assertions rather than objective, evidence-based reporting.',
            impact='supports-fake', severity=sev,
            score=min(1, opinion_count * norm_factor * 1.5)
        ))

    if capital_ratio > 0.08:
        sev = 'high' if capital_ratio > 0.2 else 'medium'
        insights.append(Insight(
            id='caps', category='Capitalization',
            title='Excessive Capitalization',
            description=f'{round(capital_ratio * 100)}% of words are fully capitalized — a pattern characteristic of emotionally charged or attention-seeking content.',
            impact='supports-fake', severity=sev,
            score=min(1, capital_ratio * 5)
        ))

    if exclamation_density > 0.02:
        sev = 'high' if exclamation_density > 0.05 else 'medium'
        insights.append(Insight(
            id='punctuation', category='Punctuation',
            title='Excessive Exclamation Marks',
            description=f'High density of exclamation marks ({exclamations} found), suggesting an emotional rather than factual writing style.',
            impact='supports-fake', severity=sev,
            score=min(1, exclamation_density * 20)
        ))

    if factual_count > 0:
        sev = 'high' if factual_count >= 4 else ('medium' if factual_count >= 2 else 'low')
        insights.append(Insight(
            id='factual', category='Factual Language',
            title='Factual Language Present',
            description=f'Found {factual_count} factual marker(s) — references to studies, data, methodology, and evidence-based terminology.',
            impact='supports-real', severity=sev,
            score=min(1, factual_count * norm_factor * 3)
        ))

    if authority_count > 0:
        sev = 'high' if authority_count >= 3 else ('medium' if authority_count >= 2 else 'low')
        insights.append(Insight(
            id='authority', category='Authority References',
            title='Authority Sources Cited',
            description=f'Found {authority_count} reference(s) to authoritative sources — officials, researchers, institutions, or recognized experts.',
            impact='supports-real', severity=sev,
            score=min(1, authority_count * norm_factor * 2.5)
        ))

    # Sort insights: fake first by severity, then real
    severity_order = {'high': 0, 'medium': 1, 'low': 2}
    insights.sort(key=lambda i: (
        0 if i.impact == 'supports-fake' else 1,
        severity_order[i.severity]
    ))

    # ---- Highlighted Segments ----
    all_matches = []

    def add_highlights(positions, signal_type, category):
        for pos in positions:
            all_matches.append({
                'start': pos['start'],
                'end': pos['end'],
                'text': pos['text'],
                'type': signal_type,
                'category': category
            })

    add_highlights(clickbait_positions, 'fake-signal', 'Clickbait')
    add_highlights(sensational_positions, 'fake-signal', 'Sensational')
    add_highlights(conspiracy_positions, 'fake-signal', 'Conspiracy')
    add_highlights(vague_positions, 'fake-signal', 'Vague')
    add_highlights(opinion_positions, 'fake-signal', 'Opinion')
    add_highlights(factual_positions, 'real-signal', 'Factual')
    add_highlights(authority_positions, 'real-signal', 'Authority')

    # Sort and deduplicate overlapping segments
    all_matches.sort(key=lambda m: (m['start'], -m['end']))
    deduped = []
    for m in all_matches:
        if not deduped or m['start'] >= deduped[-1]['end']:
            deduped.append(m)

    highlighted_segments = [
        HighlightedSegment(
            text=m['text'], start=m['start'], end=m['end'],
            type=m['type'], category=m['category']
        )
        for m in deduped[:15]
    ]

    return AnalysisResult(
        prediction=prediction,
        confidence=confidence,
        probabilities={'real': real_prob, 'fake': fake_prob},
        insights=insights,
        highlighted_segments=highlighted_segments,
        text_stats=text_stats,
        category_scores=category_scores
    )


# ============================================================
# Visualization Functions (Plotly)
# ============================================================

def create_confidence_gauge(confidence: float, prediction: str):
    """Create an SVG-style circular gauge using Plotly."""
    is_fake = prediction == 'FAKE'
    color = '#9B111E' if is_fake else '#059669'
    bg_color = '#F5C0CA' if is_fake else '#A7F3D0'

    fig = go.Figure()

    # Background arc
    fig.add_trace(go.Scatterpolar(
        r=[1] * 100,
        theta=[i * 3.6 for i in range(100)],
        mode='lines',
        line=dict(color=bg_color, width=14),
        showlegend=False,
    ))

    # Filled arc (confidence)
    num_points = max(2, int(confidence * 100))
    fig.add_trace(go.Scatterpolar(
        r=[1] * num_points,
        theta=[i * 3.6 for i in range(num_points)],
        mode='lines',
        line=dict(color=color, width=14),
        showlegend=False,
    ))

    fig.update_layout(
        polar=dict(
            radialaxis=dict(showticklabels=False, ticks='', showgrid=False,
                            range=[0, 1.3]),
            angularaxis=dict(showticklabels=False, ticks='', showgrid=False,
                             rotation=90),
            bgcolor='rgba(0,0,0,0)',
        ),
        margin=dict(l=20, r=20, t=20, b=20),
        height=200,
        width=200,
        annotations=[
            dict(
                text=f"<b>{round(confidence * 100)}%</b>",
                x=0.5, y=0.5, font=dict(size=28, color='#1F2937'),
                showarrow=False,
            ),
            dict(
                text="confidence",
                x=0.5, y=0.42, font=dict(size=11, color='#9CA3AF'),
                showarrow=False,
            ),
        ],
        paper_bgcolor='rgba(0,0,0,0)',
    )

    return fig


def create_signal_chart(category_scores: List[CategoryScore]):
    """Create a horizontal bar chart showing signal strengths."""
    chart_data = [cs for cs in category_scores if cs.weighted_score > 0.3 or cs.matches > 0]
    chart_data.sort(key=lambda x: x.weighted_score, reverse=True)

    if not chart_data:
        return None

    categories = [cs.display_category for cs in chart_data]
    scores = [cs.weighted_score for cs in chart_data]
    colors = ['#9B111E' if cs.impact == 'fake' else '#059669' for cs in chart_data]
    match_counts = [cs.matches for cs in chart_data]

    max_score = max(scores) if scores else 1

    fig = go.Figure()

    fig.add_trace(go.Bar(
        y=categories,
        x=scores,
        orientation='h',
        marker=dict(
            color=colors,
            opacity=0.85,
            line=dict(width=0)
        ),
        text=match_counts,
        textposition='outside',
        textfont=dict(size=11, color='#4B5563'),
    ))

    fig.update_layout(
        margin=dict(l=100, r=40, t=10, b=10),
        height=min(400, len(chart_data) * 40 + 60),
        xaxis=dict(
            showgrid=False,
            showticklabels=False,
            zeroline=False,
            range=[0, max_score * 1.2],
        ),
        yaxis=dict(
            showgrid=False,
            ticks='outside',
            tickfont=dict(size=12, color='#6B7280'),
            autorange='reversed',
        ),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        bargap=0.3,
        showlegend=False,
    )

    # Add legend annotations
    fig.add_annotation(
        x=0.01, y=-0.08,
        xref='paper', yref='paper',
        text='<span style="color:#9B111E">■</span> Fake indicators  <span style="color:#059669">■</span> Real indicators  |  Match count on right',
        font=dict(size=11, color='#9CA3AF'),
        showarrow=False,
    )

    return fig


def create_probability_chart(probabilities: dict):
    """Create horizontal probability bars using Plotly."""
    real_pct = round(probabilities['real'] * 100)
    fake_pct = round(probabilities['fake'] * 100)

    fig = go.Figure()

    # Real bar
    fig.add_trace(go.Bar(
        y=['Real News'],
        x=[real_pct],
        orientation='h',
        marker=dict(color='#059669', opacity=0.9),
        text=[f'{real_pct}%'],
        textposition='inside',
        textfont=dict(size=14, color='white'),
        showlegend=False,
    ))

    # Fake bar
    fig.add_trace(go.Bar(
        y=['Fake News'],
        x=[fake_pct],
        orientation='h',
        marker=dict(color='#9B111E', opacity=0.9),
        text=[f'{fake_pct}%'],
        textposition='inside',
        textfont=dict(size=14, color='white'),
        showlegend=False,
    ))

    fig.update_layout(
        margin=dict(l=80, r=20, t=10, b=10),
        height=100,
        xaxis=dict(
            showgrid=False,
            range=[0, 100],
            ticks='',
            showticklabels=False,
        ),
        yaxis=dict(
            showgrid=False,
            tickfont=dict(size=13, color='#374151'),
        ),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        bargap=0.4,
    )

    return fig


# ============================================================
# UI Rendering Functions
# ============================================================

def render_prediction_banner(prediction: str, confidence: float):
    """Render the prediction result banner."""
    is_fake = prediction == 'FAKE'
    banner_class = 'prediction-fake' if is_fake else 'prediction-real'
    icon_class = 'prediction-icon-fake' if is_fake else 'prediction-icon-real'
    label_class = 'prediction-label-fake' if is_fake else 'prediction-label-real'
    icon = '⚠️' if is_fake else '✅'
    label = 'FAKE NEWS' if is_fake else 'REAL NEWS'

    html = f"""
    <div class="{banner_class}">
        <div class="prediction-icon {icon_class}">{icon}</div>
        <div>
            <div class="prediction-label {label_class}">{label}</div>
            <div class="prediction-sublabel">
                Predicted with <span>{round(confidence * 100)}%</span> confidence
            </div>
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def render_insight_cards(insights: List[Insight]):
    """Render insight cards with severity badges."""
    for insight in insights:
        is_fake = insight.impact == 'supports-fake'
        card_class = 'insight-card-fake' if is_fake else 'insight-card-real'
        dot_class = 'insight-dot-fake' if is_fake else 'insight-dot-real'

        # Severity badge
        if is_fake:
            sev_class = f'severity-{insight.severity}-fake'
        else:
            sev_class = f'severity-{insight.severity}-real'

        html = f"""
        <div class="insight-card {card_class}">
            <div style="display:flex; align-items:flex-start; gap:10px;">
                <span class="insight-dot {dot_class}" style="margin-top:7px;"></span>
                <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span style="font-size:0.85rem; font-weight:600; color:#1F2937;">{insight.title}</span>
                        <span class="{sev_class}">{insight.severity}</span>
                    </div>
                    <div style="font-size:0.75rem; color:#6B7280; line-height:1.5;">{insight.description}</div>
                </div>
            </div>
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)


def render_keyword_highlight(original_text: str, highlighted_segments: List[HighlightedSegment]):
    """Render text with highlighted key phrases."""
    if not highlighted_segments:
        st.markdown(
            '<div style="font-size:0.85rem; color:#9CA3AF;">No specific key phrases detected for highlighting.</div>',
            unsafe_allow_html=True
        )
        return

    # Deduplicate overlapping segments
    sorted_segs = sorted(highlighted_segments, key=lambda s: (s.start, -s.end))
    filtered = []
    for seg in sorted_segs:
        if not filtered or seg.start >= filtered[-1].end:
            filtered.append(seg)

    # Build highlighted HTML
    parts = []
    last_end = 0

    for seg in filtered:
        if seg.start > last_end:
            parts.append(original_text[last_end:seg.start])

        end = min(seg.end, len(original_text))
        highlight_class = 'keyword-highlight-fake' if seg.type == 'fake-signal' else 'keyword-highlight-real'
        escaped_text = original_text[seg.start:end].replace('"', '&quot;').replace("'", '&#39;')
        parts.append(f'<span class="{highlight_class}" title="{seg.category}">{escaped_text}</span>')
        last_end = end

    if last_end < len(original_text):
        parts.append(original_text[last_end:])

    highlighted_html = ''.join(parts)

    # Escape any remaining HTML in non-highlighted parts carefully
    # We already built the HTML with spans, so we just wrap it
    html = f"""
    <div style="
        background: rgba(249, 250, 251, 0.8);
        border: 1px solid rgba(229, 231, 235, 0.6);
        border-radius: 12px;
        padding: 16px;
        font-size: 0.85rem;
        line-height: 1.6;
        max-height: 180px;
        overflow-y: auto;
    ">
        {highlighted_html}
    </div>
    <div style="display:flex; gap:16px; margin-top:8px; font-size:0.75rem; color:#9CA3AF;">
        <div><span class="keyword-highlight-fake" style="padding:1px 6px;">Fake patterns</span></div>
        <div><span class="keyword-highlight-real" style="padding:1px 6px;">Real patterns</span></div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def render_text_stats(text_stats: TextStats):
    """Render text statistics as inline badges."""
    items = [
        ('Words', str(text_stats.word_count)),
        ('Sentences', str(text_stats.sentence_count)),
        ('Avg Length', f'{text_stats.avg_sentence_length:.1f} words'),
        ('CAPS Ratio', f'{text_stats.capital_ratio * 100:.1f}%'),
    ]

    html_parts = []
    for label, value in items:
        html_parts.append(
            f'<span class="stat-badge"><span class="stat-label">{label}: </span><span class="stat-value">{value}</span></span>'
        )

    st.markdown(''.join(html_parts), unsafe_allow_html=True)


# ============================================================
# Main App
# ============================================================

def main():
    # ---- Header ----
    col_icon, col_title = st.columns([1, 12])
    with col_icon:
        st.markdown("""
        <div style="
            width: 36px; height: 36px; border-radius: 8px;
            background: #9B111E; display: flex; align-items: center;
            justify-content: center; color: white; font-size: 18px;
        ">🛡️</div>
        """, unsafe_allow_html=True)

    with col_title:
        st.markdown("""
        <div>
            <div style="font-size:1.1rem; font-weight:800; color:#1F2937; letter-spacing:-0.02em;">Veritas</div>
            <div style="font-size:0.75rem; color:#9CA3AF; font-weight:500;">AI-Powered Fake News Detection</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('<div style="height:8px;"></div>', unsafe_allow_html=True)

    # ---- Input Section ----
    st.markdown('<div class="section-divider"></div>', unsafe_allow_html=True)

    # Label row
    label_col, counter_col = st.columns([8, 4])
    with label_col:
        st.markdown('<div style="font-size:0.95rem; font-weight:700; color:#1F2937;">Enter News Article</div>', unsafe_allow_html=True)
    with counter_col:
        word_count_display = len([w for w in st.session_state.get('article_text', '').split() if len(w) > 0])
        char_count = len(st.session_state.get('article_text', ''))
        if char_count > 0:
            st.markdown(
                f'<div style="font-size:0.75rem; color:#9CA3AF; text-align:right; tabular-num:true;">{word_count_display} words · {char_count} chars</div>',
                unsafe_allow_html=True
        )
        else:
            st.markdown(
                '<div style="font-size:0.75rem; color:#9CA3AF; text-align:right;">Paste or type an article</div>',
                unsafe_allow_html=True
        )

    # Initialize session state
    if 'article_text' not in st.session_state:
        st.session_state.article_text = ''
    if 'analysis_result' not in st.session_state:
        st.session_state.analysis_result = None
    if 'is_analyzing' not in st.session_state:
        st.session_state.is_analyzing = False

    # Textarea
    article_text = st.text_area(
        label="article_input",
        value=st.session_state.article_text,
        placeholder="Paste or type a news article here to analyze its authenticity...",
        height=200,
        label_visibility="collapsed",
        disabled=st.session_state.is_analyzing,
        key="text_input_widget"
    )

    # Update session state when text changes
    if article_text != st.session_state.article_text:
        st.session_state.article_text = article_text
        if st.session_state.analysis_result:
            st.session_state.analysis_result = None

    # Sample articles
    st.markdown('<div style="font-size:0.8rem; font-weight:500; color:#6B7280; margin-bottom:8px;">Try a sample article:</div>', unsafe_allow_html=True)

    sample_cols = st.columns(len(SAMPLE_ARTICLES))
    for i, sample in enumerate(SAMPLE_ARTICLES):
        with sample_cols[i]:
            if st.button(
                f"📋 {sample.label}",
                key=f"sample_{sample.key}",
                use_container_width=True,
                disabled=st.session_state.is_analyzing,
            ):
                st.session_state.article_text = sample.text
                st.session_state.analysis_result = None
                # Need to update the text area value - use rerun
                st.rerun()

    # Action buttons
    st.markdown('<div style="height:8px;"></div>', unsafe_allow_html=True)
    btn_col1, btn_col2, btn_col3 = st.columns([2, 1, 3])

    with btn_col1:
        analyze_disabled = not st.session_state.article_text.strip() or st.session_state.is_analyzing
        if st.button(
            "✨ Analyze Article",
            key="analyze_btn",
            use_container_width=True,
            disabled=analyze_disabled,
        ):
            st.session_state.is_analyzing = True
            st.session_state.analysis_result = None

            # Simulate processing time
            with st.spinner("Analyzing article..."):
                time.sleep(1.8)
                result = analyze_article(st.session_state.article_text)
                st.session_state.analysis_result = result
                st.session_state.is_analyzing = False
                st.rerun()

    with btn_col2:
        if st.session_state.article_text.strip() and not st.session_state.is_analyzing:
            if st.button(
                "🔄 Clear",
                key="clear_btn",
                use_container_width=True,
            ):
                st.session_state.article_text = ''
                st.session_state.analysis_result = None
                st.rerun()

    # ---- Loading Indicator ----
    if st.session_state.is_analyzing:
        st.markdown("""
        <div style="text-align:center; padding:2rem;">
            <div style="font-size:0.9rem; font-weight:600; color:#1F2937;">Analyzing article...</div>
            <div style="font-size:0.75rem; color:#9CA3AF; margin-top:4px;">Processing text patterns and linguistic signals</div>
        </div>
        """, unsafe_allow_html=True)

    # ---- Results Section ----
    if st.session_state.analysis_result and not st.session_state.is_analyzing:
        results = st.session_state.analysis_result

        st.markdown('<div class="section-divider"></div>', unsafe_allow_html=True)
        st.markdown('<div class="results-container">', unsafe_allow_html=True)

        # Section title
        st.markdown('<div class="section-header">Analysis Results</div>', unsafe_allow_html=True)

        # Row 1: Prediction Banner + Confidence Gauge
        banner_col, gauge_col = st.columns([3, 2])

        with banner_col:
            render_prediction_banner(results.prediction, results.confidence)

        with gauge_col:
            gauge_fig = create_confidence_gauge(results.confidence, results.prediction)
            st.plotly_chart(gauge_fig, use_container_width=True, config={'displayModeBar': False})

        # Row 2: Probability Breakdown
        st.markdown('<div class="section-header">Probability Breakdown</div>', unsafe_allow_html=True)
        prob_fig = create_probability_chart(results.probabilities)
        st.plotly_chart(prob_fig, use_container_width=True, config={'displayModeBar': False})

        # Row 3: Signal Strength Chart
        has_signals = any(cs.weighted_score > 0.3 or cs.matches > 0 for cs in results.category_scores)
        if has_signals:
            st.markdown('<div class="section-header">Signal Strength Analysis</div>', unsafe_allow_html=True)
            signal_fig = create_signal_chart(results.category_scores)
            if signal_fig:
                st.plotly_chart(signal_fig, use_container_width=True, config={'displayModeBar': False})

        # Row 4: Key Findings
        if results.insights:
            st.markdown('<div class="section-header">Key Findings</div>', unsafe_allow_html=True)
            render_insight_cards(results.insights)

        # Row 5: Key Phrases
        st.markdown('<div class="section-header">Key Phrases Detected</div>', unsafe_allow_html=True)
        render_keyword_highlight(st.session_state.article_text, results.highlighted_segments)

        # Row 6: Text Statistics
        st.markdown('<div class="section-header">Text Statistics</div>', unsafe_allow_html=True)
        render_text_stats(results.text_stats)

        st.markdown('</div>', unsafe_allow_html=True)

        # Disclaimer
        st.markdown("""
        <div class="disclaimer">
            Results are based on heuristic text pattern analysis and should be interpreted as indicators,
            not definitive proof. This tool is for educational purposes and should not be the sole basis
            for determining article authenticity.
        </div>
        """, unsafe_allow_html=True)

    # ---- Footer ----
    st.markdown("""
    <div class="app-footer">
        Veritas Fake News Detector · Text analysis-based prediction model · For educational and research purposes only
    </div>
    """, unsafe_allow_html=True)


if __name__ == '__main__':
    main()
