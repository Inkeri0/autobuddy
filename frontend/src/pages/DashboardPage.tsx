import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Booking, BookingWithDetails } from '@/types/database';
import { BOOKING_STATUS_LABELS, AVAILABILITY_STATUS_LABELS, SERVICE_CATEGORY_LABELS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Wrench,
  Building2,
} from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { garage, refreshGarage } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    todayBookings: 0,
    pendingBookings: 0,
    weekBookings: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!garage) {
      navigate('/setup');
      return;
    }
    fetchDashboardData();
    setupRealtimeSubscription();
  }, [garage]);

  const fetchDashboardData = async () => {
    if (!garage) return;

    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Fetch today's bookings count
      const { count: todayCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('garage_id', garage.id)
        .eq('date', format(today, 'yyyy-MM-dd'));

      // Fetch pending bookings count
      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('garage_id', garage.id)
        .eq('status', 'pending');

      // Fetch week bookings count
      const { count: weekCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('garage_id', garage.id)
        .gte('date', format(startOfWeek, 'yyyy-MM-dd'))
        .lte('date', format(endOfWeek, 'yyyy-MM-dd'));

      setStats({
        todayBookings: todayCount || 0,
        pendingBookings: pendingCount || 0,
        weekBookings: weekCount || 0,
      });

      // Fetch upcoming bookings with details
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          profile:profiles!bookings_user_id_fkey(full_name, email),
          service:garage_services!bookings_service_id_fkey(name, category)
        `)
        .eq('garage_id', garage.id)
        .gte('date', format(today, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed', 'in_progress'])
        .order('date', { ascending: true })
        .order('time_slot', { ascending: true })
        .limit(5);

      setUpcomingBookings((bookingsData as BookingWithDetails[]) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!garage) return;

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `garage_id=eq.${garage.id}`,
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateAvailabilityStatus = async (status: 'green' | 'orange' | 'red') => {
    if (!garage) return;

    try {
      const { error } = await supabase
        .from('garages')
        .update({ availability_status: status })
        .eq('id', garage.id);

      if (error) throw error;

      await refreshGarage();
      toast({
        title: 'Status bijgewerkt',
        description: `Beschikbaarheid is nu: ${AVAILABILITY_STATUS_LABELS[status]}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon status niet bijwerken.',
      });
    }
  };

  const getBookingStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: 'booking-pending',
      confirmed: 'booking-confirmed',
      in_progress: 'booking-in-progress',
      completed: 'booking-completed',
      cancelled: 'booking-cancelled',
      no_show: 'booking-no-show',
    };

    return (
      <span className={cn('status-badge', statusClasses[status] || 'bg-muted')}>
        {BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] || status}
      </span>
    );
  };

  if (!garage) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welkom terug bij {garage.name}</p>
          </div>

          {/* Availability Status Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Status:</span>
            <div className="inline-flex rounded-lg border border-border p-1 bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateAvailabilityStatus('green')}
                className={cn(
                  'rounded-md text-xs',
                  garage.availability_status === 'green' && 'bg-status-green text-primary-foreground'
                )}
              >
                Veel plek
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateAvailabilityStatus('orange')}
                className={cn(
                  'rounded-md text-xs',
                  garage.availability_status === 'orange' && 'bg-status-orange text-primary-foreground'
                )}
              >
                Beperkt
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateAvailabilityStatus('red')}
                className={cn(
                  'rounded-md text-xs',
                  garage.availability_status === 'red' && 'bg-status-red text-primary-foreground'
                )}
              >
                Vol
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vandaag</p>
                  <p className="text-2xl font-bold text-foreground">{stats.todayBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In afwachting</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deze week</p>
                  <p className="text-2xl font-bold text-foreground">{stats.weekBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Star className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Beoordeling</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-foreground">
                      {garage.average_rating?.toFixed(1) || '-'}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      ({garage.total_reviews || 0})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2">
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">
                  Komende afspraken
                </CardTitle>
                <Link to="/dashboard/bookings">
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                    Bekijk alle
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="h-10 w-10 bg-muted-foreground/20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
                          <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Geen komende afspraken</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-xs font-medium">
                              {format(parseISO(booking.date), 'MMM', { locale: nl }).toUpperCase()}
                            </span>
                            <span className="text-lg font-bold leading-none">
                              {format(parseISO(booking.date), 'd')}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground truncate">
                              {(booking as any).profile?.full_name || 'Klant'}
                            </p>
                            {getBookingStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {(booking as any).service?.name || 'Service'} • {booking.time_slot}
                          </p>
                        </div>
                        {booking.car_license_plate && (
                          <div className="hidden sm:block text-right">
                            <Badge variant="outline" className="font-mono">
                              {booking.car_license_plate}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="dashboard-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Snelle acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/dashboard/services" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Wrench className="h-5 w-5 text-accent" />
                    Beheer services
                  </Button>
                </Link>
                <Link to="/dashboard/bookings" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    Bekijk afspraken
                  </Button>
                </Link>
                <Link to="/dashboard/profile" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Building2 className="h-5 w-5 text-accent" />
                    Bewerk profiel
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Garage Info Card */}
            <Card className="dashboard-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Garage info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Adres</p>
                  <p className="text-sm font-medium">{garage.address}</p>
                  <p className="text-sm font-medium">{garage.postal_code} {garage.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefoon</p>
                  <p className="text-sm font-medium">{garage.phone}</p>
                </div>
                {garage.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="text-sm font-medium truncate">{garage.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
