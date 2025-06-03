import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, EnterLog } from "@/lib/api";
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "./ui/use-toast";

export function Dashboard() {
  const [logs, setLogs] = useState<EnterLog[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    {
      title: "총 회원수",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "오늘 출입",
      value: "89",
      change: "+5%",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "신규 회원",
      value: "24",
      change: "+8%",
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      title: "월간 증가율",
      value: "8.2%",
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">헬스장 회원 관리 시스템 현황</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="text-green-600">{stat.change}</span> 지난 달
                  대비
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 출입 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(-4).map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {log.memberName[0]}
                      </span>
                    </div>
                    <span className="font-medium">{log.memberName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const date = new Date(log.checkInTime);
                        const month = date.getMonth() + 1;
                        const day = date.getDate();
                        const hour = date.getHours();
                        const minute = date.getMinutes();
                        return `${hour}시 ${minute}분`;
                      })()}
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full text-center ${
                        log.status === "ENTER"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status === "ENTER" ? "입장" : "퇴장"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>회원 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">남성 회원</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">742명</span>
                  <span className="text-xs text-green-600">(60%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">여성 회원</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">492명</span>
                  <span className="text-xs text-green-600">(40%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-pink-500 h-2.5 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">평균 출석률</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">68%</span>
                  <span className="text-xs text-green-600">(+5%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
