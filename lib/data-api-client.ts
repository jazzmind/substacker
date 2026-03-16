/**
 * Data API Client for Substacker
 *
 * Manages 7 data documents for stacks, expert profiles, competitors,
 * strategies, interviews, posts, and analytics.
 */

import {
  generateId,
  getNow,
  queryRecords,
  insertRecords,
  updateRecords,
  deleteRecords,
  ensureDocuments,
} from '@jazzmind/busibox-app';
import type { AppDataSchema } from '@jazzmind/busibox-app';
import type {
  Stack, CreateStackInput, UpdateStackInput,
  ExpertProfile, CreateExpertProfileInput, UpdateExpertProfileInput,
  Competitor, CreateCompetitorInput,
  Strategy, CreateStrategyInput, UpdateStrategyInput,
  Interview, CreateInterviewInput, UpdateInterviewInput,
  Post, CreatePostInput, UpdatePostInput,
  AnalyticsEntry, CreateAnalyticsInput,
} from './types';

// ==========================================================================
// Document Names
// ==========================================================================

export const DOCUMENTS = {
  STACKS: 'substacker-stacks',
  EXPERT_PROFILES: 'substacker-expert-profiles',
  COMPETITORS: 'substacker-competitors',
  STRATEGIES: 'substacker-strategies',
  INTERVIEWS: 'substacker-interviews',
  POSTS: 'substacker-posts',
  ANALYTICS: 'substacker-analytics',
} as const;

const SOURCE_APP = 'substacker';

// ==========================================================================
// Schemas
// ==========================================================================

export const stackSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    name: { type: 'string', required: true, label: 'Publication Name', order: 1 },
    substackUrl: { type: 'string', required: true, label: 'Substack URL', order: 2 },
    expertName: { type: 'string', required: true, label: 'Expert Name', order: 3 },
    expertBio: { type: 'string', label: 'Expert Bio', multiline: true, order: 4 },
    topics: { type: 'string', label: 'Topics (JSON)', hidden: true },
    status: { type: 'string', label: 'Status', order: 5 },
    subscriberCount: { type: 'number', label: 'Subscribers', order: 6 },
    postingFrequency: { type: 'string', label: 'Posting Frequency', order: 7 },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
    updatedAt: { type: 'string', label: 'Updated', readonly: true, hidden: true },
  },
  displayName: 'Stacks',
  itemLabel: 'Stack',
  sourceApp: SOURCE_APP,
  visibility: 'shared',
  allowSharing: true,
  graphNode: 'Stack',
  graphRelationships: [],
};

export const expertProfileSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    stackId: { type: 'string', required: true, hidden: true },
    expertise: { type: 'string', label: 'Expertise (JSON)', hidden: true },
    talkingPoints: { type: 'string', label: 'Talking Points (JSON)', hidden: true },
    tone: { type: 'string', label: 'Tone', order: 1 },
    targetAudience: { type: 'string', label: 'Target Audience', order: 2 },
    uniqueAngle: { type: 'string', label: 'Unique Angle', multiline: true, order: 3 },
    preferredFormats: { type: 'string', label: 'Preferred Formats (JSON)', hidden: true },
    interviewTranscript: { type: 'string', label: 'Interview Transcript', multiline: true, hidden: true },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
    updatedAt: { type: 'string', label: 'Updated', readonly: true, hidden: true },
  },
  displayName: 'Expert Profiles',
  itemLabel: 'Expert Profile',
  sourceApp: SOURCE_APP,
  visibility: 'shared',
  allowSharing: false,
  graphNode: 'ExpertProfile',
  graphRelationships: [
    { type: 'PROFILE_FOR', targetNode: 'Stack', direction: 'outgoing' },
  ],
};

export const competitorSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    stackId: { type: 'string', required: true, hidden: true },
    name: { type: 'string', required: true, label: 'Competitor Name', order: 1 },
    url: { type: 'string', required: true, label: 'URL', order: 2 },
    subscriberEstimate: { type: 'string', label: 'Subscriber Estimate', order: 3 },
    postingFrequency: { type: 'string', label: 'Posting Frequency', order: 4 },
    topTopics: { type: 'string', label: 'Top Topics (JSON)', hidden: true },
    successFactors: { type: 'string', label: 'Success Factors', multiline: true, order: 5 },
    tone: { type: 'string', label: 'Tone', order: 6 },
    lastAnalyzed: { type: 'string', label: 'Last Analyzed', order: 7 },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
    updatedAt: { type: 'string', label: 'Updated', readonly: true, hidden: true },
  },
  displayName: 'Competitors',
  itemLabel: 'Competitor',
  sourceApp: SOURCE_APP,
  visibility: 'shared',
  allowSharing: false,
  graphNode: 'Competitor',
  graphRelationships: [
    { type: 'COMPETES_WITH', targetNode: 'Stack', direction: 'outgoing' },
  ],
};

export const strategySchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    stackId: { type: 'string', required: true, hidden: true },
    postingSchedule: { type: 'string', label: 'Posting Schedule', order: 1 },
    topicCalendar: { type: 'string', label: 'Topic Calendar (JSON)', hidden: true },
    contentPillars: { type: 'string', label: 'Content Pillars (JSON)', hidden: true },
    growthTactics: { type: 'string', label: 'Growth Tactics (JSON)', hidden: true },
    toneGuidelines: { type: 'string', label: 'Tone Guidelines', multiline: true, order: 2 },
    generatedAt: { type: 'string', label: 'Generated At', order: 3 },
    status: { type: 'string', label: 'Status', order: 4 },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
    updatedAt: { type: 'string', label: 'Updated', readonly: true, hidden: true },
  },
  displayName: 'Strategies',
  itemLabel: 'Strategy',
  sourceApp: SOURCE_APP,
  visibility: 'shared',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

export const interviewSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    stackId: { type: 'string', required: true, hidden: true },
    scheduledDate: { type: 'string', label: 'Scheduled Date', order: 1 },
    status: { type: 'string', label: 'Status', order: 2 },
    script: { type: 'string', label: 'Script (JSON)', hidden: true },
    transcript: { type: 'string', label: 'Transcript', multiline: true, hidden: true },
    audioUrl: { type: 'string', label: 'Audio URL', hidden: true },
    duration: { type: 'number', label: 'Duration (seconds)', order: 3 },
    trendingTopics: { type: 'string', label: 'Trending Topics (JSON)', hidden: true },
    generatedPostId: { type: 'string', label: 'Generated Post ID', hidden: true },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
    updatedAt: { type: 'string', label: 'Updated', readonly: true, hidden: true },
  },
  displayName: 'Interviews',
  itemLabel: 'Interview',
  sourceApp: SOURCE_APP,
  visibility: 'shared',
  allowSharing: false,
  graphNode: 'Interview',
  graphRelationships: [
    { type: 'INTERVIEW_FOR', targetNode: 'Stack', direction: 'outgoing' },
  ],
};

export const postSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    stackId: { type: 'string', required: true, hidden: true },
    interviewId: { type: 'string', hidden: true },
    title: { type: 'string', required: true, label: 'Title', order: 1 },
    subtitle: { type: 'string', label: 'Subtitle', order: 2 },
    content: { type: 'string', required: true, label: 'Content', multiline: true, hidden: true },
    format: { type: 'string', label: 'Format', order: 3 },
    status: { type: 'string', label: 'Status', order: 4 },
    substackPostId: { type: 'string', label: 'Substack Post ID', hidden: true },
    publishedAt: { type: 'string', label: 'Published At', order: 5 },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
    updatedAt: { type: 'string', label: 'Updated', readonly: true, hidden: true },
  },
  displayName: 'Posts',
  itemLabel: 'Post',
  sourceApp: SOURCE_APP,
  visibility: 'shared',
  allowSharing: false,
  graphNode: 'Post',
  graphRelationships: [
    { type: 'POST_FOR', targetNode: 'Stack', direction: 'outgoing' },
    { type: 'GENERATED_FROM', targetNode: 'Interview', direction: 'outgoing' },
  ],
};

export const analyticsSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    stackId: { type: 'string', required: true, hidden: true },
    postId: { type: 'string', required: true, hidden: true },
    subscribersBefore: { type: 'number', label: 'Subscribers Before', order: 1 },
    subscribersAfter: { type: 'number', label: 'Subscribers After', order: 2 },
    engagement: { type: 'string', label: 'Engagement', order: 3 },
    measuredAt: { type: 'string', label: 'Measured At', order: 4 },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
  },
  displayName: 'Analytics',
  itemLabel: 'Analytics Entry',
  sourceApp: SOURCE_APP,
  visibility: 'shared',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

// ==========================================================================
// Document IDs type
// ==========================================================================

export interface DocumentIds {
  stacks: string;
  expertProfiles: string;
  competitors: string;
  strategies: string;
  interviews: string;
  posts: string;
  analytics: string;
}

// ==========================================================================
// ensureDataDocuments
// ==========================================================================

export async function ensureDataDocuments(token: string): Promise<DocumentIds> {
  const ids = await ensureDocuments(
    token,
    {
      stacks: { name: DOCUMENTS.STACKS, schema: stackSchema, visibility: 'shared' },
      expertProfiles: { name: DOCUMENTS.EXPERT_PROFILES, schema: expertProfileSchema, visibility: 'shared' },
      competitors: { name: DOCUMENTS.COMPETITORS, schema: competitorSchema, visibility: 'shared' },
      strategies: { name: DOCUMENTS.STRATEGIES, schema: strategySchema, visibility: 'shared' },
      interviews: { name: DOCUMENTS.INTERVIEWS, schema: interviewSchema, visibility: 'shared' },
      posts: { name: DOCUMENTS.POSTS, schema: postSchema, visibility: 'shared' },
      analytics: { name: DOCUMENTS.ANALYTICS, schema: analyticsSchema, visibility: 'shared' },
    },
    SOURCE_APP
  );
  return ids as DocumentIds;
}

// ==========================================================================
// Stack Operations
// ==========================================================================

export async function listStacks(
  token: string,
  documentId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ stacks: Stack[]; total: number }> {
  const result = await queryRecords<Stack>(token, documentId, {
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
    limit: options?.limit,
    offset: options?.offset,
  });
  return { stacks: result.records, total: result.total };
}

export async function getStack(
  token: string,
  documentId: string,
  stackId: string
): Promise<Stack | null> {
  const result = await queryRecords<Stack>(token, documentId, {
    where: { field: 'id', op: 'eq', value: stackId },
    limit: 1,
  });
  return result.records[0] || null;
}

export async function createStack(
  token: string,
  documentId: string,
  input: CreateStackInput
): Promise<Stack> {
  const now = getNow();
  const stack: Stack = {
    id: generateId(),
    name: input.name,
    substackUrl: input.substackUrl,
    expertName: input.expertName,
    expertBio: input.expertBio || '',
    topics: input.topics || [],
    status: 'onboarding',
    subscriberCount: 0,
    postingFrequency: '',
    createdAt: now,
    updatedAt: now,
  };
  await insertRecords(token, documentId, [stack]);
  return stack;
}

export async function updateStack(
  token: string,
  documentId: string,
  stackId: string,
  input: UpdateStackInput
): Promise<Stack | null> {
  const existing = await getStack(token, documentId, stackId);
  if (!existing) return null;
  const updates = { ...input, updatedAt: getNow() };
  await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: stackId });
  return { ...existing, ...updates } as Stack;
}

export async function deleteStack(
  token: string,
  documentId: string,
  stackId: string
): Promise<boolean> {
  const result = await deleteRecords(token, documentId, { field: 'id', op: 'eq', value: stackId });
  return result.count > 0;
}

// ==========================================================================
// Expert Profile Operations
// ==========================================================================

export async function getExpertProfile(
  token: string,
  documentId: string,
  stackId: string
): Promise<ExpertProfile | null> {
  const result = await queryRecords<ExpertProfile>(token, documentId, {
    where: { field: 'stackId', op: 'eq', value: stackId },
    limit: 1,
  });
  return result.records[0] || null;
}

export async function upsertExpertProfile(
  token: string,
  documentId: string,
  input: CreateExpertProfileInput
): Promise<ExpertProfile> {
  const existing = await getExpertProfile(token, documentId, input.stackId);
  const now = getNow();

  if (existing) {
    const updates = { ...input, updatedAt: now };
    await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: existing.id });
    return { ...existing, ...updates } as ExpertProfile;
  }

  const profile: ExpertProfile = {
    id: generateId(),
    stackId: input.stackId,
    expertise: input.expertise || [],
    talkingPoints: input.talkingPoints || [],
    tone: input.tone || '',
    targetAudience: input.targetAudience || '',
    uniqueAngle: input.uniqueAngle || '',
    preferredFormats: input.preferredFormats || [],
    interviewTranscript: input.interviewTranscript || '',
    createdAt: now,
    updatedAt: now,
  };
  await insertRecords(token, documentId, [profile]);
  return profile;
}

// ==========================================================================
// Competitor Operations
// ==========================================================================

export async function listCompetitors(
  token: string,
  documentId: string,
  stackId: string
): Promise<{ competitors: Competitor[]; total: number }> {
  const result = await queryRecords<Competitor>(token, documentId, {
    where: { field: 'stackId', op: 'eq', value: stackId },
    orderBy: [{ field: 'lastAnalyzed', direction: 'desc' }],
  });
  return { competitors: result.records, total: result.total };
}

export async function createCompetitor(
  token: string,
  documentId: string,
  input: CreateCompetitorInput
): Promise<Competitor> {
  const now = getNow();
  const competitor: Competitor = {
    id: generateId(),
    stackId: input.stackId,
    name: input.name,
    url: input.url,
    subscriberEstimate: input.subscriberEstimate || '',
    postingFrequency: input.postingFrequency || '',
    topTopics: input.topTopics || [],
    successFactors: input.successFactors || '',
    tone: input.tone || '',
    lastAnalyzed: now,
    createdAt: now,
    updatedAt: now,
  };
  await insertRecords(token, documentId, [competitor]);
  return competitor;
}

export async function deleteCompetitors(
  token: string,
  documentId: string,
  stackId: string
): Promise<number> {
  const result = await deleteRecords(token, documentId, { field: 'stackId', op: 'eq', value: stackId });
  return result.count;
}

// ==========================================================================
// Strategy Operations
// ==========================================================================

export async function getStrategy(
  token: string,
  documentId: string,
  stackId: string
): Promise<Strategy | null> {
  const result = await queryRecords<Strategy>(token, documentId, {
    where: { field: 'stackId', op: 'eq', value: stackId },
    orderBy: [{ field: 'generatedAt', direction: 'desc' }],
    limit: 1,
  });
  return result.records[0] || null;
}

export async function createStrategy(
  token: string,
  documentId: string,
  input: CreateStrategyInput
): Promise<Strategy> {
  const now = getNow();
  const strategy: Strategy = {
    id: generateId(),
    stackId: input.stackId,
    postingSchedule: input.postingSchedule || '',
    topicCalendar: input.topicCalendar || [],
    contentPillars: input.contentPillars || [],
    growthTactics: input.growthTactics || [],
    toneGuidelines: input.toneGuidelines || '',
    generatedAt: now,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  await insertRecords(token, documentId, [strategy]);
  return strategy;
}

export async function updateStrategy(
  token: string,
  documentId: string,
  strategyId: string,
  input: UpdateStrategyInput
): Promise<Strategy | null> {
  const result = await queryRecords<Strategy>(token, documentId, {
    where: { field: 'id', op: 'eq', value: strategyId },
    limit: 1,
  });
  const existing = result.records[0];
  if (!existing) return null;
  const updates = { ...input, updatedAt: getNow() };
  await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: strategyId });
  return { ...existing, ...updates } as Strategy;
}

// ==========================================================================
// Interview Operations
// ==========================================================================

export async function listInterviews(
  token: string,
  documentId: string,
  stackId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ interviews: Interview[]; total: number }> {
  const result = await queryRecords<Interview>(token, documentId, {
    where: { field: 'stackId', op: 'eq', value: stackId },
    orderBy: [{ field: 'scheduledDate', direction: 'desc' }],
    limit: options?.limit,
    offset: options?.offset,
  });
  return { interviews: result.records, total: result.total };
}

export async function getInterview(
  token: string,
  documentId: string,
  interviewId: string
): Promise<Interview | null> {
  const result = await queryRecords<Interview>(token, documentId, {
    where: { field: 'id', op: 'eq', value: interviewId },
    limit: 1,
  });
  return result.records[0] || null;
}

export async function createInterview(
  token: string,
  documentId: string,
  input: CreateInterviewInput
): Promise<Interview> {
  const now = getNow();
  const interview: Interview = {
    id: generateId(),
    stackId: input.stackId,
    scheduledDate: input.scheduledDate || now,
    status: 'scheduled',
    script: [],
    transcript: '',
    audioUrl: '',
    duration: 0,
    trendingTopics: input.trendingTopics || [],
    generatedPostId: '',
    createdAt: now,
    updatedAt: now,
  };
  await insertRecords(token, documentId, [interview]);
  return interview;
}

export async function updateInterview(
  token: string,
  documentId: string,
  interviewId: string,
  input: UpdateInterviewInput
): Promise<Interview | null> {
  const existing = await getInterview(token, documentId, interviewId);
  if (!existing) return null;
  const updates = { ...input, updatedAt: getNow() };
  await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: interviewId });
  return { ...existing, ...updates } as Interview;
}

// ==========================================================================
// Post Operations
// ==========================================================================

export async function listPosts(
  token: string,
  documentId: string,
  stackId: string,
  options?: { limit?: number; offset?: number; status?: string }
): Promise<{ posts: Post[]; total: number }> {
  const where = options?.status
    ? { and: [
        { field: 'stackId' as const, op: 'eq' as const, value: stackId },
        { field: 'status' as const, op: 'eq' as const, value: options.status },
      ]}
    : { field: 'stackId' as const, op: 'eq' as const, value: stackId };

  const result = await queryRecords<Post>(token, documentId, {
    where,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
    limit: options?.limit,
    offset: options?.offset,
  });
  return { posts: result.records, total: result.total };
}

export async function getPost(
  token: string,
  documentId: string,
  postId: string
): Promise<Post | null> {
  const result = await queryRecords<Post>(token, documentId, {
    where: { field: 'id', op: 'eq', value: postId },
    limit: 1,
  });
  return result.records[0] || null;
}

export async function createPost(
  token: string,
  documentId: string,
  input: CreatePostInput
): Promise<Post> {
  const now = getNow();
  const post: Post = {
    id: generateId(),
    stackId: input.stackId,
    interviewId: input.interviewId || '',
    title: input.title,
    subtitle: input.subtitle || '',
    content: input.content,
    format: input.format || 'substack',
    status: 'draft',
    substackPostId: '',
    publishedAt: '',
    createdAt: now,
    updatedAt: now,
  };
  await insertRecords(token, documentId, [post]);
  return post;
}

export async function updatePost(
  token: string,
  documentId: string,
  postId: string,
  input: UpdatePostInput
): Promise<Post | null> {
  const existing = await getPost(token, documentId, postId);
  if (!existing) return null;
  const updates = { ...input, updatedAt: getNow() };
  await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: postId });
  return { ...existing, ...updates } as Post;
}

// ==========================================================================
// Analytics Operations
// ==========================================================================

export async function listAnalytics(
  token: string,
  documentId: string,
  stackId: string
): Promise<{ entries: AnalyticsEntry[]; total: number }> {
  const result = await queryRecords<AnalyticsEntry>(token, documentId, {
    where: { field: 'stackId', op: 'eq', value: stackId },
    orderBy: [{ field: 'measuredAt', direction: 'desc' }],
  });
  return { entries: result.records, total: result.total };
}

export async function createAnalyticsEntry(
  token: string,
  documentId: string,
  input: CreateAnalyticsInput
): Promise<AnalyticsEntry> {
  const now = getNow();
  const entry: AnalyticsEntry = {
    id: generateId(),
    stackId: input.stackId,
    postId: input.postId,
    subscribersBefore: input.subscribersBefore,
    subscribersAfter: input.subscribersAfter,
    engagement: input.engagement || '',
    measuredAt: now,
    createdAt: now,
  };
  await insertRecords(token, documentId, [entry]);
  return entry;
}
