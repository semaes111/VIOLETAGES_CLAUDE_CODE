"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HeatmapChartProps {
  data: Array<{
    day: string;
    hour: number;
    value: number;
  }>;
  isLoading?: boolean;
}

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

export function HeatmapChart({ data, isLoading }: HeatmapChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapa de actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find max value for normalization
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Create a map for quick lookup
  const dataMap = new Map(data.map((d) => [`${d.day}-${d.hour}`, d.value]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Hours header */}
            <div className="mb-2 ml-10 flex gap-1">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-xs text-muted-foreground"
                >
                  {hour}h
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="space-y-1">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-1">
                  <div className="w-8 text-right text-xs text-muted-foreground">
                    {day}
                  </div>
                  <div className="flex flex-1 gap-1">
                    {hours.map((hour) => {
                      const value = dataMap.get(`${day}-${hour}`) || 0;
                      const intensity = value / maxValue;

                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={cn(
                            "flex-1 aspect-square rounded-sm transition-colors",
                            "hover:ring-2 hover:ring-primary hover:ring-offset-1"
                          )}
                          style={{
                            backgroundColor:
                              intensity > 0
                                ? `rgba(30, 58, 95, ${0.1 + intensity * 0.9})`
                                : "hsl(var(--muted))",
                          }}
                          title={`${day} ${hour}:00 - ${value} transacciones`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">Menos</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 1].map((opacity) => (
                  <div
                    key={opacity}
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: `rgba(30, 58, 95, ${opacity})`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Más</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
