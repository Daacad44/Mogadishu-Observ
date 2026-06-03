import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  growthService,
  densityService,
  statisticsService,
  predictionService,
  reportService,
} from "@/services/api";

export function useGrowthData(year?: number) {
  return useQuery({
    queryKey: ["growth", year],
    queryFn: () =>
      year ? growthService.getByYear(year) : growthService.getAll(),
  });
}

export function useDensityData(year?: number) {
  return useQuery({
    queryKey: ["density", year],
    queryFn: () =>
      densityService.getAll(year ? { year: String(year) } : undefined),
  });
}

export function useStatistics() {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: () => statisticsService.get(),
  });
}

export function usePredictions() {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: () => predictionService.getAll(),
  });
}

export function useCreatePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: predictionService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["predictions"] }),
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => reportService.getAll(),
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportService.generate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}
