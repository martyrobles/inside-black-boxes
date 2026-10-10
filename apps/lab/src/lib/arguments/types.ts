export type Turn = {
  id: string;
  speaker: string;
  text: string;
  start?: number;
  end?: number;
};

export type Speaker = {
  id: string;
  name: string;
  label: string;
  kind: "justice" | "advocate";
  role?: string;
};

export type ArgumentRequest = {
  docket: string;
  year: string;
  name: string;
  slug: string;
  status: string;
  holding: string;
  counsel: string;
  replace: boolean;
};

export type CatalogEntry = {
  slug: string;
  name: string;
  docket: string;
  argued: string;
  status: string;
  href: string;
  friction: boolean;
  summary: string;
};

export type JobState = {
  id: string;
  status: "running" | "done" | "error";
  log: string[];
  error?: string;
  slug?: string;
  href?: string;
};
