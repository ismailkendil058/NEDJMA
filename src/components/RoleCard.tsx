import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  delay?: number;
}

export function RoleCard({ title, description, icon: Icon, route, delay = 0 }: RoleCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={() => navigate(route)}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden border border-border bg-card p-6 sm:p-10 md:p-14 transition-all duration-500 hover:border-accent/50 hover:shadow-xl">
        {/* Accent line */}
        <motion.div 
          className="absolute top-0 left-0 h-1 bg-accent"
          initial={{ width: 0 }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.4 }}
        />
        
        <div className="space-y-6">
          <div className="w-16 h-16 flex items-center justify-center border border-border group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500">
            <Icon className="w-7 h-7 text-foreground group-hover:text-accent transition-colors duration-500" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm tracking-wide">
              {description}
            </p>
          </div>
          
          <div className="flex items-center text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="tracking-widest uppercase text-xs">Accéder</span>
            <motion.span 
              className="ml-2"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              →
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
