export interface Issues {
  title: string;
  description: string;
  type: string;
  status?: string;
}

export interface TIssueQuery {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}