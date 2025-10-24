export type UserRole = 'aluno' | 'professor' | 'dev';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  createdBy: string;
  members: string[];
  totalPoints: number;
}

export interface Prova {
  id: string;
  title: string;
  description: string;
  instructions: string;
  maxPoints: number;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  submissions: ProvaSubmission[];
}

export interface ProvaSubmission {
  id: string;
  studentId: string;
  studentName: string;
  teamId: string;
  teamName: string;
  submittedAt: Date;
  content: string;
  points?: number;
  maxPoints: number;
  feedback?: string;
  evaluatedAt?: Date;
  evaluatedBy?: string;
  isGradeVisible: boolean;
}

export interface MemberInfo {
  uid: string;
  email: string;
  displayName?: string;
  joinedAt?: Date;
}

export interface RankingSettings {
  id: string;
  isVisible: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  teamColor: string;
  totalPoints: number;
  position: number;
  memberCount: number;
}

export type ReviewStatus = 'pending' | 'under_review' | 'resolved' | 'rejected';

export interface ReviewRequest {
  id: string;
  title: string;
  description: string;
  reason: string;
  evidence: EvidenceItem[];
  status: ReviewStatus;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  teamId: string;
  teamName: string;
  targetTeamId?: string;
  targetTeamName?: string;
  targetProvaId?: string;
  targetProvaTitle?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewedByName?: string;
  resolution?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface EvidenceItem {
  id: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  description: string;
  uploadedAt: Date;
}
