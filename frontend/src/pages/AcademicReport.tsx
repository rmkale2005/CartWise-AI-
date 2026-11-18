import React from 'react';
import {
  BookOpen,
  Layers,
  GitFork,
  BrainCircuit,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const AcademicReport: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Academic Dissertation & Technical Deliverables
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          CartWise: E-commerce Customer Behaviour Mining and Cart Abandonment Prediction
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive project report covering theoretical foundations, Web Usage Mining, machine learning algorithms, and system architecture.
        </p>
      </div>

      {/* 1. Abstract */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">1</span>
          Project Abstract
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
          In online retailing, shopping cart abandonment poses one of the most substantial revenue leakages, with global industrial benchmarks consistently hovering between 65% and 75%. <strong>CartWise</strong> is an end-to-end Web Usage Mining and Machine Learning platform architected to reconstruct customer session navigation from raw clickstream event logs, quantify hesitation patterns, and predict cart abandonment in real time. Employing a 30-minute inactivity sessionization threshold, the platform analyzes transitions across product views, cart additions, and checkout events. For predictive modeling, a Random Forest Classifier and a baseline Logistic Regression model are evaluated under strict chronological train-test holdouts to prevent temporal data leakage. Unsupervised K-Means clustering segments visitors into actionable behavioral archetypes. The resulting platform delivers interactive analytics and data-grounded recommendations to help e-commerce retailers minimize checkout friction.
        </p>
      </section>

      {/* 2. Problem Statement */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">2</span>
          Problem Statement
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
          Online e-commerce stores routinely collect gigabytes of raw clickstream logs (views, carts, searches). However, conventional analytics platforms treat pageviews in isolation, failing to:
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
          <li>Reconstruct continuous customer shopping sessions across realistic inactivity boundaries.</li>
          <li>Distinguish benign "window browsing" from genuine cart drop-off hesitation.</li>
          <li>Proactively forecast whether an active shopping session is on trajectory to abandon prior to exit.</li>
          <li>Provide explainable behavioural drivers behind predictive scores to guide merchandising interventions.</li>
        </ul>
      </section>

      {/* 3. Project Objectives */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">3</span>
          Project Objectives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">1. Web Usage Mining Pipeline</h4>
            <p className="text-slate-500 dark:text-slate-400">Implement session reconstruction with a 30-minute inactivity threshold and first-order Markov transition probabilities.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">2. Rigorous Abandonment Labeling</h4>
            <p className="text-slate-500 dark:text-slate-400">Isolate sessions containing &ge;1 cart addition without purchase, excluding non-cart browsing from distortion.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">3. Predictive Machine Learning</h4>
            <p className="text-slate-500 dark:text-slate-400">Train Random Forest & Logistic Regression on chronological holdouts with full ROC-AUC and Confusion Matrix reporting.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">4. Unsupervised Segmentation</h4>
            <p className="text-slate-500 dark:text-slate-400">Cluster visitors via K-Means and project multidimensional vectors onto 2D space using Principal Component Analysis.</p>
          </div>
        </div>
      </section>

      {/* 4. Existing System vs. Proposed System */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">4</span>
          Existing System vs. Proposed System
        </h2>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3 text-rose-600">Existing Analytics Systems</th>
                <th className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400">CartWise AI (Proposed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">Data Level</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Isolated event counts (pageviews, clicks)</td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">Reconstructed 30-min user sessions & sequence flows</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">Abandonment Modeling</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Retrospective aggregate percentages only</td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">Real-time session-level predictive classification</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">Temporal Validity</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Random K-Fold cross validation (temporal leakage)</td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">Chronological train/test split mimicking actual deployment</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">Interpretability</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Black-box or superficial charts</td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">Driver attribution, PCA 2D cluster visualization & Markov matrix</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. System Architecture & DFD */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">5</span>
          System Architecture & Data Flow
        </h2>

        {/* ASCII Architecture Flowchart */}
        <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto">
          {`
+-----------------------------------------------------------------------------------+
|                           CARTWISE SYSTEM ARCHITECTURE                            |
+-----------------------------------------------------------------------------------+

 [Raw Clickstream CSV / REES46 Benchmark]
                |
                v
 [Data Preprocessing Engine] -----> Deduplication & Type Casting & Schema Validation
                |
                v
 [Web Usage Mining: Sessionizer] --> 30-min Inactivity Window & Browsing Sequence Mining
                |
     +----------+----------+-----------------------------+
     |                     |                             |
     v                     v                             v
[Abandonment Target]  [Feature Engineering]      [Markov Transition Prob.]
(Cart >= 1, Pur = 0)  (Leak-Free Features)       P(S_{t+1} | S_t)
     |                     |                             |
     +----------+----------+                             |
                |                                        |
                v                                        |
 [Machine Learning Pipeline]                             |
   - Chronological 75/25 Split                           |
   - Standard Scaler Normalization                       |
   - Baseline: Logistic Regression                       |
   - Primary: Random Forest Classifier                   |
   - Evaluation: ROC-AUC, Confusion Matrix               |
                |                                        |
                v                                        v
 [FastAPI & Starlette REST API Layer] <---- [K-Means & PCA Clustering]
                |
                v
 [React 19 + TypeScript + Recharts Dashboard UI]
          `}
        </div>
      </section>

      {/* 6. Algorithms Used */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">6</span>
          Algorithms & Mathematical Formulation
        </h2>
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">A. 30-Minute Inactivity Sessionization</h4>
            <p className="mt-1 leading-relaxed">
              Given consecutive clickstream events E(i) and E(i+1) from user U, a new session boundary is enforced if inactivity exceeds 30 minutes:
            </p>
            <div className="mt-1.5 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
              Δt = t(E_{"{i+1}"}) - t(E_{"{i}"}) &gt; 1800 seconds (30 minutes)
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">B. First-Order Markov Transition Matrix</h4>
            <p className="mt-1 leading-relaxed">
              Calculates empirical probability of moving from clickstream action S(i) to S(j) across view, cart, purchase, session_end:
            </p>
            <div className="mt-1.5 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
              P(S_j | S_i) = N(S_i → S_j) / Σ_k N(S_i → S_k)
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">C. Random Forest Classification (Primary Model)</h4>
            <p className="mt-1 leading-relaxed">
              Ensemble of B = 100 decorrelated decision trees using bootstrap aggregation with balanced class weighting:
            </p>
            <div className="mt-1.5 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
              p̂(Abandon = 1 | X) = (1 / B) * Σ_{"{b=1}"}^{"{B}"} T_b(X)
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">D. K-Means Customer Clustering</h4>
            <p className="mt-1 leading-relaxed">
              Partitions standardized customer behavioral vectors into K = 4 clusters minimizing within-cluster variance (inertia):
            </p>
            <div className="mt-1.5 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
              Inertia J = Σ_{"{k=1}"}^{"{K}"} Σ_{"{x_i ∈ C_k}"} ||x_i - μ_k||²
            </div>
          </div>
        </div>
      </section>

      {/* 7. Conclusion */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">7</span>
          Conclusion & Research Contributions
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
          The <strong>CartWise</strong> project demonstrates that transforming raw clickstream data through Web Usage Mining yields actionable behavioral features that standard web analytics miss. By coupling 30-minute sessionization, strictly leak-free chronological machine learning, and unsupervised clustering, CartWise demonstrates high predictive fidelity and produces empirical, evidence-grounded recommendations for reducing shopping cart abandonment.
        </p>
      </section>
    </div>
  );
};
