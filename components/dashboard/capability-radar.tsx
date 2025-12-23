"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CapabilityRadar as CapabilityRadarData } from "@/app/types/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface CapabilityRadarProps {
  data?: CapabilityRadarData;
  isLoading?: boolean;
}

const CAPABILITY_LABELS: Record<keyof CapabilityRadarData, string> = {
  calculation: "Calculation",
  logic: "Logic",
  abstraction: "Abstraction",
  spatial: "Spatial",
  application: "Application",
};

export function CapabilityRadarChart({ data, isLoading }: CapabilityRadarProps) {
  const normalizeValue = (val: number | undefined | null) => {
    if (val === undefined || val === null) return 1; 
    let num = val;
    if (num > 0 && num <= 1) {
        return num * 10;
    }
    if (num > 10) {
        return num / 10;
    }
    return num <= 0 ? 0 : num; 
    };
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Capability Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Capability Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: CAPABILITY_LABELS[key as keyof CapabilityRadarData],
    value: normalizeValue(value),
    fullMark: 10,
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Capability Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid gridType="polygon" stroke="#ccc" /> 
              
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <Radar
                name="Capability"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
