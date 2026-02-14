import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Lock, User } from 'lucide-react';
import { PageTransition, FadeIn } from '@/components/PageTransition';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Demo doctors data
const demoDocters = [
  { id: 'dr-1', name: 'Dr. Ahmed Benali', phone: '0550123456' },
  { id: 'dr-2', name: 'Dr. Fatima Zerhouni', phone: '0551234567' },
  { id: 'dr-3', name: 'Dr. Karim Mansouri', phone: '0552345678' },
];

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const doctor = demoDocters.find(d => d.id === selectedDoctor);
    
    // Demo login validation
    if (doctor && doctor.phone === phone && password === '123') {
      login({
        id: doctor.id,
        name: doctor.name,
        role: 'doctor',
        phone: phone,
      });
      toast({
        title: t('success'),
        description: 'Connexion réussie',
      });
      navigate('/doctor/dashboard');
    } else {
      toast({
        title: t('error'),
        description: 'Informations incorrectes',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <PageTransition className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate('/')}
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
              {t('doctor')}
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              {t('login')}
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">
                  {t('select_doctor')}
                </label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="h-14 border-border bg-background">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Sélectionnez votre nom" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {demoDocters.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    placeholder="0550123456"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 border-border bg-background focus:border-accent transition-colors"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !selectedDoctor}
                className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 tracking-widest uppercase text-xs font-medium transition-all duration-300"
              >
                {isLoading ? t('loading') : t('login')}
              </Button>
            </form>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-center text-muted-foreground text-xs mt-8 tracking-wide">
              Demo: Dr. Ahmed Benali / 0550123456 / 123
            </p>
          </FadeIn>
        </div>
      </main>
    </PageTransition>
  );
}
