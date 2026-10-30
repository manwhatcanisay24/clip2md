export interface ArticleMetadata {
  title: string;
  url: string;
  siteName: string;
  author?: string;
  publishedAt?: string;
  clippedAt: string;
}

export interface ExtractedArticle extends ArticleMetadata {
  content: string;
  textContent: string;
  excerpt?: string;
}

export type ExtractionErrorCode = 'EMPTY_CONTENT' | 'PARSE_ERROR';

export interface ExtractionSuccess {
  ok: true;
  article: ExtractedArticle;
}

export interface ExtractionFailure {
  ok: false;
  error: {
    code: ExtractionErrorCode;
    message: string;
  };
  metadata: ArticleMetadata;
}

export type ExtractionResult = ExtractionSuccess | ExtractionFailure;

export interface ClipSettings {
  includeTitle: boolean;
  includeSource: boolean;
  language: 'auto' | 'en' | 'zh-CN';
}

export const DEFAULT_SETTINGS: ClipSettings = {
  includeTitle: true,
  includeSource: true,
  language: 'auto',
};
