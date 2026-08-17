-- PDM Resource Hub — schema, RLS, and seed data for Google-auth ownership.
-- Run this once in the Supabase Studio SQL Editor (Project > SQL Editor > New query).

-- ============================================================================
-- Schema
-- ============================================================================

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null check (
    category in ('Product', 'Design', 'Business', 'Dev', 'AI')
  ),
  topics text[] not null default '{}',
  purpose text not null check (
    purpose in (
      'Learn a concept',
      'Practice / drill',
      'Portfolio / case study',
      'Interview prep',
      'Career guidance',
      'Reference / lookup'
    )
  ),
  type text not null check (
    type in (
      'Article', 'Video', 'Course', 'Book', 'Template',
      'Podcast', 'Tool', 'Case Study', 'Community'
    )
  ),
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  cost text not null check (cost in ('Free', 'Freemium', 'Paid')),
  why_useful text not null,
  -- Google display name captured at submission time.
  recommended_by text not null,
  -- Owning user. NULL for the curated seed catalog below, which has no real
  -- owner and is intentionally not editable/deletable via the app.
  created_by uuid references auth.users (id) on delete set null,
  date_added date not null default (timezone('utc', now()))::date,
  recommended boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_links (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  label text not null,
  url text not null,
  position integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists resources_created_by_idx on public.resources (created_by);
create index if not exists resource_links_resource_id_idx on public.resource_links (resource_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.resources enable row level security;
alter table public.resource_links enable row level security;

drop policy if exists "Public can view resources" on public.resources;
create policy "Public can view resources"
  on public.resources for select
  using (true);

drop policy if exists "Authenticated users can insert resources" on public.resources;
create policy "Authenticated users can insert resources"
  on public.resources for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Owners can update their resources" on public.resources;
create policy "Owners can update their resources"
  on public.resources for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Owners can delete their resources" on public.resources;
create policy "Owners can delete their resources"
  on public.resources for delete
  to authenticated
  using (auth.uid() = created_by);

drop policy if exists "Public can view resource links" on public.resource_links;
create policy "Public can view resource links"
  on public.resource_links for select
  using (true);

drop policy if exists "Authenticated users can insert resource links" on public.resource_links;
create policy "Authenticated users can insert resource links"
  on public.resource_links for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Owners can update their resource links" on public.resource_links;
create policy "Owners can update their resource links"
  on public.resource_links for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Owners can delete their resource links" on public.resource_links;
create policy "Owners can delete their resource links"
  on public.resource_links for delete
  to authenticated
  using (auth.uid() = created_by);

-- ============================================================================
-- Seed: curated catalog carried over from lib/resources/data.ts
-- created_by is left NULL for these rows (no real owning user) so ownership
-- policies never match them; nobody can edit/delete them via the app, matching
-- the read-only behavior the mock catalog already had.
-- ============================================================================

with seeded as (
  insert into public.resources
    (slug, title, description, category, topics, purpose, type, level, cost, why_useful, recommended_by, date_added, recommended)
  values
    ('cracking-the-pm-interview', 'Cracking the PM Interview', 'A comprehensive guide to product management interviews, covering behavioral, product design, and analytical/metrics questions.', 'Product', ARRAY['Interview Prep', 'Case Studies', 'Behavioral Questions']::text[], 'Interview prep', 'Book', 'Beginner', 'Paid', 'One of the most widely used PM interview prep resources — great for building a repeatable answer structure before your first mock interview.', 'Priya Nair', '2026-02-10', true),
    ('lennys-newsletter', 'Lenny''s Newsletter', 'A widely-read newsletter from ex-Airbnb PM Lenny Rachitsky covering product strategy, growth, and career advice from top operators.', 'Product', ARRAY['Product Strategy', 'Growth', 'Career Growth']::text[], 'Career guidance', 'Article', 'Intermediate', 'Freemium', 'Weekly essays and interviews give you current, practitioner-level thinking you can reference in interviews and on the job.', 'Daniel Cho', '2026-06-01', true),
    ('reforge-growth-series', 'Reforge Growth Series', 'A cohort-based program teaching growth loops, retention mechanics, and experimentation frameworks used by top tech companies.', 'Product', ARRAY['Growth', 'Retention', 'Product Strategy']::text[], 'Learn a concept', 'Course', 'Advanced', 'Paid', 'Goes deeper than most free content on growth mechanics — useful if you''re targeting growth PM roles specifically.', 'Nina Torres', '2026-03-22', false),
    ('svpg-articles', 'SVPG: Product Leadership Articles', 'Marty Cagan''s collection of essays on empowered product teams, discovery, and product leadership at Silicon Valley Product Group.', 'Product', ARRAY['Product Strategy', 'Leadership', 'Roadmapping']::text[], 'Learn a concept', 'Article', 'Intermediate', 'Free', 'The clearest free explanation of what separates strong product orgs from feature-factory teams — a common interview topic.', 'Marcus Webb', '2026-01-18', true),
    ('product-case-interview-drills', 'Product Case Interview Drills', 'A bank of timed product design and estimation case prompts with sample frameworks and model answers.', 'Product', ARRAY['Case Interview', 'Frameworks', 'Metrics']::text[], 'Practice / drill', 'Case Study', 'Beginner', 'Freemium', 'Repetition under a timer is what actually builds case-interview fluency — this gives you enough volume to drill the format.', 'Grace Kim', '2026-05-14', false),
    ('masters-of-scale-podcast', 'Masters of Scale', 'Reid Hoffman''s podcast interviewing founders and executives about how they scaled their companies.', 'Product', ARRAY['Leadership', 'Scaling', 'Founder Stories']::text[], 'Career guidance', 'Podcast', 'Beginner', 'Free', 'Real founder stories give you concrete examples to use when interviewers ask for examples of leadership or scaling decisions.', 'Jordan Blake', '2026-06-15', false),
    ('dont-make-me-think', 'Don''t Make Me Think', 'Steve Krug''s classic, practical introduction to usability and intuitive web/app design.', 'Design', ARRAY['Usability', 'Information Architecture', 'UX Writing']::text[], 'Learn a concept', 'Book', 'Beginner', 'Paid', 'Short and concrete — the fastest way to internalize core usability heuristics before a design-sense interview question.', 'Sofia Martins', '2026-01-05', true),
    ('nng-usability-heuristics', 'Nielsen Norman Group: Usability Heuristics', 'NN/g''s foundational articles on the 10 usability heuristics and how to apply them in design reviews.', 'Design', ARRAY['Usability', 'Heuristic Evaluation', 'UX Research']::text[], 'Reference / lookup', 'Article', 'Beginner', 'Free', 'The reference PMs and designers both cite when discussing UX tradeoffs — good shorthand vocabulary for interviews.', 'Emily Chen', '2026-02-27', true),
    ('figma-community-templates', 'Figma Community Wireframe Kits', 'Free, community-published Figma files for low-fidelity wireframes, flows, and quick prototypes.', 'Design', ARRAY['Wireframing', 'Prototyping', 'Design Systems']::text[], 'Portfolio / case study', 'Template', 'Beginner', 'Free', 'Lets non-designer PMs sketch a believable prototype fast for a portfolio case study without starting from a blank canvas.', 'Leo Fischer', '2026-04-09', false),
    ('ideo-design-kit', 'IDEO Design Kit', 'IDEO''s open library of human-centered design methods, from research through prototyping and testing.', 'Design', ARRAY['Design Thinking', 'User Research', 'Facilitation']::text[], 'Learn a concept', 'Tool', 'Intermediate', 'Free', 'Gives you named methods and facilitation steps to reference when a case interview asks how you''d run a discovery process.', 'Chloe Bennett', '2026-03-02', false),
    ('baymard-ux-benchmarks', 'Baymard Institute UX Research', 'Large-sample UX research and benchmarks on checkout, search, and navigation patterns across major sites.', 'Design', ARRAY['UX Research', 'Conversion', 'Ecommerce']::text[], 'Reference / lookup', 'Article', 'Advanced', 'Freemium', 'Real research data (not opinion) you can cite when justifying a design or product decision with evidence.', 'Omar Haddad', '2026-05-30', false),
    ('figma-config-talks', 'Figma Config Talks', 'Recorded talks from Figma''s annual Config conference on design systems, collaboration, and product craft.', 'Design', ARRAY['Design Systems', 'Product Design', 'Collaboration']::text[], 'Learn a concept', 'Video', 'Intermediate', 'Free', 'Seeing how top design teams present their process gives you concrete language for portfolio walkthroughs.', 'Sofia Martins', '2026-05-08', false),
    ('business-model-generation', 'Business Model Generation', 'Alexander Osterwalder''s visual framework (the Business Model Canvas) for describing and designing business models.', 'Business', ARRAY['Business Models', 'Strategy', 'Frameworks']::text[], 'Learn a concept', 'Book', 'Beginner', 'Paid', 'The canvas is a fast way to structure an answer to "how would this business make money" style interview questions.', 'Jordan Blake', '2026-01-22', true),
    ('hbr-strategy-articles', 'Harvard Business Review: Strategy', 'HBR''s ongoing coverage of corporate and product strategy, competitive positioning, and market analysis.', 'Business', ARRAY['Strategy', 'Competitive Advantage', 'Case Studies']::text[], 'Learn a concept', 'Article', 'Intermediate', 'Freemium', 'Well-argued, well-edited strategy writing you can borrow structure from when building your own frameworks.', 'Tom Becker', '2026-02-14', false),
    ('yc-startup-library', 'Y Combinator Startup Library', 'YC''s free library of essays and talks on finding product-market fit, fundraising, and early growth.', 'Business', ARRAY['Startups', 'Fundraising', 'Product-Market Fit']::text[], 'Career guidance', 'Article', 'Beginner', 'Free', 'Explains startup mechanics simply, useful for candidates targeting startup PM roles or explaining 0-to-1 thinking.', 'Wei Zhang', '2026-04-19', false),
    ('crossing-the-chasm', 'Crossing the Chasm', 'Geoffrey Moore''s model for how technology products move from early adopters to the mainstream market.', 'Business', ARRAY['Market Strategy', 'Positioning', 'Go-to-Market']::text[], 'Learn a concept', 'Book', 'Advanced', 'Paid', 'A go-to mental model for go-to-market and positioning questions in strategy-heavy PM interviews.', 'Aisha Rahman', '2026-03-11', true),
    ('indie-hackers-community', 'Indie Hackers Community', 'A community of founders and operators sharing revenue numbers, growth tactics, and business breakdowns.', 'Business', ARRAY['Entrepreneurship', 'Networking', 'Business Models']::text[], 'Career guidance', 'Community', 'Beginner', 'Free', 'Real, unfiltered examples of how small products actually make money — good grounding for business-sense questions.', 'Samuel Patel', '2026-06-06', false),
    ('notion-business-templates', 'Notion Business Templates', 'Community-built Notion templates for business plans, OKRs, and go-to-market docs.', 'Business', ARRAY['Business Models', 'Planning', 'Documentation']::text[], 'Portfolio / case study', 'Template', 'Beginner', 'Free', 'Gives you a ready structure to organize a business case study or planning document for a portfolio piece.', 'Tom Becker', '2026-03-25', false),
    ('cs50-intro-to-cs', 'CS50: Introduction to Computer Science', 'Harvard''s free introductory computer science course covering algorithms, data structures, and web development basics.', 'Dev', ARRAY['Computer Science', 'Programming Fundamentals', 'Algorithms']::text[], 'Learn a concept', 'Course', 'Beginner', 'Free', 'Builds enough technical vocabulary to hold a credible conversation with engineers — a common gap for non-technical PM candidates.', 'Marcus Webb', '2026-01-09', true),
    ('freecodecamp-web-dev', 'freeCodeCamp Full Curriculum', 'A free, project-based curriculum covering HTML, CSS, JavaScript, APIs, and full-stack development.', 'Dev', ARRAY['Web Development', 'APIs', 'JavaScript']::text[], 'Learn a concept', 'Course', 'Beginner', 'Free', 'Hands-on projects help technical PM candidates speak concretely about how features are actually built.', 'Leo Fischer', '2026-02-20', false),
    ('the-odin-project', 'The Odin Project', 'A free, open-source full-stack curriculum built around real projects rather than isolated exercises.', 'Dev', ARRAY['Web Development', 'Git', 'Backend']::text[], 'Learn a concept', 'Course', 'Intermediate', 'Free', 'Gives you a working mental model of the front-end/back-end split and version control — useful shorthand in technical PM interviews.', 'Daniel Cho', '2026-04-27', false),
    ('system-design-primer', 'The System Design Primer', 'An open-source guide to designing large-scale systems, covering caching, load balancing, databases, and tradeoffs.', 'Dev', ARRAY['System Design', 'Scalability', 'APIs']::text[], 'Interview prep', 'Article', 'Advanced', 'Free', 'Technical PM and TPM interviews increasingly include lightweight system design — this covers the vocabulary you need.', 'Wei Zhang', '2026-05-03', true),
    ('leetcode-practice', 'LeetCode', 'A large bank of coding problems used to practice algorithmic problem solving under interview conditions.', 'Dev', ARRAY['Algorithms', 'Data Structures', 'Technical Interview']::text[], 'Practice / drill', 'Tool', 'Intermediate', 'Freemium', 'The default drill tool for technical PM or APM tracks that include a lightweight coding or SQL screen.', 'Samuel Patel', '2026-03-30', false),
    ('stack-overflow-community', 'Stack Overflow', 'The largest Q&A community for programming questions, covering nearly every language and framework.', 'Dev', ARRAY['Programming', 'Debugging', 'APIs']::text[], 'Reference / lookup', 'Community', 'Intermediate', 'Free', 'Useful for quickly understanding how a technical concept is actually discussed and debugged by engineers day-to-day.', 'Wei Zhang', '2026-02-01', false),
    ('elements-of-ai', 'Elements of AI', 'A free introductory course from the University of Helsinki explaining AI concepts without requiring a coding background.', 'AI', ARRAY['Machine Learning', 'AI Fundamentals', 'Ethics']::text[], 'Learn a concept', 'Course', 'Beginner', 'Free', 'Great starting point for PMs who need to reason about AI capabilities and limits without a technical background.', 'Nina Torres', '2026-01-15', true),
    ('deeplearning-ai-short-courses', 'DeepLearning.AI Short Courses', 'Andrew Ng''s series of short, practical courses on LLMs, prompt engineering, and applied machine learning.', 'AI', ARRAY['Machine Learning', 'LLMs', 'Prompt Engineering']::text[], 'Learn a concept', 'Course', 'Intermediate', 'Freemium', 'Fast, structured way to get conversational on LLM product concepts that show up in AI PM interviews.', 'Priya Nair', '2026-05-21', true),
    ('kaggle-datasets-competitions', 'Kaggle', 'A platform for datasets, notebooks, and competitions where practitioners build and benchmark ML models.', 'AI', ARRAY['Machine Learning', 'Data Analysis', 'Competitions']::text[], 'Practice / drill', 'Tool', 'Intermediate', 'Free', 'Hands-on exposure to real datasets and model evaluation, useful context for AI product metrics discussions.', 'Aisha Rahman', '2026-02-08', false),
    ('huggingface-model-hub', 'Hugging Face', 'A hub of open-source models, datasets, and demos, widely used to prototype and ship AI features.', 'AI', ARRAY['LLMs', 'Open Source Models', 'APIs']::text[], 'Reference / lookup', 'Tool', 'Advanced', 'Freemium', 'Seeing what''s actually available off-the-shelf grounds your sense of what''s feasible to build versus what needs custom research.', 'Omar Haddad', '2026-06-11', false),
    ('towards-data-science', 'Towards Data Science', 'A large publication of practitioner-written articles on data science, ML techniques, and applied AI case studies.', 'AI', ARRAY['Data Analysis', 'Machine Learning', 'Case Studies']::text[], 'Reference / lookup', 'Article', 'Intermediate', 'Freemium', 'Good source of concrete, worked examples when you need a real case study to reference for an AI product question.', 'Grace Kim', '2026-04-02', false),
    ('ai-2041', 'AI 2041', 'Kai-Fu Lee and Chen Qiufan''s book pairing near-future fiction with essays on how AI will reshape work and society.', 'AI', ARRAY['AI Fundamentals', 'Ethics', 'Future of Work']::text[], 'Learn a concept', 'Book', 'Beginner', 'Paid', 'Approachable framing for AI''s business impact — useful for interview questions about the future of AI products.', 'Nina Torres', '2026-01-29', false)
  on conflict (slug) do nothing
  returning id, slug
)
insert into public.resource_links (resource_id, label, url, position)
select seeded.id, v.label, v.url, 0
from seeded
join (values
  ('cracking-the-pm-interview', 'Find on Goodreads', 'https://www.goodreads.com'),
  ('lennys-newsletter', 'Read the newsletter', 'https://www.lennysnewsletter.com'),
  ('reforge-growth-series', 'View program', 'https://www.reforge.com'),
  ('svpg-articles', 'Read articles', 'https://www.svpg.com'),
  ('product-case-interview-drills', 'Practice cases', 'https://www.rocketblocks.me'),
  ('masters-of-scale-podcast', 'Listen now', 'https://mastersofscale.com'),
  ('dont-make-me-think', 'Find on Goodreads', 'https://www.goodreads.com'),
  ('nng-usability-heuristics', 'Read articles', 'https://www.nngroup.com'),
  ('figma-community-templates', 'Browse templates', 'https://www.figma.com/community'),
  ('ideo-design-kit', 'Explore methods', 'https://www.designkit.org'),
  ('baymard-ux-benchmarks', 'View research', 'https://baymard.com'),
  ('figma-config-talks', 'Watch talks', 'https://config.figma.com'),
  ('business-model-generation', 'View the canvas', 'https://www.strategyzer.com'),
  ('hbr-strategy-articles', 'Read HBR', 'https://hbr.org'),
  ('yc-startup-library', 'Browse library', 'https://www.ycombinator.com/library'),
  ('crossing-the-chasm', 'Find on Goodreads', 'https://www.goodreads.com'),
  ('indie-hackers-community', 'Join the community', 'https://www.indiehackers.com'),
  ('notion-business-templates', 'Browse templates', 'https://www.notion.com/templates'),
  ('cs50-intro-to-cs', 'Start the course', 'https://cs50.harvard.edu'),
  ('freecodecamp-web-dev', 'Start learning', 'https://www.freecodecamp.org'),
  ('the-odin-project', 'View curriculum', 'https://www.theodinproject.com'),
  ('system-design-primer', 'Read the primer', 'https://github.com/donnemartin/system-design-primer'),
  ('leetcode-practice', 'Practice problems', 'https://leetcode.com'),
  ('stack-overflow-community', 'Visit Stack Overflow', 'https://stackoverflow.com'),
  ('elements-of-ai', 'Start the course', 'https://www.elementsofai.com'),
  ('deeplearning-ai-short-courses', 'Browse courses', 'https://www.deeplearning.ai'),
  ('kaggle-datasets-competitions', 'Explore Kaggle', 'https://www.kaggle.com'),
  ('huggingface-model-hub', 'Browse models', 'https://huggingface.co'),
  ('towards-data-science', 'Read articles', 'https://towardsdatascience.com'),
  ('ai-2041', 'Find on Goodreads', 'https://www.goodreads.com')
) as v(slug, label, url) on v.slug = seeded.slug;
