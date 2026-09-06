import { Article } from '../types';

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'mock-1',
    source_id: 'arxiv-ai',
    source_name: 'arXiv cs.AI',
    title: 'Reasoning with Latent Thought Chains: Autonomous Alignment for Complex Mathematical Reasoning',
    url: 'https://arxiv.org/abs/2403.09629',
    author: 'Elena Rostova, David K. Chen, Marcus Vance',
    category: 'AI & Machine Learning',
    summary: 'We present LatentChain, an unsupervised paradigm that internalizes multi-step reasoning into continuous latent representations before decoding symbolic tokens. Across GSM8K and MATH benchmarks, this approach achieves state-of-the-art token efficiency while outperforming chain-of-thought baselines by 14.2%.',
    published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    read_status: false,
    saved_status: true,
    ai_summary: `### Core Contributions
- **LatentChain Paradigm**: Compresses chain-of-thought intermediate tokens into continuous latent vectors, drastically reducing decoding latency.
- **Performance**: Outperforms standard CoT by 14.2% on GSM8K and MATH while consuming 40% fewer output tokens.
- **Autonomous Alignment**: Eliminates reliance on human-annotated step-by-step rationales through self-supervised reinforcement signals.`
  },
  {
    id: 'mock-2',
    source_id: 'arxiv-lg',
    source_name: 'arXiv cs.LG',
    title: 'Scalable Diffusion Models for High-Dimensional Structured Graph Generation',
    url: 'https://arxiv.org/abs/2403.09100',
    author: 'Sophia Zhang, Alexander Mueller, Kenji Sato',
    category: 'AI & Machine Learning',
    summary: 'Generating large discrete graphs with permutation invariance remains a formidable bottleneck in molecular and network design. We introduce GraphDiff-v2, leveraging edge-contraction diffusion kernels and sparse message-passing transformers to generate 50,000-node graphs in sub-second inference.',
    published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3h ago
    read_status: false,
    saved_status: false,
    ai_summary: null
  },
  {
    id: 'mock-3',
    source_id: 'mit-tech-review',
    source_name: 'MIT Technology Review',
    title: 'Why Silicon-Photonic Interconnects May Finally Break the AI Hardware Memory Wall',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    author: 'Rachel Thornton',
    category: 'Systems & Hardware',
    summary: 'As frontier models scale into trillions of parameters, electronic interconnects between GPU clusters face severe thermal and bandwidth boundaries. Optical I/O using co-packaged silicon photonics is transitioning from lab prototypes into volume datacenters, promising 10x bandwidth density at fraction of the power.',
    published_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6h ago
    read_status: true,
    saved_status: true,
    ai_summary: `### Key Takeaways
- **The Memory & Interconnect Bottleneck**: Electronic copper interconnects generate excessive heat and latency at multi-terabit bandwidths.
- **Optical I/O Revolution**: Co-packaged optics replace electronic traces with micro-lasers and optical wave-guides directly on-chip.
- **Impact**: Enables 10x higher throughput across distributed GPU clusters with up to 70% reduction in communication power draw.`
  },
  {
    id: 'mock-4',
    source_id: 'hackernews',
    source_name: 'Hacker News Frontpage',
    title: 'Show HN: PGlite – Lightweight WebAssembly Postgres running directly in Node and the Browser',
    url: 'https://news.ycombinator.com/item?id=39812456',
    author: 'electric_dev',
    category: 'Computer Science',
    summary: 'PGlite is a WASM build of Postgres packaged into a tiny TypeScript/JS library. It allows you to run a real Postgres database in memory, persisted to indexedDB in the browser, or to the local filesystem in Node.js, with zero server installation required.',
    published_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12h ago
    read_status: false,
    saved_status: false,
    ai_summary: null
  },
  {
    id: 'mock-5',
    source_id: 'nature',
    source_name: 'Nature Machine Intelligence',
    title: 'Closed-Loop Deep Reinforcement Learning for Autonomous Laboratory Synthesis',
    url: 'https://www.nature.com/natmachintell/',
    author: 'H. Nakamura, L. Dupont, C. Morales',
    category: 'Science & Bio',
    summary: 'Automating empirical chemical synthesis requires algorithms capable of navigating non-differentiable reaction spaces under physical reagent constraints. We report an end-to-end robotic system guided by policy-gradient agents that synthesized 84 novel catalysts with zero human intervention.',
    published_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1d ago
    read_status: false,
    saved_status: false,
    ai_summary: null
  },
  {
    id: 'mock-6',
    source_id: 'techcrunch',
    source_name: 'TechCrunch AI',
    title: 'Open-Weight Models Close the Gap on Agentic Code Generation Benchmarks',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    author: 'Kyle Wiggers',
    category: 'Tech News',
    summary: 'Recent evaluations on SWE-bench and HumanEval indicate open-weight community models fine-tuned with high-quality synthetic trajectory rollouts are approaching frontier proprietary API performance in resolving real-world GitHub issues.',
    published_at: new Date(Date.now() - 1000 * 60 * 1800).toISOString(), // 1.25d ago
    read_status: true,
    saved_status: false,
    ai_summary: null
  }
];
