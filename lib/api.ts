// API 기본 URL 설정
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// 에러 처리 헬퍼 함수
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // 응답 본문을 가져와 에러 메시지로 사용
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
  }

  // 204 No Content 응답인 경우 null 반환
  if (response.status === 204) {
    return null;
  }

  // JSON 응답 반환
  return response.json();
};

// 회원 타입 정의
export interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  address?: string;
  weight?: string;
  height?: string;
  createdAt?: string;
  // lastEnterTime?: string;
}

// 출입 로그 타입 정의
export interface EnterLog {
  id: number;
  memberId: string;
  memberName: string;
  phoneNumber: string;
  checkInTime: string;
  checkOuttime?: string;
  status: "ENTER" | "EXIT";
}

// 회원 수정 요청 타입
export interface MemberUpdateRequest {
  name?: string;
  phoneNumber?: string;
  address?: string;
  weight?: string;
  height?: string;
}

// 회원 등록 요청 타입
export interface MemberCreateRequest {
  username: string;
  phoneNumber: string;
  address?: string;
  weight?: string;
  height?: string;
}

// API 함수들
export const api = {
  // 회원 관련 API
  members: {
    // 모든 회원 조회
    getAll: async (): Promise<Member[]> => {
      const response = await fetch(`${API_BASE_URL}/users`);
      return handleResponse(response);
    },

    // 이름으로 회원 검색
    searchByName: async (username: string): Promise<Member[]> => {
      const response = await fetch(
        `${API_BASE_URL}/users?username=${encodeURIComponent(username)}`
      );
      return handleResponse(response);
    },

    // 전화번호로 회원 검색
    getByPhone: async (phoneNumber: string): Promise<Member> => {
      const response = await fetch(
        `${API_BASE_URL}/users?phoneNumber=${encodeURIComponent(phoneNumber)}`
      );
      return handleResponse(response);
    },

    // ID로 회원 조회
    getById: async (userId: string): Promise<Member> => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      return handleResponse(response);
    },

    // 회원 등록
    create: async (
      memberData: MemberCreateRequest,
      voiceFile?: File
    ): Promise<string> => {
      const formData = new FormData();

      // JSON 데이터를 FormData에 추가
      Object.entries(memberData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // 음성 파일이 있으면 추가
      if (voiceFile) {
        formData.append("voiceFile", voiceFile);
      }

      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        body: formData,
        // FormData를 사용할 때는 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 설정)
      });

      return handleResponse(response);
    },

    // 회원 정보 수정
    update: async (
      userId: string,
      updateData: MemberUpdateRequest
    ): Promise<Member> => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      return handleResponse(response);
    },

    // 회원 삭제
    delete: async (userId: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });

      return handleResponse(response);
    },
  },

  // 로그인 관련 API
  auth: {
    // 음성 로그인
    loginWithVoice: async (audioFile: File): Promise<string> => {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        body: formData,
      });

      return handleResponse(response);
    },

    // 전화번호 뒷자리로 로그인
    loginWithPhoneNumber: async (last4Digits: string): Promise<string> => {
      const response = await fetch(
        `${API_BASE_URL}/login/phoneNum?last4Digits=${last4Digits}`,
        {
          method: "POST",
        }
      );

      return handleResponse(response);
    },
  },

  // 출입 로그 관련 API
  enterLogs: {
    // 모든 출입 로그 조회
    getAll: async (): Promise<EnterLog[]> => {
      const response = await fetch(`${API_BASE_URL}/logs`);
      const json = await handleResponse(response);
      return json.data; // data 배열만 반환
    },
    // 특정 회원의 출입 로그 조회
    getByMemberId: async (memberId: string): Promise<EnterLog[]> => {
      const response = await fetch(`${API_BASE_URL}/logs/${memberId}`);
      return handleResponse(response);
    },
  },
};
