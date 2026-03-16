/**
 * Shared Types for Substacker
 */

// ==========================================================================
// Authentication Types
// ==========================================================================

export interface User {
  id: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  roles: string[];
}

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// ==========================================================================
// API Types
// ==========================================================================

export interface ApiError {
  error: string;
  message?: string;
  details?: string;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==========================================================================
// Stack (Substack Publication)
// ==========================================================================

export type StackStatus = 'active' | 'onboarding' | 'paused' | 'archived';

export interface Stack {
  id: string;
  name: string;
  substackUrl: string;
  expertName: string;
  expertBio: string;
  topics: string[];
  status: StackStatus;
  subscriberCount: number;
  postingFrequency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStackInput {
  name: string;
  substackUrl: string;
  expertName: string;
  expertBio?: string;
  topics?: string[];
}

export interface UpdateStackInput {
  name?: string;
  substackUrl?: string;
  expertName?: string;
  expertBio?: string;
  topics?: string[];
  status?: StackStatus;
  subscriberCount?: number;
  postingFrequency?: string;
}

// ==========================================================================
// Expert Profile
// ==========================================================================

export interface ExpertProfile {
  id: string;
  stackId: string;
  expertise: string[];
  talkingPoints: string[];
  tone: string;
  targetAudience: string;
  uniqueAngle: string;
  preferredFormats: string[];
  interviewTranscript: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpertProfileInput {
  stackId: string;
  expertise?: string[];
  talkingPoints?: string[];
  tone?: string;
  targetAudience?: string;
  uniqueAngle?: string;
  preferredFormats?: string[];
  interviewTranscript?: string;
}

export interface UpdateExpertProfileInput {
  expertise?: string[];
  talkingPoints?: string[];
  tone?: string;
  targetAudience?: string;
  uniqueAngle?: string;
  preferredFormats?: string[];
  interviewTranscript?: string;
}

// ==========================================================================
// Competitor
// ==========================================================================

export interface Competitor {
  id: string;
  stackId: string;
  name: string;
  url: string;
  subscriberEstimate: string;
  postingFrequency: string;
  topTopics: string[];
  successFactors: string;
  tone: string;
  lastAnalyzed: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompetitorInput {
  stackId: string;
  name: string;
  url: string;
  subscriberEstimate?: string;
  postingFrequency?: string;
  topTopics?: string[];
  successFactors?: string;
  tone?: string;
}

// ==========================================================================
// Strategy
// ==========================================================================

export type StrategyStatus = 'draft' | 'active' | 'archived';

export interface TopicCalendarEntry {
  week: number;
  topic: string;
  angle: string;
  format: string;
}

export interface Strategy {
  id: string;
  stackId: string;
  postingSchedule: string;
  topicCalendar: TopicCalendarEntry[];
  contentPillars: string[];
  growthTactics: string[];
  toneGuidelines: string;
  generatedAt: string;
  status: StrategyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStrategyInput {
  stackId: string;
  postingSchedule?: string;
  topicCalendar?: TopicCalendarEntry[];
  contentPillars?: string[];
  growthTactics?: string[];
  toneGuidelines?: string;
}

export interface UpdateStrategyInput {
  postingSchedule?: string;
  topicCalendar?: TopicCalendarEntry[];
  contentPillars?: string[];
  growthTactics?: string[];
  toneGuidelines?: string;
  status?: StrategyStatus;
}

// ==========================================================================
// Interview
// ==========================================================================

export type InterviewStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface ScriptQuestion {
  order: number;
  question: string;
  context: string;
  followUpHints: string[];
}

export interface Interview {
  id: string;
  stackId: string;
  scheduledDate: string;
  status: InterviewStatus;
  script: ScriptQuestion[];
  transcript: string;
  audioUrl: string;
  duration: number;
  trendingTopics: string[];
  generatedPostId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewInput {
  stackId: string;
  scheduledDate?: string;
  trendingTopics?: string[];
}

export interface UpdateInterviewInput {
  scheduledDate?: string;
  status?: InterviewStatus;
  script?: ScriptQuestion[];
  transcript?: string;
  audioUrl?: string;
  duration?: number;
  trendingTopics?: string[];
  generatedPostId?: string;
}

// ==========================================================================
// Post
// ==========================================================================

export type PostFormat = 'substack' | 'blog';
export type PostStatus = 'draft' | 'review' | 'published';

export interface Post {
  id: string;
  stackId: string;
  interviewId: string;
  title: string;
  subtitle: string;
  content: string;
  format: PostFormat;
  status: PostStatus;
  substackPostId: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  stackId: string;
  interviewId?: string;
  title: string;
  subtitle?: string;
  content: string;
  format?: PostFormat;
}

export interface UpdatePostInput {
  title?: string;
  subtitle?: string;
  content?: string;
  format?: PostFormat;
  status?: PostStatus;
  substackPostId?: string;
  publishedAt?: string;
}

// ==========================================================================
// Analytics
// ==========================================================================

export interface AnalyticsEntry {
  id: string;
  stackId: string;
  postId: string;
  subscribersBefore: number;
  subscribersAfter: number;
  engagement: string;
  measuredAt: string;
  createdAt: string;
}

export interface CreateAnalyticsInput {
  stackId: string;
  postId: string;
  subscribersBefore: number;
  subscribersAfter: number;
  engagement?: string;
}

// ==========================================================================
// Utility Types
// ==========================================================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
