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
import { useToast } from '@/hooks/use-toast';

// Demo receptionists data
const demoReceptionists = [
  { id: 'rec-1', name: 'Sarah Boudiaf', phone: '0553456789' },
  { id: 'rec-2', name: 'Amina Hadji', phone: '0554567890' },
];

export default function ReceptionistLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const receptionist = demoReceptionists.find(
      r => r.name.toLowerCase() === name.toLowerCase() && r.phone === phone
    );
    
    // Demo login validation
    if (receptionist && password === '123') {
      login({
        id: receptionist.id,
        name: receptionist.name,
        role: 'receptionist',
        phone: phone,
      });
      toast({
        title: t('success'),
        description: 'Connexion réussie',
      });
      navigate('/receptionist/dashboard');
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
              {t('receptionist')}
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              {t('login')}
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">
                  {t('name')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-14 border-border bg-background focus:border-accent transition-colors"
                    placeholder="Sarah Boudiaf"
                    required
                  />
                </div>
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
                    placeholder="0553456789"
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
                disabled={isLoading}
                className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 tracking-widest uppercase text-xs font-medium transition-all duration-300"
              >
                {isLoading ? t('loading') : t('login')}
              </Button>
            </form>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-center text-muted-foreground text-xs mt-8 tracking-wide">
              Demo: Sarah Boudiaf / 0553456789 / 123
            </p>
          </FadeIn>
        </div>
      </main>
    </PageTransition>
  );
}
