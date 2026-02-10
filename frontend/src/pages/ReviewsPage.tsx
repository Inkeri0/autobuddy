import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewWithProfile } from '@/types/database';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Star, Loader2, MessageSquare, ThumbsUp, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReviewsPage() {
  const { garage } = useAuth();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    serviceQuality: 0,
    honesty: 0,
    speed: 0,
    distribution: [0, 0, 0, 0, 0], // 1-5 stars
  });

  useEffect(() => {
    if (garage) {
      fetchReviews();
    }
  }, [garage, sortBy]);

  const fetchReviews = async () => {
    if (!garage) return;
    setLoading(true);

    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profile:profiles!reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('garage_id', garage.id);

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      const reviewsData = (data as ReviewWithProfile[]) || [];
      setReviews(reviewsData);

      // Calculate stats
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, r) => sum + r.rating, 0);
        const avgServiceQuality = reviewsData.filter((r) => r.service_quality).reduce((sum, r) => sum + (r.service_quality || 0), 0) / reviewsData.filter((r) => r.service_quality).length || 0;
        const avgHonesty = reviewsData.filter((r) => r.honesty).reduce((sum, r) => sum + (r.honesty || 0), 0) / reviewsData.filter((r) => r.honesty).length || 0;
        const avgSpeed = reviewsData.filter((r) => r.speed).reduce((sum, r) => sum + (r.speed || 0), 0) / reviewsData.filter((r) => r.speed).length || 0;

        const distribution = [0, 0, 0, 0, 0];
        reviewsData.forEach((r) => {
          if (r.rating >= 1 && r.rating <= 5) {
            distribution[r.rating - 1]++;
          }
        });

        setStats({
          average: totalRating / reviewsData.length,
          total: reviewsData.length,
          serviceQuality: avgServiceQuality,
          honesty: avgHonesty,
          speed: avgSpeed,
          distribution,
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon reviews niet laden.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizes[size],
              star <= rating ? 'fill-warning text-warning' : 'text-muted'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
            <p className="text-muted-foreground">Bekijk wat uw klanten over u zeggen</p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sorteren op" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nieuwste eerst</SelectItem>
              <SelectItem value="oldest">Oudste eerst</SelectItem>
              <SelectItem value="highest">Hoogste beoordeling</SelectItem>
              <SelectItem value="lowest">Laagste beoordeling</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Rating */}
          <Card className="stat-card md:col-span-1">
            <CardContent className="p-0">
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground mb-2">
                  {stats.average.toFixed(1)}
                </div>
                <div className="mb-2">{renderStars(Math.round(stats.average), 'lg')}</div>
                <p className="text-sm text-muted-foreground">
                  {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card className="stat-card md:col-span-1">
            <CardContent className="p-0 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.distribution[stars - 1];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-6">{stars}</span>
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Category Ratings */}
          <Card className="stat-card md:col-span-1">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-accent" />
                  <span className="text-sm">Kwaliteit</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(stats.serviceQuality), 'sm')}
                  <span className="text-sm font-medium">{stats.serviceQuality.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <span className="text-sm">Eerlijkheid</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(stats.honesty), 'sm')}
                  <span className="text-sm font-medium">{stats.honesty.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-sm">Snelheid</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(stats.speed), 'sm')}
                  <span className="text-sm font-medium">{stats.speed.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">Alle reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nog geen reviews ontvangen</p>
                <p className="text-sm mt-1">Reviews verschijnen hier zodra klanten ze plaatsen</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-border pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {((review as any).profile?.full_name || 'K')[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">
                            {(review as any).profile?.full_name || 'Klant'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(review.created_at), 'd MMM yyyy', { locale: nl })}
                          </span>
                        </div>
                        <div className="mb-2">{renderStars(review.rating)}</div>
                        {review.comment && (
                          <p className="text-sm text-foreground mb-3">{review.comment}</p>
                        )}
                        {(review.service_quality || review.honesty || review.speed) && (
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            {review.service_quality && (
                              <span>Kwaliteit: {review.service_quality}/5</span>
                            )}
                            {review.honesty && <span>Eerlijkheid: {review.honesty}/5</span>}
                            {review.speed && <span>Snelheid: {review.speed}/5</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
