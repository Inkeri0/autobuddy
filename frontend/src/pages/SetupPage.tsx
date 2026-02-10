import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { OpeningHours } from '@/types/database';
import { SPECIALIZATIONS, CAR_BRANDS, PROVINCES, WEEKDAYS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Car, Building2, Phone, Clock, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Bedrijfsgegevens', 'Contact', 'Specialisaties', 'Openingstijden'];

export default function SetupPage() {
  const { user, refreshGarage } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', province: '', postal_code: '',
    phone: '', email: '', website: '',
    specializations: [] as string[], brands_serviced: [] as string[], is_ev_specialist: false,
    opening_hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: '09:00', close: '14:00', closed: true },
    } as OpeningHours,
  });

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Ensure profile exists before creating garage (handles missing trigger case)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile if it doesn't exist - get full_name from user metadata
        const fullName = user.user_metadata?.full_name || formData.name || 'Garage Owner';
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: 'garage_owner',
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
      } else {
        // Update existing profile to garage_owner role
        await supabase
          .from('profiles')
          .update({ role: 'garage_owner' })
          .eq('id', user.id);
      }

      const { error } = await supabase.from('garages').insert({
        owner_id: user.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postal_code,
        country: 'NL',
        latitude: 52.3676, longitude: 4.9041,
        phone: formData.phone,
        email: formData.email || null,
        website: formData.website || null,
        specializations: formData.specializations,
        brands_serviced: formData.brands_serviced,
        is_ev_specialist: formData.is_ev_specialist,
        opening_hours: formData.opening_hours,
        availability_status: 'green',
        is_active: true,
      });

      if (error) throw error;

      await refreshGarage();
      toast({ title: 'Garage aangemaakt!', description: 'Welkom bij AutoBuddy.' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating garage:', error);
      toast({ variant: 'destructive', title: 'Fout', description: 'Kon garage niet aanmaken.' });
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Car className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">AutoBuddy</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Stel uw garage in</h1>
          <p className="text-muted-foreground">Stap {step + 1} van {STEPS.length}: {STEPS[step]}</p>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            {step === 0 && (
              <div className="space-y-4">
                <div><Label>Bedrijfsnaam *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Uw garage naam" /></div>
                <div><Label>Adres *</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Straat en huisnummer" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Postcode *</Label><Input value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} placeholder="1234 AB" /></div>
                  <div><Label>Plaats *</Label><Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                </div>
                <div><Label>Provincie *</Label>
                  <Select value={formData.province} onValueChange={(v) => setFormData({ ...formData, province: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecteer" /></SelectTrigger>
                    <SelectContent>{PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div><Label>Telefoonnummer *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="06-12345678" /></div>
                <div><Label>E-mail</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                <div><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://" /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div><Label className="mb-3 block">Specialisaties</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALIZATIONS.slice(0, 8).map((s) => (
                      <label key={s} className={cn('flex items-center gap-2 p-2 rounded border cursor-pointer', formData.specializations.includes(s) ? 'border-primary bg-primary/5' : 'border-border')}>
                        <Checkbox checked={formData.specializations.includes(s)} onCheckedChange={() => setFormData({ ...formData, specializations: formData.specializations.includes(s) ? formData.specializations.filter((x) => x !== s) : [...formData.specializations, s] })} />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div><Label className="mb-3 block">Merken (selecteer enkele)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {CAR_BRANDS.slice(0, 12).map((b) => (
                      <label key={b} className={cn('flex items-center gap-2 p-2 rounded border cursor-pointer text-sm', formData.brands_serviced.includes(b) ? 'border-primary bg-primary/5' : 'border-border')}>
                        <Checkbox checked={formData.brands_serviced.includes(b)} onCheckedChange={() => setFormData({ ...formData, brands_serviced: formData.brands_serviced.includes(b) ? formData.brands_serviced.filter((x) => x !== b) : [...formData.brands_serviced, b] })} />
                        {b}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {WEEKDAYS.map(({ key, label }) => {
                  const k = key as keyof OpeningHours;
                  return (
                    <div key={key} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <span className="w-24 font-medium text-sm">{label}</span>
                      <Checkbox checked={formData.opening_hours[k].closed} onCheckedChange={(c) => setFormData({ ...formData, opening_hours: { ...formData.opening_hours, [k]: { ...formData.opening_hours[k], closed: !!c } } })} />
                      <span className="text-sm">Gesloten</span>
                      {!formData.opening_hours[k].closed && (
                        <>
                          <Input type="time" value={formData.opening_hours[k].open} onChange={(e) => setFormData({ ...formData, opening_hours: { ...formData.opening_hours, [k]: { ...formData.opening_hours[k], open: e.target.value } } })} className="w-28" />
                          <span>-</span>
                          <Input type="time" value={formData.opening_hours[k].close} onChange={(e) => setFormData({ ...formData, opening_hours: { ...formData.opening_hours, [k]: { ...formData.opening_hours[k], close: e.target.value } } })} className="w-28" />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}><ArrowLeft className="h-4 w-4 mr-2" />Vorige</Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} disabled={step === 0 && (!formData.name || !formData.address || !formData.city)}>Volgende<ArrowRight className="h-4 w-4 ml-2" /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saving} className="bg-primary">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Bezig...</> : <><Check className="h-4 w-4 mr-2" />Voltooien</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
