export interface AnalysisItem {
  ID: string;
  Type: string;
  Objective_Diff: string;
  Knowledge: string;
  Student_Answer_Raw: string;
  Is_Correct: number;
  Error_Reason: string;
  Judge_Explanation: string;
  Complexity_Level: string;
  QueHTML: string;
  AnaLatex: string;
  knowName: string[];
  images: string[];
  gradeName: string;
}

export interface AnalysisResponse {
  total: number;
  page: number;
  page_size: number;
  items: AnalysisItem[];
}

export interface KnowledgeStats {
  total: number;
  page: number;
  page_size: number;
  items: AnalysisItem[];
  accuracy: number;
  correct_count: number;
  wrong_count: number;
}

export interface CapabilityRadar {
  calculation: number;
  logic: number;
  abstraction: number;
  spatial: number;
  application: number;
}

export interface EvidenceBank {
  mistake_examples: string;
  stat_highlights: string;
  student_trait: string;
}

export interface StudentProfile {
  summary: string;
  radar_data: CapabilityRadar;
  root_cause: string;
  identified_knowledge_point: string;
  evidence: EvidenceBank;
}

export interface AnalystInsight {
  thinking_traps: string[];
  pitfall_guide: string;
}

export interface CritiqueResult {
  score: number;
  feedback: string;
  pass_review: boolean;
}
export interface AgentState {
  profile?: StudentProfile;
  current_report?: string;
  insights?: AnalystInsight;
  critique?: CritiqueResult;
  revision_count?: number;
}
