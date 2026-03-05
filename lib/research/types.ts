export interface ResearchArticle {
  pubmedId: string;
  doi: string | null;
  pmcId: string | null;
  s2Id: string | null;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  publishedDate: string;
  isOpenAccess: boolean;
  openAccessPdfUrl: string | null;
  source: 'pubmed' | 'europepmc' | 'semanticscholar';
  citationCount: number;
}
