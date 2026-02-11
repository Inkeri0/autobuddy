import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Car, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User arrived via password reset link — ready to set new password
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Wachtwoord moet minimaal 6 tekens bevatten.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Wachtwoorden komen niet overeen.',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon wachtwoord niet resetten. Probeer het opnieuw.',
      });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Car className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">AutoBuddy</span>
          </div>
          <p className="text-muted-foreground">Garage Portaal</p>
        </div>

        <Card className="dashboard-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {success ? 'Wachtwoord gewijzigd!' : 'Nieuw wachtwoord instellen'}
            </CardTitle>
            <CardDescription className="text-center">
              {success
                ? 'Uw wachtwoord is succesvol gewijzigd'
                : 'Voer uw nieuwe wachtwoord in'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-4">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <p className="text-muted-foreground mb-6">
                  U kunt nu inloggen met uw nieuwe wachtwoord.
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/login')}
                >
                  Ga naar inloggen
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nieuw wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimaal 6 tekens"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Herhaal wachtwoord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-focus"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bezig...
                    </>
                  ) : (
                    'Wachtwoord wijzigen'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
