import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { clearAllStorage, resetAllDataToDefaults } from '../utils/storage';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      clearAllStorage();
      resetAllDataToDefaults();
    } catch (e) {
      console.error('Error during data reset:', e);
    }
    if (this.props.onReset) {
      this.props.onReset();
    }
    window.location.reload();
  };

  private handleCopyError = () => {
    const errorReport = `Error: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorReport);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-4 font-sans text-right" dir="rtl">
          <div className="max-w-xl w-full bg-white rounded-2xl border border-[#E8E1D5] shadow-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-[#D9534F]">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D3436]">
                  {this.props.fallbackTitle || 'تنبيه: حدث خطأ غير متوقع أثناء تشغيل التطبيق'}
                </h1>
                <p className="text-xs text-[#5D6567] mt-0.5">
                  تم اعتراض الخطأ بنجاح لحماية بياناتك من التلف.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl p-4 mb-6">
              <p className="text-sm text-[#2D3436] font-medium mb-1">
                {this.state.error?.message || 'تعذر تحميل أو تهيئة بيانات المقرأة'}
              </p>
              <p className="text-xs text-[#5D6567] leading-relaxed">
                قد يحدث هذا نتيجة بيانات قديمة أو تالفة في الذاكرة المحلية للمتصفح. يمكنك تجربة إعادة التحميل أو استعادة الإعدادات السليمة.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetData}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>استعادة البيانات الافتراضية</span>
              </button>
            </div>

            {/* Error details toggle */}
            <div className="border-t border-[#E8E1D5] pt-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="inline-flex items-center gap-1.5 text-xs text-[#5D6567] hover:text-[#2D3436] font-semibold transition-colors cursor-pointer"
                >
                  <span>تفاصيل الخطأ الفني (للمطورين)</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {this.state.showDetails && (
                  <button
                    type="button"
                    onClick={this.handleCopyError}
                    className="inline-flex items-center gap-1 text-xs text-[#4A5D4E] hover:underline font-semibold cursor-pointer"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span>تم نسخ التقرير</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ التقرير</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 dir-ltr text-left leading-relaxed">
                  <p className="text-red-400 font-bold mb-1">{this.state.error?.toString()}</p>
                  <pre className="whitespace-pre-wrap text-neutral-400">{this.state.errorInfo?.componentStack}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
