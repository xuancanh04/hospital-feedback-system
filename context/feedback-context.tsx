'use client';

import React, { createContext, useContext, useState } from 'react';
import { Department, Doctor, Review, ReviewStatus, OfficialReply, FeedbackTagsConfig } from '@/types';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_DOCTORS, 
  INITIAL_REVIEWS,
  DEFAULT_POSITIVE_TAGS,
  DEFAULT_NEUTRAL_TAGS,
  DEFAULT_CRITICAL_TAGS,
  DEFAULT_DEPARTMENT_TAGS
} from '@/lib/mock-data';

interface FeedbackContextType {
  departments: Department[];
  doctors: Doctor[];
  reviews: Review[];
  positiveTags: string[];
  neutralTags: string[];
  criticalTags: string[];
  departmentTags: Record<string, {
    positiveTags?: string[];
    neutralTags?: string[];
    criticalTags?: string[];
  }>;
  getTagsForDepartment: (departmentId?: string) => {
    positiveTags: string[];
    neutralTags: string[];
    criticalTags: string[];
    isCustom: boolean;
  };
  updateTags: (config: FeedbackTagsConfig) => Promise<void>;
  updateDepartmentTags: (
    departmentId: string, 
    tags: { positiveTags?: string[]; neutralTags?: string[]; criticalTags?: string[] } | null
  ) => Promise<void>;
  resetTagsToDefault: () => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status' | 'likes'>) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  replyReview: (reviewId: string, reply: Omit<OfficialReply, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  likeReview: (reviewId: string) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id' | 'averageRating' | 'totalReviews'>) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [positiveTags, setPositiveTags] = useState<string[]>(DEFAULT_POSITIVE_TAGS);
  const [neutralTags, setNeutralTags] = useState<string[]>(DEFAULT_NEUTRAL_TAGS);
  const [criticalTags, setCriticalTags] = useState<string[]>(DEFAULT_CRITICAL_TAGS);
  const [departmentTags, setDepartmentTags] = useState<Record<string, {
    positiveTags?: string[];
    neutralTags?: string[];
    criticalTags?: string[];
  }>>(DEFAULT_DEPARTMENT_TAGS);

  React.useEffect(() => {
    // 0. Tải danh sách thẻ đánh giá nhanh từ database PostgreSQL qua API /api/tags
    const fetchTagsFromDB = async () => {
      try {
        const res = await fetch('/api/tags');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const { positiveTags: pos, neutralTags: neu, criticalTags: crit, departmentTags: dept } = json.data;
            if (Array.isArray(pos) && pos.length > 0) {
              setPositiveTags(pos);
              localStorage.setItem('hospital_7a_tags_positive', JSON.stringify(pos));
            }
            if (Array.isArray(neu) && neu.length > 0) {
              setNeutralTags(neu);
              localStorage.setItem('hospital_7a_tags_neutral', JSON.stringify(neu));
            }
            if (Array.isArray(crit) && crit.length > 0) {
              setCriticalTags(crit);
              localStorage.setItem('hospital_7a_tags_critical', JSON.stringify(crit));
            }
            if (dept && typeof dept === 'object') {
              setDepartmentTags(dept);
              localStorage.setItem('hospital_7a_tags_department_v1', JSON.stringify(dept));
            }
            return;
          }
        }
      } catch (e) {
        console.warn('Chưa kết nối được API /api/tags, fallback sang local:', e);
      }

      // Fallback nếu offline hoặc chưa kết nối DB
      loadSavedTagsLocal();
    };

    const loadSavedTagsLocal = () => {
      try {
        const savedPositive = localStorage.getItem('hospital_7a_tags_positive');
        if (savedPositive) {
          const parsed = JSON.parse(savedPositive);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPositiveTags(parsed);
          }
        } else {
          setPositiveTags(DEFAULT_POSITIVE_TAGS);
        }

        const savedNeutral = localStorage.getItem('hospital_7a_tags_neutral');
        if (savedNeutral) {
          const parsed = JSON.parse(savedNeutral);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNeutralTags(parsed);
          }
        } else {
          setNeutralTags(DEFAULT_NEUTRAL_TAGS);
        }

        const savedCritical = localStorage.getItem('hospital_7a_tags_critical');
        if (savedCritical) {
          const parsed = JSON.parse(savedCritical);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCriticalTags(parsed);
          }
        } else {
          setCriticalTags(DEFAULT_CRITICAL_TAGS);
        }

        const savedDeptTags = localStorage.getItem('hospital_7a_tags_department_v1');
        if (savedDeptTags) {
          try {
            const parsed = JSON.parse(savedDeptTags);
            if (parsed && typeof parsed === 'object') {
              setDepartmentTags(parsed);
            }
          } catch {
            setDepartmentTags({});
          }
        } else {
          setDepartmentTags({});
        }
      } catch {}
    };

    fetchTagsFromDB();

    // Lắng nghe sự kiện storage để đồng bộ tức thì sang màn hình Kiosk / tab khác
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'hospital_7a_tags_positive' ||
        e.key === 'hospital_7a_tags_neutral' ||
        e.key === 'hospital_7a_tags_critical' ||
        e.key === 'hospital_7a_tags_department_v1'
      ) {
        loadSavedTagsLocal();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  React.useEffect(() => {
    // 1. Tải danh sách đánh giá từ API PostgreSQL
    const fetchReviewsFromDB = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setReviews(json.data);
            return;
          }
        }
      } catch (e) {
        console.warn('Chưa kết nối được API /api/reviews, fallback sang local:', e);
      }

      // Fallback nếu offline hoặc lỗi mạng (lọc chỉ giữ các đánh giá dùng thẻ chọn nhanh)
      try {
        const savedRevs = localStorage.getItem('hospital_7a_reviews');
        if (savedRevs) {
          const parsed = JSON.parse(savedRevs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Chỉ giữ những đánh giá chuẩn thẻ chọn nhanh
            const tagOnlyRevs = parsed.filter((r: Review) => r.content && r.content.includes('[Đánh giá nhanh]'));
            if (tagOnlyRevs.length > 0) {
              setReviews(tagOnlyRevs);
              return;
            }
          }
        }
      } catch {}
    };

    fetchReviewsFromDB();

    // 2. Tải danh sách khoa phòng từ API PostgreSQL
    const fetchDeptsFromDB = async () => {
      try {
        const res = await fetch('/api/departments');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setDepartments(json.data);
            return;
          }
        }
      } catch (e) {
        console.warn('Chưa kết nối được API /api/departments, fallback:', e);
      }

      try {
        const savedDepts = localStorage.getItem('hospital_7a_departments_v4');
        if (savedDepts) {
          const parsed = JSON.parse(savedDepts);
          if (Array.isArray(parsed) && parsed.length >= INITIAL_DEPARTMENTS.length) {
            setDepartments(parsed);
          }
        }
      } catch {}
    };

    fetchDeptsFromDB();
  }, []);

  const saveReviewsLocal = (newList: Review[]) => {
    setReviews(newList);
    localStorage.setItem('hospital_7a_reviews', JSON.stringify(newList));
  };

  const saveDepartmentsLocal = (newList: Department[]) => {
    setDepartments(newList);
    localStorage.setItem('hospital_7a_departments_v4', JSON.stringify(newList));
  };

  const addReview = async (newRevData: Omit<Review, 'id' | 'createdAt' | 'status' | 'likes'>) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRevData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveReviewsLocal([json.data, ...reviews]);
          return;
        }
      }
    } catch (err) {
      console.warn('Gửi API thất bại, lưu tạm local:', err);
    }

    // Fallback nếu API lỗi
    const newId = `rev-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newReview: Review = {
      ...newRevData,
      id: newId,
      createdAt,
      status: 'approved',
      likes: 0,
    };
    saveReviewsLocal([newReview, ...reviews]);
  };

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, status } : r));
    saveReviewsLocal(updated);
  };

  const deleteReview = async (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    saveReviewsLocal(updated);
  };

  const replyReview = async (
    reviewId: string,
    replyData: Omit<OfficialReply, 'id' | 'createdAt' | 'status'>
  ) => {
    const newReply: OfficialReply = {
      ...replyData,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'approved',
    };
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, officialReply: newReply } : r));
    saveReviewsLocal(updated);
  };

  const likeReview = async (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    const newLikes = (target?.likes || 0) + 1;
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, likes: newLikes } : r));
    saveReviewsLocal(updated);
  };

  const addDepartment = async (dept: Omit<Department, 'id' | 'averageRating' | 'totalReviews'>) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveDepartmentsLocal([...departments, json.data]);
          return;
        }
      }
    } catch (err) {
      console.warn('Lỗi gọi API addDepartment, lưu tạm local:', err);
    }

    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      averageRating: 5.0,
      totalReviews: 0,
    };
    saveDepartmentsLocal([...departments, newDept]);
  };

  const updateDepartment = async (id: string, dept: Partial<Department>) => {
    try {
      await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...dept }),
      });
    } catch (err) {
      console.warn('Lỗi gọi API updateDepartment:', err);
    }
    saveDepartmentsLocal(departments.map((d) => (d.id === id ? { ...d, ...dept } : d)));
  };

  const deleteDepartment = async (id: string) => {
    try {
      await fetch(`/api/departments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Lỗi gọi API deleteDepartment:', err);
    }
    saveDepartmentsLocal(departments.filter((d) => d.id !== id));
  };

  // Lấy danh sách thẻ phù hợp cho khoa phòng đã chọn:
  // Nếu khoa phòng đó có cấu hình thẻ riêng thì chỉ hiển thị thẻ riêng của khoa.
  // Nếu khoa phòng đó chưa có thẻ riêng thì tự động fallback dùng thẻ chung của toàn viện.
  const getTagsForDepartment = (departmentId?: string) => {
    if (departmentId && departmentTags[departmentId]) {
      const custom = departmentTags[departmentId];
      const hasAnyCustom = 
        (custom.positiveTags && custom.positiveTags.length > 0) ||
        (custom.neutralTags && custom.neutralTags.length > 0) ||
        (custom.criticalTags && custom.criticalTags.length > 0);

      if (hasAnyCustom) {
        return {
          positiveTags: custom.positiveTags || [],
          neutralTags: custom.neutralTags || [],
          criticalTags: custom.criticalTags || [],
          isCustom: true,
        };
      }
    }

    return {
      positiveTags,
      neutralTags,
      criticalTags,
      isCustom: false,
    };
  };

  const updateTags = async (config: FeedbackTagsConfig) => {
    setPositiveTags(config.positiveTags);
    if (config.neutralTags) {
      setNeutralTags(config.neutralTags);
      localStorage.setItem('hospital_7a_tags_neutral', JSON.stringify(config.neutralTags));
    }
    setCriticalTags(config.criticalTags);
    localStorage.setItem('hospital_7a_tags_positive', JSON.stringify(config.positiveTags));
    localStorage.setItem('hospital_7a_tags_critical', JSON.stringify(config.criticalTags));

    if (config.departmentTags) {
      setDepartmentTags(config.departmentTags);
      localStorage.setItem('hospital_7a_tags_department_v1', JSON.stringify(config.departmentTags));
    }

    // Đồng bộ trực tiếp vào database PostgreSQL
    try {
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          departmentId: 'all',
          positiveTags: config.positiveTags,
          neutralTags: config.neutralTags || neutralTags,
          criticalTags: config.criticalTags,
        }),
      });
    } catch (e) {
      console.warn('Lỗi khi đồng bộ thẻ chung vào database:', e);
    }
  };

  const updateDepartmentTags = async (
    departmentId: string, 
    tags: { positiveTags?: string[]; neutralTags?: string[]; criticalTags?: string[] } | null
  ) => {
    setDepartmentTags((prev) => {
      const updated = { ...prev };
      if (!tags) {
        delete updated[departmentId];
      } else {
        updated[departmentId] = tags;
      }
      localStorage.setItem('hospital_7a_tags_department_v1', JSON.stringify(updated));
      return updated;
    });

    // Đồng bộ trực tiếp thẻ của khoa này vào database PostgreSQL
    try {
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          departmentId,
          positiveTags: tags?.positiveTags || [],
          neutralTags: tags?.neutralTags || [],
          criticalTags: tags?.criticalTags || [],
        }),
      });
    } catch (e) {
      console.warn(`Lỗi khi đồng bộ thẻ của khoa ${departmentId} vào database:`, e);
    }
  };

  const resetTagsToDefault = async () => {
    setPositiveTags(DEFAULT_POSITIVE_TAGS);
    setNeutralTags(DEFAULT_NEUTRAL_TAGS);
    setCriticalTags(DEFAULT_CRITICAL_TAGS);
    setDepartmentTags(DEFAULT_DEPARTMENT_TAGS);
    localStorage.setItem('hospital_7a_tags_positive', JSON.stringify(DEFAULT_POSITIVE_TAGS));
    localStorage.setItem('hospital_7a_tags_neutral', JSON.stringify(DEFAULT_NEUTRAL_TAGS));
    localStorage.setItem('hospital_7a_tags_critical', JSON.stringify(DEFAULT_CRITICAL_TAGS));
    localStorage.setItem('hospital_7a_tags_department_v1', JSON.stringify(DEFAULT_DEPARTMENT_TAGS));

    try {
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          departmentId: 'all',
          positiveTags: DEFAULT_POSITIVE_TAGS,
          neutralTags: DEFAULT_NEUTRAL_TAGS,
          criticalTags: DEFAULT_CRITICAL_TAGS,
        }),
      });
    } catch (e) {
      console.warn('Lỗi khi reset thẻ trong database:', e);
    }
  };

  return (
    <FeedbackContext.Provider
      value={{
        departments,
        doctors,
        reviews,
        positiveTags,
        neutralTags,
        criticalTags,
        departmentTags,
        getTagsForDepartment,
        updateTags,
        updateDepartmentTags,
        resetTagsToDefault,
        addReview,
        updateReviewStatus,
        deleteReview,
        replyReview,
        likeReview,
        addDepartment,
        updateDepartment,
        deleteDepartment,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
