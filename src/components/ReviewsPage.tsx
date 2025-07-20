import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

export function ReviewsPage() {
  const { reviews, loading, updateReview } = useReviews();
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  const handleResponse = async (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response?.trim()) return;

    await updateReview(reviewId, {
      response: response,
      responded_at: new Date().toISOString(),
    });

    setResponseText(prev => ({
      ...prev,
      [reviewId]: '',
    }));
  };

  const toggleVisibility = async (reviewId: string, isPublic: boolean) => {
    await updateReview(reviewId, { is_public: !isPublic });
  };

  const toggleFeatured = async (reviewId: string, isFeatured: boolean) => {
    await updateReview(reviewId, { is_featured: !isFeatured });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка отзывов...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Отзывы клиентов</h1>
        <div className="flex gap-2">
          <Badge variant="outline">
            Всего отзывов: {reviews.length}
          </Badge>
          <Badge variant="outline">
            Средняя оценка: {
              reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : '0'
            }
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {review.client?.first_name} {review.client?.last_name}
                    <div className="flex">{renderStars(review.rating)}</div>
                  </CardTitle>
                  {review.service && (
                    <p className="text-sm text-muted-foreground">
                      Услуга: {review.service.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleVisibility(review.id, review.is_public)}
                  >
                    {review.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={review.is_featured ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFeatured(review.id, review.is_featured)}
                  >
                    ⭐
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {review.comment && (
                <div className="mb-4">
                  <p className="text-sm">{review.comment}</p>
                </div>
              )}

              {review.response && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Ваш ответ:</p>
                  <p className="text-sm">{review.response}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.responded_at!).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              )}

              {!review.response && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Написать ответ на отзыв..."
                    value={responseText[review.id] || ''}
                    onChange={(e) => setResponseText(prev => ({
                      ...prev,
                      [review.id]: e.target.value
                    }))}
                  />
                  <Button
                    onClick={() => handleResponse(review.id)}
                    disabled={!responseText[review.id]?.trim()}
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ответить
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="text-center p-8">
              <p className="text-muted-foreground">Отзывов пока нет</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}