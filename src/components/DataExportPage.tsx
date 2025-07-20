import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Download, FileText, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";

interface DataExport {
  id: string;
  export_type: string;
  format: string;
  status: string;
  file_url: string | null;
  filters: any;
  created_at: string;
  completed_at: string | null;
}

export default function DataExportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exports, setExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<string>("");
  const [format, setFormat] = useState<string>("csv");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    try {
      // Temporary dummy data until database types are updated
      setExports([
        {
          id: "1",
          export_type: "clients",
          format: "csv",
          status: "completed",
          file_url: "#",
          filters: {},
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error in fetchExports:', error);
    }
  };

  const handleExport = async () => {
    if (!exportType) {
      toast({
        title: "Ошибка",
        description: "Выберите тип данных для экспорта",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const filters: any = {};
      if (dateRange?.from && dateRange?.to) {
        filters.date_from = dateRange.from.toISOString().split('T')[0];
        filters.date_to = dateRange.to.toISOString().split('T')[0];
      }

      // Temporary implementation until database types are updated
      console.log('Creating export:', { exportType, format, filters });

      toast({
        title: "Экспорт запущен",
        description: "Ваш запрос на экспорт данных поставлен в очередь. Вы получите уведомление, когда файл будет готов."
      });

      // Refresh exports list
      fetchExports();
      
      // Reset form
      setExportType("");
      setDateRange(undefined);
    } catch (error) {
      console.error('Error creating export:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось запустить экспорт данных",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'processing': return 'Обрабатывается';
      case 'pending': return 'В очереди';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  const getExportTypeText = (type: string) => {
    switch (type) {
      case 'clients': return 'Клиенты';
      case 'appointments': return 'Записи';
      case 'financial': return 'Финансы';
      case 'analytics': return 'Аналитика';
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Экспорт данных</h1>
        <p className="text-muted-foreground">Экспорт данных в различных форматах для внешнего анализа</p>
      </div>

      {/* Export Form */}
      <Card>
        <CardHeader>
          <CardTitle>Создать экспорт</CardTitle>
          <CardDescription>Выберите тип данных и параметры для экспорта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-type">Тип данных</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип данных" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clients">Клиенты</SelectItem>
                  <SelectItem value="appointments">Записи</SelectItem>
                  <SelectItem value="financial">Финансовые данные</SelectItem>
                  <SelectItem value="analytics">Аналитика</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Формат файла</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Период (опционально)</Label>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full md:w-auto">
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Создание экспорта...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Создать экспорт
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Exports History */}
      <Card>
        <CardHeader>
          <CardTitle>История экспортов</CardTitle>
          <CardDescription>Последние экспорты данных</CardDescription>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Экспортов пока нет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exports.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(exportItem.status)}
                    <div>
                      <div className="font-medium">
                        {getExportTypeText(exportItem.export_type)} ({exportItem.format.toUpperCase()})
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(exportItem.created_at).toLocaleString('ru')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={exportItem.status === 'completed' ? 'default' : 'secondary'}>
                      {getStatusText(exportItem.status)}
                    </Badge>
                    {exportItem.status === 'completed' && exportItem.file_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={exportItem.file_url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}