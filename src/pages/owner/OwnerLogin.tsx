import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { PageTransition, FadeIn } from '@/components/PageTransition';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function OwnerLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login - in production, this would be a real auth check
    if (email === 'owner@gmail.com' && password === '123') {
      login({
        id: 'owner-1',
        name: 'Propriétaire',
        role: 'owner',
        email: email,
      });
      toast({
        title: t('success'),
        description: 'Connexion réussie',
      });
      navigate('/owner/dashboard');
    } else {
      toast({
        title: t('error'),
        description: 'Email ou mot de passe incorrect',
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
              {t('owner')}
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              {t('login')}
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 border-border bg-background focus:border-accent transition-colors"
                    placeholder="owner@gmail.com"
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
              Demo: owner@gmail.com / 123
            </p>
          </FadeIn>
        </div>
      </main>
    </PageTransition>
  );
}
