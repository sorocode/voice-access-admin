// api_client_axios.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// 공통 Axios 인스턴스
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 회원 타입 정의
export interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  address?: string;
  weight?: string;
  height?: string;
  createdAt?: string;
}

export interface EnterLog {
  id: number;
  memberId: string;
  memberName: string;
  phoneNumber: string;
  checkInTime: string;
  checkOuttime?: string;
  status: "ENTER" | "EXIT";
}

export interface MemberUpdateRequest {
  name?: string;
  phoneNumber?: string;
  address?: string;
  weight?: string;
  height?: string;
}

export interface MemberCreateRequest {
  username: string;
  phoneNumber: string;
  address?: string;
  weight?: string;
  height?: string;
}

export const api = {
  members: {
    getAll: async (): Promise<Member[]> => {
      const res = await apiClient.get("/users");
      return res.data;
    },

    searchByName: async (username: string): Promise<Member[]> => {
      const res = await apiClient.get("/users", { params: { username } });
      return res.data;
    },

    getByPhone: async (phoneNumber: string): Promise<Member> => {
      const res = await apiClient.get("/users", { params: { phoneNumber } });
      return res.data;
    },

    getById: async (userId: string): Promise<Member> => {
      const res = await apiClient.get(`/users/${userId}`);
      return res.data;
    },

    create: async (memberData: MemberCreateRequest, voiceFile?: File): Promise<string> => {
      const formData = new FormData();
      Object.entries(memberData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (voiceFile) {
        formData.append("voiceFile", voiceFile);
      }

      const res = await axios.post(`${API_BASE_URL}/signup`, formData);
      return res.data;
    },

    update: async (userId: string, updateData: MemberUpdateRequest): Promise<Member> => {
      const res = await apiClient.patch(`/users/${userId}`, updateData);
      return res.data;
    },

    delete: async (userId: string): Promise<void> => {
      await apiClient.delete(`/users/${userId}`);
    },
  },

  auth: {
    loginWithVoice: async (audioFile: File): Promise<string> => {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const res = await axios.post(`${API_BASE_URL}/login`, formData);
      return res.data;
    },

    loginWithPhoneNumber: async (last4Digits: string): Promise<string> => {
      const res = await apiClient.post(`/login/phoneNum`, null, {
        params: { last4Digits },
      });
      return res.data;
    },
  },

  enterLogs: {
    getAll: async (): Promise<EnterLog[]> => {
      const res = await apiClient.get("/logs");
      return res.data.data;
    },

    getByMemberId: async (memberId: string): Promise<EnterLog[]> => {
      const res = await apiClient.get(`/logs/${memberId}`);
      return res.data;
    },
  },
};