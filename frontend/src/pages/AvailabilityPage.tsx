import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AvailabilitySlot } from '@/types/database';
import { WEEKDAYS, AVAILABILITY_STATUS_LABELS, TIME_SLOTS } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, Lock, LockOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SlotData {
  [key: string]: {
    is_available: boolean;
    booking_id: string | null;
    customerName?: string;
  };
}

export default function AvailabilityPage() {
  const { garage, refreshGarage } = useAuth();
  const { toast } = useToast();

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slots, setSlots] = useState<SlotData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (garage) {
      fetchSlots();
    }
  }, [garage, currentWeekStart]);

  const fetchSlots = async () => {
    if (!garage) return;
    setLoading(true);

    try {
      const weekEnd = addDays(currentWeekStart, 6);

      // Fetch availability slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('garage_id', garage.id)
        .gte('date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      if (slotsError) throw slotsError;

      // Fetch bookings for this period
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, date, time_slot, user_id, profiles!bookings_user_id_fkey(full_name)')
        .eq('garage_id', garage.id)
        .gte('date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed', 'in_progress']);

      if (bookingsError) throw bookingsError;

      // Build slot data
      const slotMap: SlotData = {};

      // Initialize all slots as available
      for (let i = 0; i < 7; i++) {
        const day = addDays(currentWeekStart, i);
        const dateStr = format(day, 'yyyy-MM-dd');

        TIME_SLOTS.forEach((time) => {
          const key = `${dateStr}_${time}`;
          slotMap[key] = { is_available: true, booking_id: null };
        });
      }

      // Apply availability slots
      slotsData?.forEach((slot: any) => {
        const key = `${slot.date}_${slot.time_slot}`;
        if (slotMap[key]) {
          slotMap[key].is_available = slot.is_available;
          slotMap[key].booking_id = slot.booking_id;
        }
      });

      // Apply bookings
      bookingsData?.forEach((booking: any) => {
        const key = `${booking.date}_${booking.time_slot}`;
        if (slotMap[key]) {
          slotMap[key].booking_id = booking.id;
          slotMap[key].is_available = false;
          slotMap[key].customerName = booking.profiles?.full_name || 'Klant';
        }
      });

      setSlots(slotMap);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon beschikbaarheid niet laden.',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = async (date: string, time: string) => {
    if (!garage) return;

    const key = `${date}_${time}`;
    const currentSlot = slots[key];

    // Cannot toggle if there's a booking
    if (currentSlot?.booking_id) return;

    setSaving(true);
    const newAvailability = !currentSlot?.is_available;

    try {
      // Upsert the slot
      const { error } = await supabase.from('availability_slots').upsert(
        {
          garage_id: garage.id,
          date,
          time_slot: time,
          is_available: newAvailability,
        },
        { onConflict: 'garage_id,date,time_slot' }
      );

      if (error) throw error;

      setSlots((prev) => ({
        ...prev,
        [key]: { ...prev[key], is_available: newAvailability },
      }));
    } catch (error) {
      console.error('Error toggling slot:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon slot niet bijwerken.',
      });
    } finally {
      setSaving(false);
    }
  };

  const blockEntireDay = async (date: string) => {
    if (!garage) return;
    setSaving(true);

    try {
      const updates = TIME_SLOTS.map((time) => ({
        garage_id: garage.id,
        date,
        time_slot: time,
        is_available: false,
      }));

      const { error } = await supabase
        .from('availability_slots')
        .upsert(updates, { onConflict: 'garage_id,date,time_slot' });

      if (error) throw error;

      // Update local state
      const newSlots = { ...slots };
      TIME_SLOTS.forEach((time) => {
        const key = `${date}_${time}`;
        if (newSlots[key] && !newSlots[key].booking_id) {
          newSlots[key].is_available = false;
        }
      });
      setSlots(newSlots);

      toast({
        title: 'Dag geblokkeerd',
        description: 'Alle beschikbare slots zijn geblokkeerd.',
      });
    } catch (error) {
      console.error('Error blocking day:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon dag niet blokkeren.',
      });
    } finally {
      setSaving(false);
    }
  };

  const unblockEntireDay = async (date: string) => {
    if (!garage) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('garage_id', garage.id)
        .eq('date', date)
        .is('booking_id', null);

      if (error) throw error;

      // Update local state
      const newSlots = { ...slots };
      TIME_SLOTS.forEach((time) => {
        const key = `${date}_${time}`;
        if (newSlots[key] && !newSlots[key].booking_id) {
          newSlots[key].is_available = true;
        }
      });
      setSlots(newSlots);

      toast({
        title: 'Dag vrijgegeven',
        description: 'Alle slots zijn weer beschikbaar.',
      });
    } catch (error) {
      console.error('Error unblocking day:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon dag niet vrijgeven.',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalStatus = async (status: 'green' | 'orange' | 'red') => {
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart((prev) =>
      direction === 'prev' ? addDays(prev, -7) : addDays(prev, 7)
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Beschikbaarheid</h1>
            <p className="text-muted-foreground">Beheer uw openingstijden en slots</p>
          </div>

          {/* Global Status Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Globale status:</span>
            <div className="inline-flex rounded-lg border border-border p-1 bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateGlobalStatus('green')}
                className={cn(
                  'rounded-md text-xs',
                  garage?.availability_status === 'green' && 'bg-status-green text-primary-foreground'
                )}
              >
                Veel plek
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateGlobalStatus('orange')}
                className={cn(
                  'rounded-md text-xs',
                  garage?.availability_status === 'orange' && 'bg-status-orange text-primary-foreground'
                )}
              >
                Beperkt
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateGlobalStatus('red')}
                className={cn(
                  'rounded-md text-xs',
                  garage?.availability_status === 'red' && 'bg-status-red text-primary-foreground'
                )}
              >
                Vol
              </Button>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(currentWeekStart, 'd MMMM', { locale: nl })} -{' '}
                {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: nl })}
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card className="dashboard-card">
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground w-20">
                        Tijd
                      </th>
                      {weekDays.map((day) => (
                        <th key={day.toISOString()} className="p-2 text-center">
                          <div
                            className={cn(
                              'rounded-lg p-2',
                              isSameDay(day, new Date()) && 'bg-primary text-primary-foreground'
                            )}
                          >
                            <div className="text-xs font-medium">
                              {format(day, 'EEE', { locale: nl })}
                            </div>
                            <div className="text-lg font-bold">{format(day, 'd')}</div>
                          </div>
                          <div className="flex gap-1 mt-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => blockEntireDay(format(day, 'yyyy-MM-dd'))}
                              disabled={saving}
                              className="text-xs h-7 px-2"
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              Blokkeer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unblockEntireDay(format(day, 'yyyy-MM-dd'))}
                              disabled={saving}
                              className="text-xs h-7 px-2"
                            >
                              <LockOpen className="h-3 w-3 mr-1" />
                              Vrijgeven
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((time) => (
                      <tr key={time} className="border-t border-border">
                        <td className="p-2 text-sm font-medium text-muted-foreground">
                          {time}
                        </td>
                        {weekDays.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const key = `${dateStr}_${time}`;
                          const slot = slots[key];
                          const hasBooking = !!slot?.booking_id;
                          const isAvailable = slot?.is_available;

                          return (
                            <td key={key} className="p-1">
                              <button
                                onClick={() => !hasBooking && toggleSlot(dateStr, time)}
                                disabled={hasBooking || saving}
                                className={cn(
                                  'w-full h-10 rounded-lg text-xs font-medium transition-colors',
                                  hasBooking && 'slot-booked cursor-default',
                                  !hasBooking && isAvailable && 'slot-available',
                                  !hasBooking && !isAvailable && 'slot-blocked cursor-pointer hover:bg-muted'
                                )}
                              >
                                {hasBooking ? (
                                  <span className="text-blue-700 truncate px-1">
                                    {slot.customerName || 'Geboekt'}
                                  </span>
                                ) : isAvailable ? (
                                  <span className="text-green-700">Vrij</span>
                                ) : (
                                  <span className="text-muted-foreground">Gesloten</span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded slot-available" />
            <span>Beschikbaar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded slot-booked" />
            <span>Geboekt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded slot-blocked" />
            <span>Geblokkeerd</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
