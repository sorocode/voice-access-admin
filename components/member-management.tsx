"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api, type Member, type MemberUpdateRequest } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewMemberDialogOpen, setIsNewMemberDialogOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    weight: "",
    height: "",
  });

  // 회원 목록 불러오기
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await api.members.getAll();
      setMembers(data);
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
      toast({
        title: "회원 목록 조회 실패",
        description: "회원 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 회원 목록 불러오기
  useEffect(() => {
    fetchMembers();
  }, []);

  // 회원 검색
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchMembers();
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.members.searchByName(searchTerm);
      setMembers(data);
    } catch (error) {
      console.error("회원 검색 실패:", error);
      toast({
        title: "검색 실패",
        description: "회원 검색 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 회원 수정 폼 제출
  const handleEditSubmit = async () => {
    if (!selectedMember) return;

    const updateData: MemberUpdateRequest = {
      name: formData.name || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      address: formData.address || undefined,
      weight: formData.weight || undefined,
      height: formData.height || undefined,
    };

    try {
      await api.members.update(selectedMember.id, updateData);
      setIsEditDialogOpen(false);
      toast({
        title: "회원 정보 수정 완료",
        description: "회원 정보가 성공적으로 수정되었습니다.",
      });
      fetchMembers(); // 목록 새로고침
    } catch (error) {
      console.error("회원 정보 수정 실패:", error);
      toast({
        title: "회원 정보 수정 실패",
        description: "회원 정보 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 회원 추가 폼 제출
  const handleNewMemberSubmit = async () => {
    try {
      await api.members.create({
        username: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        weight: formData.weight,
        height: formData.height,
      });
      setIsNewMemberDialogOpen(false);
      toast({
        title: "회원 등록 완료",
        description: "새 회원이 성공적으로 등록되었습니다.",
      });
      fetchMembers(); // 목록 새로고침
      // 폼 초기화
      setFormData({
        name: "",
        phoneNumber: "",
        address: "",
        weight: "",
        height: "",
      });
    } catch (error) {
      console.error("회원 등록 실패:", error);
      toast({
        title: "회원 등록 실패",
        description: "회원 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 회원 삭제
  const handleDelete = async (memberId: string) => {
    if (confirm("정말로 이 회원을 삭제하시겠습니까?")) {
      try {
        await api.members.delete(memberId);
        toast({
          title: "회원 삭제 완료",
          description: "회원이 성공적으로 삭제되었습니다.",
        });
        fetchMembers(); // 목록 새로고침
      } catch (error) {
        console.error("회원 삭제 실패:", error);
        toast({
          title: "회원 삭제 실패",
          description: "회원 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 회원 수정 다이얼로그 열기
  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || "",
      phoneNumber: member.phoneNumber || "",
      address: member.address || "",
      weight: member.weight || "",
      height: member.height || "",
    });
    setIsEditDialogOpen(true);
  };

  // 새 회원 다이얼로그 열기
  const handleNewMember = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      address: "",
      weight: "",
      height: "",
    });
    setIsNewMemberDialogOpen(true);
  };

  // 폼 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 검색어 입력 시 엔터키 처리
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">회원관리</h1>
          <p className="text-gray-600 mt-2">등록된 회원 정보를 관리합니다</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleNewMember}
        >
          <Plus className="w-4 h-4 mr-2" />
          신규 회원 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>회원 목록</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="이름 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                검색
              </Button>
              <Button variant="outline" onClick={fetchMembers}>
                전체보기
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                회원 정보를 불러오는 중...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      이름
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      전화번호
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      주소
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      몸무게
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      키
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      가입일
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      최근 출입
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-gray-500"
                      >
                        회원 정보가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name?.[0] || "?"}
                              </span>
                            </div>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {member.phoneNumber}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {member.address || "-"}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {member.weight || "-"}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {member.height || "-"}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {member.createdAt
                            ? new Date(member.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        {/* <td className="py-4 px-4 text-gray-600">
                          {member.lastEnterTime ? new Date(member.lastEnterTime).toLocaleString() : "-"}
                        </td> */}
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(member)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 회원 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>회원 정보 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                전화번호
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                주소
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                몸무게
              </Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="height" className="text-right">
                키
              </Label>
              <Input
                id="height"
                value={formData.height}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleEditSubmit}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 신규 회원 등록 다이얼로그 */}
      <Dialog
        open={isNewMemberDialogOpen}
        onOpenChange={setIsNewMemberDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>신규 회원 등록</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                전화번호 *
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                주소
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                몸무게
              </Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="height" className="text-right">
                키
              </Label>
              <Input
                id="height"
                value={formData.height}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsNewMemberDialogOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleNewMemberSubmit}>등록</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
