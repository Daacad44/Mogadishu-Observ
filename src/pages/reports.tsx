import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReports, useGenerateReport } from "@/hooks/use-growth-data";
import { logEvent } from "@/lib/analytics/log-event";
import { formatDate } from "@/utils";
import {
  FileText,
  Download,
  Loader2,
  Plus,
} from "lucide-react";

export default function ReportsPage() {
  const { data: reports, isLoading } = useReports();
  const generateReport = useGenerateReport();
  const [title, setTitle] = useState("");

  const handleGenerate = () => {
    if (!title.trim()) return;
    generateReport.mutate({
      title,
      year_range: "2014–2026",
      description: "Auto-generated urban growth analysis report",
    });
    setTitle("");
  };

  const handleDownload = (reportTitle: string) => {
    const content = `Mogadishu Urban Growth Observatory\nReport: ${reportTitle}\nGenerated: ${new Date().toISOString()}\n\nThis is a sample report export. Connect Supabase Storage for full PDF generation.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    logEvent("report_download", { report: reportTitle });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Research Reports</h1>
        </div>
        <p className="text-muted-foreground">
          Download urban growth analysis reports and export GIS data
        </p>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label>Report Title</Label>
            <Input
              placeholder="Enter report title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={generateReport.isPending}>
              {generateReport.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports?.map((report) => (
            <div key={report.id} className="animate-fade-in-up">
              <Card glass className="glass-card-hover h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base leading-snug">
                      {report.title}
                    </CardTitle>
                    <Badge variant={report.status === "published" ? "success" : "secondary"}>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{report.year_range}</span>
                    <span>{formatDate(report.created_at)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDownload(report.title)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
