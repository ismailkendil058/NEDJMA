import { Logo } from '@/components/Logo';
import { RoleCard } from '@/components/RoleCard';
import { PageTransition, FadeIn } from '@/components/PageTransition';
import { useLanguage } from '@/contexts/LanguageContext';
import { Crown, Stethoscope, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { t } = useLanguage();

  const roles = [
    {
      title: t('owner'),
      description: 'Gérez votre clinique, analysez les performances et supervisez votre équipe.',
      icon: Crown,
      route: '/owner/login',
    },
    {
      title: t('doctor'),
      description: 'Accédez à vos patients, gérez les soins et consultez votre emploi du temps.',
      icon: Stethoscope,
      route: '/doctor/login',
    },
    {
      title: t('receptionist'),
      description: 'Gérez les rendez-vous, les paiements et l\'accueil des patients.',
      icon: Users,
      route: '/receptionist/login',
    },
    {
      title: t('patient'),
      description: 'Consultez votre dossier, vos rendez-vous et vos paiements.',
      icon: User,
      route: '/patient/login',
    },
  ];

  return (
    <PageTransition className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          {/* LanguageSwitcher removed */}
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 sm:pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Main Title */}
          <div className="text-center mb-20 space-y-6">
            <FadeIn delay={0.2}>
              <Logo size="lg" className="justify-center flex" />
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <p className="text-muted-foreground tracking-[0.3em] uppercase text-sm">
                {t('dental_clinic')}
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="w-24 h-px bg-accent mx-auto mt-8" />
            </FadeIn>
          </div>

          {/* Role Selection */}
          <FadeIn delay={0.8}>
            <p className="text-center text-muted-foreground tracking-widest uppercase text-xs mb-12">
              {t('select_role')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {roles.map((role, index) => (
              <RoleCard
                key={role.route}
                title={role.title}
                description={role.description}
                icon={role.icon}
                route={role.route}
                delay={1 + index * 0.15}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-center text-muted-foreground text-xs tracking-widest"
          >
            © 2025 NEDJMA — {t('dental_clinic')}
          </motion.p>
        </div>
      </footer>
    </PageTransition>
  );
};

export default Index;
