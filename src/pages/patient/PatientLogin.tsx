import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, ChevronDown } from 'lucide-react';
import { PageTransition, FadeIn } from '@/components/PageTransition';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Demo patients data - grouped by phone number
const demoPatients = [
  { id: 'pat-1', name: 'Mohamed Kadi', phone: '0555678901' },
  { id: 'pat-2', name: 'Leila Kadi', phone: '0555678901' }, // Same phone as Mohamed
  { id: 'pat-3', name: 'Yasmine Belkacem', phone: '0556789012' },
  { id: 'pat-4', name: 'Omar Hamidi', phone: '0557890123' },
];

export default function PatientLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [step, setStep] = useState<'phone' | 'select'>('phone');
  const [matchingPatients, setMatchingPatients] = useState<typeof demoPatients>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Find patients with this phone number
    const matches = demoPatients.filter(p => p.phone === phone);

    if (matches.length === 0) {
      toast({
        title: t('error'),
        description: 'Aucun patient trouvé avec ce numéro',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (matches.length === 1) {
      // Auto-login if only one patient
      login({
        id: matches[0].id,
        name: matches[0].name,
        role: 'patient',
        phone: phone,
      });
      toast({
        title: t('success'),
        description: `Bienvenue, ${matches[0].name}`,
      });
      navigate('/patient/dashboard');
    } else {
      // Multiple patients - show selection
      setMatchingPatients(matches);
      setStep('select');
    }

    setIsLoading(false);
  };

  const handlePatientSelect = () => {
    const patient = matchingPatients.find(p => p.id === selectedPatient);
    if (patient) {
      login({
        id: patient.id,
        name: patient.name,
        role: 'patient',
        phone: phone,
      });
      toast({
        title: t('success'),
        description: `Bienvenue, ${patient.name}`,
      });
      navigate('/patient/dashboard');
    }
  };

  return (
    <PageTransition className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => step === 'select' ? setStep('phone') : navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm tracking-widest uppercase">{t('back')}</span>
          </motion.button>
          {/* LanguageSwitcher removed */}
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <FadeIn className="text-center mb-12">
            <Logo size="md" className="justify-center flex mb-6" />
            <h1 className="font-serif text-3xl font-light tracking-tight mb-2">
              {t('patient')}
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              {t('my_account')}
            </p>
          </FadeIn>

          {step === 'phone' ? (
            <FadeIn delay={0.2}>
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs tracking-widest uppercase text-muted-foreground">
                    {t('phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-12 h-14 border-border bg-background focus:border-accent transition-colors"
                      placeholder="0555678901"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 tracking-widest uppercase text-xs font-medium transition-all duration-300"
                >
                  {isLoading ? t('loading') : t('continue')}
                </Button>
              </form>

              <p className="text-center text-muted-foreground text-xs mt-8 tracking-wide">
                Demo: 0555678901 (2 patients) ou 0556789012 (1 patient)
              </p>
            </FadeIn>
          ) : (
            <FadeIn delay={0.2}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs tracking-widest uppercase text-muted-foreground">
                    {t('select_name')}
                  </label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="h-14 border-border bg-background">
                      <SelectValue placeholder="Choisissez votre nom" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchingPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handlePatientSelect}
                  disabled={!selectedPatient}
                  className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 tracking-widest uppercase text-xs font-medium transition-all duration-300"
                >
                  {t('continue')}
                </Button>
              </div>
            </FadeIn>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
