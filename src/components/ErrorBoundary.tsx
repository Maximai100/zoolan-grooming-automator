import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Send } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Логирование ошибки
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Вызов колбэка если передан
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Отправка ошибки в систему мониторинга (когда будет настроена)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Здесь можно интегрировать Sentry, LogRocket или другой сервис
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Сохраняем в localStorage для отладки
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10))); // Храним последние 10 ошибок
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    const body = `
Произошла ошибка в приложении:

**Ошибка:** ${error?.message}

**Stack Trace:**
\`\`\`
${error?.stack}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack}
\`\`\`

**URL:** ${window.location.href}
**User Agent:** ${navigator.userAgent}
**Время:** ${new Date().toLocaleString()}
    `;
    
    const subject = encodeURIComponent('Ошибка в Zooplan CRM');
    const encodedBody = encodeURIComponent(body);
    window.open(`mailto:support@zooplan.ru?subject=${subject}&body=${encodedBody}`);
  };

  render() {
    if (this.state.hasError) {
      // Если передан кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Упс! Что-то пошло не так
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Произошла неожиданная ошибка. Мы уже знаем об этом и работаем над исправлением.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Детали ошибки (только в dev режиме) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Детали ошибки (dev):</h4>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-500">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-gray-500 mt-1 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Действия */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Перезагрузить страницу
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  На главную
                </Button>
                
                <Button
                  onClick={this.handleReportError}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Сообщить об ошибке
                </Button>
              </div>

              {/* Советы пользователю */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Что можно попробовать:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Перезагрузите страницу</li>
                  <li>• Очистите кэш браузера</li>
                  <li>• Попробуйте позже</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Компонент для небольших ошибок в отдельных секциях
export const ErrorSection: React.FC<{
  error: Error;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => {
  return (
    <div className={`p-6 text-center border border-red-200 rounded-lg bg-red-50 ${className}`}>
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
      <h3 className="font-medium text-red-900 mb-2">Ошибка загрузки</h3>
      <p className="text-sm text-red-700 mb-4">{error.message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="text-red-700 border-red-300 hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Попробовать снова
        </Button>
      )}
    </div>
  );
};