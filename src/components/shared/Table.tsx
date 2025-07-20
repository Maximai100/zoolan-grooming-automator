import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Filter
} from 'lucide-react';
import type { TableColumn, SortParams } from '@/types/common';

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  
  // Пагинация
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  
  // Сортировка
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
    onSortChange: (sort: SortParams) => void;
  };
  
  // Поиск
  search?: {
    value: string;
    placeholder?: string;
    onSearchChange: (value: string) => void;
  };
  
  // Фильтры
  filters?: {
    field: string;
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
  
  // Действия
  actions?: {
    onExport?: () => void;
    onRefresh?: () => void;
  };
  
  // Кастомизация
  className?: string;
  emptyMessage?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
}

const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  error = null,
  pagination,
  sorting,
  search,
  filters,
  actions,
  className = '',
  emptyMessage = 'Нет данных для отображения',
  rowClassName,
  onRowClick
}: TableProps<T>) => {
  
  // Вычисляем отображаемые данные для пагинации на клиенте
  const displayData = useMemo(() => {
    if (pagination) {
      // Если пагинация управляется сервером, возвращаем данные как есть
      return data;
    }
    return data;
  }, [data, pagination]);

  const getSortIcon = (columnKey: string) => {
    if (!sorting || sorting.field !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sorting.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const handleSort = (columnKey: string) => {
    if (!sorting) return;
    
    const newDirection = 
      sorting.field === columnKey && sorting.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    sorting.onSortChange({
      field: columnKey,
      direction: newDirection
    });
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { page, pageSize, total, onPageChange, onPageSizeChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Показано {startItem}-{endItem} из {total}</span>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>на странице</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Страница</span>
            <Badge variant="outline" className="px-2 py-1">
              {page} из {totalPages}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-2">Ошибка загрузки данных</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Поиск и фильтры */}
      {(search || filters?.length || actions) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Поиск */}
              {search && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={search.placeholder || 'Поиск...'}
                    value={search.value}
                    onChange={(e) => search.onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {/* Фильтры */}
              {filters?.map((filter, index) => (
                <Select
                  key={index}
                  value={filter.value}
                  onValueChange={filter.onChange}
                >
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}

              {/* Действия */}
              {actions && (
                <div className="flex gap-2">
                  {actions.onExport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.onExport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Таблица */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`text-left p-4 font-medium text-muted-foreground ${
                      column.sortable ? 'cursor-pointer hover:text-foreground' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && typeof column.key === 'string' && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && typeof column.key === 'string' && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <div className="mt-3 text-muted-foreground">Загрузка...</div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                displayData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${rowClassName ? rowClassName(row, rowIndex) : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="p-4">
                        {column.render 
                          ? column.render(row[column.key as keyof T], row)
                          : String(row[column.key as keyof T] || '')
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {renderPagination()}
      </Card>
    </div>
  );
};

export default Table;