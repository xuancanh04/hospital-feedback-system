'use client';

import React, { createContext, useContext, useState } from 'react';
import { Department, Doctor, Review, ReviewStatus, OfficialReply } from '@/types';
import { INITIAL_DEPARTMENTS, INITIAL_DOCTORS, INITIAL_REVIEWS } from '@/lib/mock-data';

interface FeedbackContextType {
  departments: Department[];
  doctors: Doctor[];
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status' | 'likes'>) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  replyReview: (reviewId: string, reply: Omit<OfficialReply, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  likeReview: (reviewId: string) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id' | 'averageRating' | 'totalReviews'>) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addDoctor: (doc: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>) => Promise<void>;
  updateDoctor: (id: string, doc: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DEPARTMENTS;
    try {
      const saved = localStorage.getItem('hospital_7a_departments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DEPARTMENTS;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DOCTORS;
    try {
      const saved = localStorage.getItem('hospital_7a_doctors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DOCTORS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    try {
      const saved = localStorage.getItem('hospital_7a_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REVIEWS;
  });

  const saveReviewsLocal = (newList: Review[]) => {
    setReviews(newList);
    localStorage.setItem('hospital_7a_reviews', JSON.stringify(newList));
  };

  const saveDepartmentsLocal = (newList: Department[]) => {
    setDepartments(newList);
    localStorage.setItem('hospital_7a_departments', JSON.stringify(newList));
  };

  const saveDoctorsLocal = (newList: Doctor[]) => {
    setDoctors(newList);
    localStorage.setItem('hospital_7a_doctors', JSON.stringify(newList));
  };

  const addReview = async (newRevData: Omit<Review, 'id' | 'createdAt' | 'status' | 'likes'>) => {
    const newId = `rev-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newReview: Review = {
      ...newRevData,
      id: newId,
      createdAt,
      status: 'pending',
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
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      averageRating: 5.0,
      totalReviews: 0,
    };
    saveDepartmentsLocal([...departments, newDept]);
  };

  const updateDepartment = async (id: string, dept: Partial<Department>) => {
    saveDepartmentsLocal(departments.map((d) => (d.id === id ? { ...d, ...dept } : d)));
  };

  const deleteDepartment = async (id: string) => {
    saveDepartmentsLocal(departments.filter((d) => d.id !== id));
  };

  const addDoctor = async (doc: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>) => {
    const newDoc: Doctor = {
      ...doc,
      id: `doc-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
    };
    saveDoctorsLocal([...doctors, newDoc]);
  };

  const updateDoctor = async (id: string, doc: Partial<Doctor>) => {
    saveDoctorsLocal(doctors.map((d) => (d.id === id ? { ...d, ...doc } : d)));
  };

  const deleteDoctor = async (id: string) => {
    saveDoctorsLocal(doctors.filter((d) => d.id !== id));
  };

  return (
    <FeedbackContext.Provider
      value={{
        departments,
        doctors,
        reviews,
        addReview,
        updateReviewStatus,
        deleteReview,
        replyReview,
        likeReview,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addDoctor,
        updateDoctor,
        deleteDoctor,
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
