/** Shapes returned by the API (see the backend's toSongView / toPublicUser). */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  hasPassword: boolean;
  credits: number;
  blocked?: boolean;
  lastLoginAt?: string;
  subscription: {
    planId?: string;
    status?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  } | null;
  createdAt: string;
}

export type JobStatus = "queued" | "generating" | "done" | "failed";
export type StemStatus = JobStatus | "none";

export interface QueueInfo {
  position: number;
  estimatedWaitSeconds: number;
}

export interface Song {
  id: string;
  feature: "generate" | "remix";
  title: string;
  status: JobStatus;
  error?: string;
  input?: {
    language?: string;
    genre?: string;
    mood?: string;
    vocal?: "male" | "female" | "instrumental";
    bpm?: number;
    taal?: string;
    instruments?: string[];
    prompt?: string;
    lyrics?: string;
  };
  model: string;
  creditCost: number;
  creditStatus: "reserved" | "charged" | "refunded";
  durationMs?: number;
  referenceName?: string;
  createdAt: string;
  finishedAt?: string;
  queue: QueueInfo | null;
  audio: { streamUrl: string; downloadUrl: string } | null;
  stems: {
    status: StemStatus;
    model?: string;
    error?: string;
    expiresAt?: string;
    creditCost?: number;
    queue: QueueInfo | null;
    tracks: { name: string; streamUrl: string; downloadUrl: string }[];
    wavZipUrl: string | null;
    midiZipUrl: string | null;
  };
}

export interface CreditCosts {
  generate: number;
  instrumental: number;
  remix: number;
  stems: number;
}

export interface PublicSettings {
  creditCosts: CreditCosts;
  options: { genres: string[]; moods: string[]; taals: string[]; instruments: string[] };
  stemModel: string;
  /** Absent from older API versions; the remix page falls back to the spec limits */
  remix?: { minSeconds: number; maxSeconds: number; maxBytes: number };
}

export interface Catalog {
  plans: { id: string; name: string; description: string; pricePaise: number; credits: number }[];
  packs: { id: string; name: string; pricePaise: number; credits: number }[];
  creditCosts: CreditCosts;
  carryOverSubscriptionCredits: boolean;
}

export interface Payment {
  _id: string;
  kind: "pack" | "subscription";
  status: "created" | "paid" | "failed";
  amountPaise: number;
  credits: number;
  description: string;
  paidAt?: string;
  createdAt: string;
}

export interface LedgerEntry {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
}
