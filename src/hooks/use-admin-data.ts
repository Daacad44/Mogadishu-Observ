import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService, gisLayerService } from "@/services/api";
import type { UserRole } from "@/types";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => profileService.getAll(),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      profileService.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

export function useGisLayers() {
  return useQuery({
    queryKey: ["gis-layers"],
    queryFn: () => gisLayerService.getAll(),
  });
}

export function useToggleGisLayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_visible }: { id: string; is_visible: boolean }) =>
      gisLayerService.updateVisibility(id, is_visible),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gis-layers"] }),
  });
}

export function useDistricts() {
  return useQuery({
    queryKey: ["districts"],
    queryFn: () => profileService.getDistricts(),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => profileService.getAdminStats(),
  });
}
