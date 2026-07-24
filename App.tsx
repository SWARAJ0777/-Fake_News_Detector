import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Shield,
  FileText,
  ChevronDown,
  Sparkles,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { analyzeArticle, SAMPLE_ARTICLES } from './utils/analyzer';
import type { AnalysisResult } from './utils/analyzer';
import ResultsSection from './components/ResultsSection';

export default function App() {
  const [articleText, setArticleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [selectedSample, setSelectedSample] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [resultsKey, setResultsKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const handleAnalyze = useCallback(() => {
    if (!articleText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setResults(null);

    // Simulate ML processing time
    setTimeout(() => {
      const result = analyzeArticle(articleText);
      setResults(result);
      setResultsKey((k) => k + 1);
      setIsAnalyzing(false);
    }, 1800);
  }, [articleText, isAnalyzing]);

  const handleClear = useCallback(() => {
    setArticleText('');
    setResults(null);
    setSelectedSample('');
    setResultsKey((k) => k + 1);
  }, []);

  const handleSampleSelect = useCallback(
    (key: string) => {
      const sample = SAMPLE_ARTICLES.find((s) => s.key === key);
      if (sample) {
        setArticleText(sample.text);
        setSelectedSample(key);
        setResults(null);
        setResultsKey((k) => k + 1);
      }
      setShowDropdown(false);
    },
    []
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setArticleText(e.target.value);
      if (selectedSample) setSelectedSample('');
      if (results) {
        setResults(null);
        setResultsKey((k) => k + 1);
      }
    },
    [selectedSample, results]
  );

  // Scroll to results when they appear
  useEffect(() => {
    if (results && !isAnalyzing && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [results, isAnalyzing]);

  const wordCount = articleText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const canAnalyze = articleText.trim().length > 0 && !isAnalyzing;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ==================== Header ==================== */}
      <header
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
      >
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3"
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-ruby-500 text-white shadow-sm"
          >
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1
              className="text-lg font-bold text-gray-900 tracking-tight"
            >
              Veritas
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              AI-Powered Fake News Detection
            </p>
          </div>
        </div>
      </header>

      {/* ==================== Main ==================== */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Input Section */}
        <section className="space-y-4">
          {/* Label + Counter */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="article-input"
              className="text-base font-bold text-gray-900"
            >
              Enter News Article
            </label>
            <span className="text-xs text-gray-400 tabular-nums">
              {articleText.length > 0
                ? `${wordCount} words · ${articleText.length} chars`
                : 'Paste or type an article'}
            </span>
          </div>

          {/* Textarea */}
          <textarea
            id="article-input"
            value={articleText}
            onChange={handleTextChange}
            placeholder="Paste or type a news article here to analyze its authenticity..."
            className="w-full h-44 sm:h-52 p-4 rounded-xl border border-gray-200 text-gray-800 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ruby-500/20 focus:border-ruby-400 transition-all duration-200 placeholder:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isAnalyzing}
          />

          {/* Sample Dropdown */}
          <div ref={dropdownRef} className="relative inline-block">
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors duration-150"
            >
              <FileText className="w-4 h-4" />
              Try a sample
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showDropdown && (
              <div
                className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 animate-fade-in"
              >
                {SAMPLE_ARTICLES.map((sample) => (
                  <button
                    key={sample.key}
                    onClick={() => handleSampleSelect(sample.key)}
                    className={`w-full px-4 py-2.5 text-left transition-colors duration-100 ${
                      selectedSample === sample.key
                        ? 'bg-ruby-50 text-ruby-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {sample.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {sample.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ruby-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-ruby-600 active:bg-ruby-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Article
                </>
              )}
            </button>

            {articleText.trim() && !isAnalyzing && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:text-gray-600 hover:border-gray-300 transition-all duration-150"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </section>

        {/* ==================== Loading ==================== */}
        {isAnalyzing && (
          <div
            className="mt-10 flex items-center justify-center gap-3 py-8 animate-fade-in"
          >
            <Loader2 className="w-6 h-6 animate-spin text-ruby-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Analyzing article...
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Processing text patterns and linguistic signals
              </p>
            </div>
          </div>
        )}

        {/* ==================== Results ==================== */}
        {results && !isAnalyzing && (
          <div ref={resultsRef} key={resultsKey}>
            <ResultsSection
              results={results}
              originalText={articleText}
            />
          </div>
        )}
      </main>

      {/* ==================== Footer ==================== */}
      <footer className="border-t border-gray-100 mt-auto">
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-5 text-center"
        >
          <p className="text-xs text-gray-400 leading-relaxed">
            Veritas Fake News Detector · Text analysis-based
            prediction model · For educational and research purposes
            only
          </p>
        </div>
      </footer>
    </div>
  );
}
