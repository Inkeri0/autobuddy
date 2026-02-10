import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, BookingWithDetails } from '@/types/database';
import { BOOKING_STATUS_LABELS, SERVICE_CATEGORY_LABELS } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Car, Clock, User, CheckCircle, XCircle, PlayCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BookingsPage() {
  const { garage } = useAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (garage) {
      fetchBookings();
      setupRealtimeSubscription();
    }
  }, [garage, currentDate, viewMode]);

  const fetchBookings = async () => {
    if (!garage) return;
    setLoading(true);

    try {
      let startDate: Date, endDate: Date;

      if (viewMode === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profile:profiles!bookings_user_id_fkey(full_name, email, phone),
          service:garage_services!bookings_service_id_fkey(name, category)
        `)
        .eq('garage_id', garage.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) throw error;
      setBookings((data as BookingWithDetails[]) || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon afspraken niet laden.',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!garage) return;

    const channel = supabase
      .channel('bookings-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `garage_id=eq.${garage.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Status bijgewerkt',
        description: `Afspraak is nu: ${BOOKING_STATUS_LABELS[newStatus as keyof typeof BOOKING_STATUS_LABELS]}`,
      });

      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon status niet bijwerken.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const profile = (booking as any).profile;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      profile?.full_name?.toLowerCase().includes(searchLower) ||
      booking.car_license_plate?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

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

  const getStatusActions = (booking: BookingWithDetails) => {
    const actions: { label: string; status: string; icon: React.ReactNode; variant: 'default' | 'destructive' | 'outline' }[] = [];

    switch (booking.status) {
      case 'pending':
        actions.push({ label: 'Bevestigen', status: 'confirmed', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' });
        actions.push({ label: 'Annuleren', status: 'cancelled', icon: <XCircle className="h-4 w-4" />, variant: 'destructive' });
        break;
      case 'confirmed':
        actions.push({ label: 'Start', status: 'in_progress', icon: <PlayCircle className="h-4 w-4" />, variant: 'default' });
        actions.push({ label: 'Niet komen', status: 'no_show', icon: <AlertTriangle className="h-4 w-4" />, variant: 'destructive' });
        break;
      case 'in_progress':
        actions.push({ label: 'Voltooien', status: 'completed', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' });
        break;
    }

    return actions;
  };

  // Calendar view helpers
  const getDaysInView = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter((b) => isSameDay(parseISO(b.date), day));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Afspraken</h1>
            <p className="text-muted-foreground">Beheer uw garage afspraken</p>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <span className="font-medium">
                {viewMode === 'week'
                  ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: nl })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: nl })}`
                  : format(currentDate, 'MMMM yyyy', { locale: nl })}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam of kenteken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter op status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="week">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month">
                    <List className="h-4 w-4 mr-2" />
                    Maand
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Calendar/List View */}
        <Card className="dashboard-card">
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : viewMode === 'week' ? (
              <div className="grid grid-cols-7 gap-2">
                {getDaysInView().map((day) => (
                  <div key={day.toISOString()} className="min-h-[200px]">
                    <div className={cn(
                      "text-center p-2 rounded-t-lg font-medium text-sm",
                      isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <div>{format(day, 'EEE', { locale: nl })}</div>
                      <div className="text-lg">{format(day, 'd')}</div>
                    </div>
                    <div className="space-y-1 p-1">
                      {getBookingsForDay(day).map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={cn(
                            "w-full p-2 rounded text-xs text-left transition-colors",
                            booking.status === 'pending' && "bg-amber-50 hover:bg-amber-100 border-l-2 border-amber-500",
                            booking.status === 'confirmed' && "bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500",
                            booking.status === 'in_progress' && "bg-purple-50 hover:bg-purple-100 border-l-2 border-purple-500",
                            booking.status === 'completed' && "bg-green-50 hover:bg-green-100 border-l-2 border-green-500",
                            booking.status === 'cancelled' && "bg-gray-50 hover:bg-gray-100 border-l-2 border-gray-400",
                            booking.status === 'no_show' && "bg-red-50 hover:bg-red-100 border-l-2 border-red-500"
                          )}
                        >
                          <div className="font-medium truncate">{booking.time_slot}</div>
                          <div className="truncate text-muted-foreground">
                            {(booking as any).profile?.full_name || 'Klant'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Geen afspraken gevonden</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
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
                        <div className="hidden sm:block">
                          <Badge variant="outline" className="font-mono">
                            {booking.car_license_plate}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-lg">
            {selectedBooking && (
              <>
                <DialogHeader>
                  <DialogTitle>Afspraak details</DialogTitle>
                  <DialogDescription>
                    {format(parseISO(selectedBooking.date), 'EEEE d MMMM yyyy', { locale: nl })} om {selectedBooking.time_slot}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getBookingStatusBadge(selectedBooking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-4 w-4" /> Klant
                      </p>
                      <p className="font-medium">{(selectedBooking as any).profile?.full_name || 'Onbekend'}</p>
                      <p className="text-sm text-muted-foreground">{(selectedBooking as any).profile?.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Service
                      </p>
                      <p className="font-medium">{(selectedBooking as any).service?.name || 'Service'}</p>
                      <p className="text-sm text-muted-foreground">
                        {SERVICE_CATEGORY_LABELS[(selectedBooking as any).service?.category as keyof typeof SERVICE_CATEGORY_LABELS] || ''}
                      </p>
                    </div>
                  </div>

                  {(selectedBooking.car_brand || selectedBooking.car_license_plate) && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                        <Car className="h-4 w-4" /> Voertuig
                      </p>
                      <div className="bg-muted p-3 rounded-lg">
                        {selectedBooking.car_brand && (
                          <p className="font-medium">
                            {selectedBooking.car_brand} {selectedBooking.car_model} {selectedBooking.car_year && `(${selectedBooking.car_year})`}
                          </p>
                        )}
                        {selectedBooking.car_license_plate && (
                          <Badge variant="outline" className="font-mono mt-1">
                            {selectedBooking.car_license_plate}
                          </Badge>
                        )}
                        {selectedBooking.car_mileage && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedBooking.car_mileage.toLocaleString()} km
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedBooking.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Opmerkingen</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  {getStatusActions(selectedBooking).map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      onClick={() => updateBookingStatus(selectedBooking.id, action.status)}
                      disabled={actionLoading}
                      className="gap-2"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
                      {action.label}
                    </Button>
                  ))}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
