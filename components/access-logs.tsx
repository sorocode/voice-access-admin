"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Calendar, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { api, type EnterLog } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export function AccessLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [date, setDate] = useState<Date>();
  const [logs, setLogs] = useState<EnterLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 출입 로그 불러오기
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.enterLogs.getAll();
      setLogs(data);
    } catch (error) {
      console.error("출입 로그 조회 실패:", error);
      toast({
        title: "출입 로그 조회 실패",
        description: "출입 기록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      // 에러 발생 시 빈 배열로 설정
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 출입 로그 불러오기
  useEffect(() => {
    fetchLogs();
  }, []);

  // 필터링된 로그
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.memberName?.includes(searchTerm) ||
      log.phoneNumber?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      log.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesDate =
      !date || new Date(log.enterTime).toDateString() === date.toDateString();

    return matchesSearch && matchesStatus && matchesDate;
  });

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDate(undefined);
  };

  // 로그 내보내기 (CSV 형식)
  const exportLogs = () => {
    // 헤더 행
    const headers = ["회원명", "전화번호", "시간", "상태"];

    // 데이터 행
    const rows = filteredLogs.map((log) => [
      log.memberName,
      log.phoneNumber,
      new Date(log.enterTime).toLocaleString(),
      log.status === "ENTER" ? "입장" : "퇴장",
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // 다운로드 링크 생성
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `출입로그_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">출입로그</h1>
          <p className="text-gray-600 mt-2">
            모든 출입 기록을 확인하고 관리합니다
          </p>
        </div>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="w-4 h-4 mr-2" />
          로그 내보내기
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="이름 또는 전화번호 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="enter">입장</SelectItem>
                <SelectItem value="exit">퇴장</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={resetFilters}>
              <Filter className="w-4 h-4 mr-2" />
              초기화
            </Button>

            <Button onClick={fetchLogs}>새로고침</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>출입 기록 ({filteredLogs.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                출입 기록을 불러오는 중...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      회원
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      동작
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      시간
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-10 text-gray-500"
                      >
                        출입 기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {log.memberName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {log.memberName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.phoneNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant="outline"
                            className={
                              log.status === "ENTER"
                                ? "text-blue-600 border-blue-200"
                                : "text-purple-600 border-purple-200"
                            }
                          >
                            {log.status === "ENTER" ? "입장" : "퇴장"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(log.enterTime).toLocaleString()}
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
    </div>
  );
}
