'use client';

import { useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Tabs, Tab, Spinner, Chip } from '@heroui/react';
import { IoRefresh, IoDesktopOutline, IoPhonePortraitOutline, IoSearch } from 'react-icons/io5';

interface PageSpeedData {
  url: string;
  strategy: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  coreWebVitals: {
    lcp: number | null;
    inp: number | null;
    cls: number | null;
    ttfb: number | null;
    fcp: number | null;
  };
  audits: {
    'largest-contentful-paint': string | null;
    'interaction-to-next-paint': string | null;
    'cumulative-layout-shift': string | null;
    'total-blocking-time': string | null;
    'speed-index': string | null;
    'first-contentful-paint': string | null;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    displayValue: string;
    numericValue: number;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
  }>;
}

function getScoreColor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 90) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Tốt';
  if (score >= 50) return 'Cần cải thiện';
  return 'Kém';
}

function ScoreRing({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{score}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-foreground-600">{label}</span>
      <Chip color={getScoreColor(score)} variant="flat" size="sm" className="mt-1">
        {getScoreLabel(score)}
      </Chip>
    </div>
  );
}

export default function SpeedPage() {
  const [url, setUrl] = useState('https://cineverse.ankun.dev');
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PageSpeedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSpeedData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/speed?url=${encodeURIComponent(url)}&strategy=${strategy}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, strategy]);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            PageSpeed Insights
          </h1>
          <p className="text-foreground-500">
            Phân tích hiệu suất website với Google PageSpeed Insights API
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="URL Website"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  startContent={<IoSearch className="text-foreground-400" />}
                  size="lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  color={strategy === 'mobile' ? 'primary' : 'default'}
                  variant={strategy === 'mobile' ? 'solid' : 'flat'}
                  onPress={() => setStrategy('mobile')}
                  startContent={<IoPhonePortraitOutline />}
                  size="lg"
                >
                  Mobile
                </Button>
                <Button
                  color={strategy === 'desktop' ? 'primary' : 'default'}
                  variant={strategy === 'desktop' ? 'solid' : 'flat'}
                  onPress={() => setStrategy('desktop')}
                  startContent={<IoDesktopOutline />}
                  size="lg"
                >
                  Desktop
                </Button>
                <Button
                  color="primary"
                  onPress={fetchSpeedData}
                  isLoading={loading}
                  startContent={!loading && <IoRefresh />}
                  size="lg"
                  className="min-w-[120px]"
                >
                  Phân tích
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="mb-6">
            <CardBody className="p-12 flex flex-col items-center justify-center">
              <Spinner size="lg" className="mb-4" />
              <p className="text-foreground-500">Đang phân tích website...</p>
              <p className="text-sm text-foreground-400 mt-2">
                Quá trình này có thể mất 10-30 giây
              </p>
            </CardBody>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6" classNames={{ base: 'border-danger bg-danger-50' }}>
            <CardBody className="p-6">
              <div className="flex items-start gap-3">
                <div className="text-danger text-2xl">⚠️</div>
                <div>
                  <p className="text-danger font-medium">{error}</p>
                  {error.includes('API key') && (
                    <div className="mt-3 text-sm text-foreground-600">
                      <p className="font-medium">Cách khắc phục:</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Truy cập <a href="https://console.cloud.google.com/" target="_blank" rel="noopener" className="text-primary underline">Google Cloud Console</a></li>
                        <li>Kiểm tra API key trong Credentials</li>
                        <li>Đảm bảo PageSpeed Insights API đã được bật</li>
                        <li>Kiểm tra domain restrictions (nếu có)</li>
                        <li>Hoặc tạo API key mới và cập nhật SPEED_API_KEY</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {/* Scores Overview */}
            <Card className="mb-6">
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Kết quả đánh giá</h2>
                <div className="text-sm text-foreground-500">
                  {data.strategy === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'} • {new Date(data.timestamp).toLocaleString('vi-VN')}
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <ScoreRing score={data.scores.performance} label="Hiệu suất" />
                  <ScoreRing score={data.scores.accessibility} label="Khả năng tiếp cận" />
                  <ScoreRing score={data.scores.bestPractices} label="Thực hành tốt" />
                  <ScoreRing score={data.scores.seo} label="SEO" />
                  <ScoreRing score={data.scores.pwa} label="PWA" />
                </div>
              </CardBody>
            </Card>

            {/* Core Web Vitals */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold">Core Web Vitals</h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {data.audits['largest-contentful-paint'] && (
                    <div className="bg-default-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">{data.audits['largest-contentful-paint']}</div>
                      <div className="text-sm text-foreground-500 mt-1">LCP (Largest Contentful Paint)</div>
                      <div className="text-xs text-foreground-400 mt-1">Tải nội dung lớn nhất</div>
                    </div>
                  )}
                  {data.audits['interaction-to-next-paint'] && (
                    <div className="bg-default-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">{data.audits['interaction-to-next-paint']}</div>
                      <div className="text-sm text-foreground-500 mt-1">INP (Interaction to Next Paint)</div>
                      <div className="text-xs text-foreground-400 mt-1">Tương tác tiếp theo</div>
                    </div>
                  )}
                  {data.audits['cumulative-layout-shift'] && (
                    <div className="bg-default-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">{data.audits['cumulative-layout-shift']}</div>
                      <div className="text-sm text-foreground-500 mt-1">CLS (Cumulative Layout Shift)</div>
                      <div className="text-xs text-foreground-400 mt-1">Dịch chuyển layout</div>
                    </div>
                  )}
                  {data.audits['first-contentful-paint'] && (
                    <div className="bg-default-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">{data.audits['first-contentful-paint']}</div>
                      <div className="text-sm text-foreground-500 mt-1">FCP (First Contentful Paint)</div>
                      <div className="text-xs text-foreground-400 mt-1">Nội dung đầu tiên</div>
                    </div>
                  )}
                  {data.audits['speed-index'] && (
                    <div className="bg-default-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">{data.audits['speed-index']}</div>
                      <div className="text-sm text-foreground-500 mt-1">Speed Index</div>
                      <div className="text-xs text-foreground-400 mt-1">Chỉ số tốc độ</div>
                    </div>
                  )}
                  {data.audits['total-blocking-time'] && (
                    <div className="bg-default-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">{data.audits['total-blocking-time']}</div>
                      <div className="text-sm text-foreground-500 mt-1">TBT (Total Blocking Time)</div>
                      <div className="text-xs text-foreground-400 mt-1">Thời gian chặn</div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Opportunities and Diagnostics */}
            <Tabs aria-label="PageSpeed details">
              <Tab key="opportunities" title={`Cơ hội cải thiện (${data.opportunities.length})`}>
                <Card className="mt-4">
                  <CardBody className="p-6">
                    {data.opportunities.length === 0 ? (
                      <p className="text-foreground-500 text-center py-8">Không có cơ hội cải thiện nào!</p>
                    ) : (
                      <div className="space-y-4">
                        {data.opportunities.map((opp) => (
                          <div key={opp.id} className="border-b border-divider last:border-0 pb-4 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground">{opp.title}</h3>
                                <p className="text-sm text-foreground-500 mt-1" dangerouslySetInnerHTML={{ __html: opp.description }} />
                              </div>
                              <div className="ml-4 text-right">
                                <div className="text-lg font-semibold text-danger">{opp.displayValue}</div>
                                <div className="text-xs text-foreground-400">có thể tiết kiệm</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Tab>
              <Tab key="diagnostics" title={`Chẩn đoán (${data.diagnostics.length})`}>
                <Card className="mt-4">
                  <CardBody className="p-6">
                    {data.diagnostics.length === 0 ? (
                      <p className="text-foreground-500 text-center py-8">Không có vấn đề chẩn đoán nào!</p>
                    ) : (
                      <div className="space-y-4">
                        {data.diagnostics.map((diag) => (
                          <div key={diag.id} className="border-b border-divider last:border-0 pb-4 last:pb-0">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${diag.score < 0.5 ? 'bg-danger' : 'bg-warning'}`} />
                              <h3 className="font-medium text-foreground">{diag.title}</h3>
                            </div>
                            <p className="text-sm text-foreground-500 mt-1" dangerouslySetInnerHTML={{ __html: diag.description }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
