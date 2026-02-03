"use client";

import { useMemo } from "react";
import { Card, CardBody, CardHeader, Progress, Chip } from "@heroui/react";
import { analyzeSEO, type SEOConfig, type SEOAnalysisResult, type SEOIssue } from "@/utils/seo/yoast-algorithm";
import { IoCheckmarkCircle, IoWarning, IoCloseCircle, IoInformationCircle } from "react-icons/io5";

interface SEOAnalyzerProps {
  config: SEOConfig;
  className?: string;
}

export default function SEOAnalyzer({ config, className }: SEOAnalyzerProps) {
  const analysis: SEOAnalysisResult = useMemo(() => {
    return analyzeSEO(config);
  }, [config]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "success";
      case "ok":
        return "warning";
      case "bad":
        return "danger";
      default:
        return "default";
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  // Group issues by severity
  const errors = analysis.issues.filter((i) => i.severity === "error");
  const warnings = analysis.issues.filter((i) => i.severity === "warning");
  const infos = analysis.issues.filter((i) => i.severity === "info");

  return (
    <div className={className}>
      {/* Overall Score */}
      <Card className="mb-4">
        <CardHeader className="flex-col items-start gap-3">
          <div className="flex w-full items-center justify-between">
            <h3 className="text-xl font-bold">Phân tích SEO</h3>
            <Chip color={getStatusColor(analysis.status)} variant="flat" size="lg">
              {analysis.score}/100
            </Chip>
          </div>
          <Progress
            value={analysis.score}
            color={getScoreColor(analysis.score)}
            size="lg"
            className="w-full"
          />
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Chip color="danger" size="sm" variant="flat">
                {errors.length} Lỗi
              </Chip>
              <Chip color="warning" size="sm" variant="flat">
                {warnings.length} Cảnh báo
              </Chip>
              <Chip color="success" size="sm" variant="flat">
                {infos.length} Tốt
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <h4 className="text-lg font-semibold">💡 Đề xuất cải thiện</h4>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-warning">▸</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="bg-danger/10">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-danger">
              <IoCloseCircle size={24} />
              Lỗi cần sửa ({errors.length})
            </h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {errors.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="bg-warning/10">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-warning">
              <IoWarning size={24} />
              Cảnh báo ({warnings.length})
            </h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {warnings.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Good Items */}
      {infos.length > 0 && (
        <Card>
          <CardHeader className="bg-success/10">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-success">
              <IoCheckmarkCircle size={24} />
              Tốt ({infos.length})
            </h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {infos.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: SEOIssue }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "danger";
      case "warning":
        return "warning";
      case "info":
        return "success";
      default:
        return "default";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <IoCloseCircle size={20} />;
      case "warning":
        return <IoWarning size={20} />;
      case "info":
        return <IoCheckmarkCircle size={20} />;
      default:
        return <IoInformationCircle size={20} />;
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-divider p-3">
      <div className={`text-${getSeverityColor(issue.severity)}`}>
        {getSeverityIcon(issue.severity)}
      </div>
      <div className="flex-1">
        <h5 className="mb-1 font-semibold">{issue.title}</h5>
        <p className="text-sm text-foreground-600">{issue.description}</p>
      </div>
      <Chip size="sm" variant="flat" color={getSeverityColor(issue.severity)}>
        {issue.score}
      </Chip>
    </div>
  );
}
