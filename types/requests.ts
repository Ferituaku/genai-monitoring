export interface TokenRange {
  min: number;
  max: number;
}

export interface Filters {
  models?: string[];
  environments?: string[];
  tokenRange?: {
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  };
  duration?: {
    min: number;
    max: number;
  };
  isStream?: boolean;
  appName?: string;
  statusCode?: string;
}
