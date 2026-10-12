export type Role = 'patient' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  departmentId?: string; // For staff
  title?: string; // e.g. "BS.CKII, Trưởng khoa"
  phone?: string;
  password?: string;
  status?: 'active' | 'suspended';
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  doctorCount: number;
  averageRating: number;
  totalReviews: number;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface CriteriaRating {
  serviceAttitude: number; // Thái độ phục vụ (1-5)
  facilities: number;      // Cơ sở vật chất (1-5)
  waitTime: number;        // Thời gian chờ đợi (1-5)
  costTransparency: number;// Chi phí & Minh bạch (1-5)
}

export interface OfficialReply {
  id: string;
  staffId: string;
  staffName: string;
  staffTitle: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'approved';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isAnonymous: boolean;
  departmentId: string;
  departmentName: string;
  doctorId?: string;
  doctorName?: string;
  overallRating: number;
  criteria: CriteriaRating;
  title: string;
  content: string;
  images?: string[];
  status: ReviewStatus;
  createdAt: string;
  likes: number;
  visitDate: string;
  officialReply?: OfficialReply;
}

export interface SystemStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  averageSatisfaction: number; // 0 - 100% or 0 - 5.0
  csatScore: number; // e.g., 94.6%
  totalDepartments: number;
  totalDoctors: number;
}
