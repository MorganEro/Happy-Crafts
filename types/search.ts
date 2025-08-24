export type SearchCategory =
  | 'products'
  | 'programs'
  | 'guardians'
  | 'events'
  | 'locations';

export type SearchResult = {
  id: string;
  type: SearchCategory;
  name: string;
  description?: string;
  image?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export type SearchParams = {
  query: string;
  types?: SearchCategory[];
  page?: number;
  limit?: number;
}

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
