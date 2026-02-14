import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface Translations {
  [key: string]: {
    fr: string;
    ar: string;
  };
}

const translations: Translations = {
  // Landing Page
  'welcome': { fr: 'Bienvenue', ar: 'مرحبا' },
  'dental_clinic': { fr: 'Clinique Dentaire de Luxe', ar: 'عيادة أسنان فاخرة' },
  'select_role': { fr: 'Sélectionnez votre espace', ar: 'اختر مساحتك' },
  'owner': { fr: 'Propriétaire', ar: 'المالك' },
  'doctor': { fr: 'Médecin', ar: 'طبيب' },
  'receptionist': { fr: 'Accueil', ar: 'الاستقبال' },
  'patient': { fr: 'Patient', ar: 'مريض' },
  'login': { fr: 'Connexion', ar: 'تسجيل الدخول' },
  'logout': { fr: 'Déconnexion', ar: 'تسجيل الخروج' },
  'phone': { fr: 'Numéro de téléphone', ar: 'رقم الهاتف' },
  'password': { fr: 'Mot de passe', ar: 'كلمة المرور' },
  'email': { fr: 'Email', ar: 'البريد الإلكتروني' },
  'name': { fr: 'Nom', ar: 'الاسم' },
  'full_name': { fr: 'Nom complet', ar: 'الاسم الكامل' },
  'select_name': { fr: 'Sélectionnez votre nom', ar: 'اختر اسمك' },
  'continue': { fr: 'Continuer', ar: 'استمر' },
  'back': { fr: 'Retour', ar: 'رجوع' },
  'search': { fr: 'Rechercher', ar: 'بحث' },
  'search_patient': { fr: 'Rechercher un patient', ar: 'البحث عن مريض' },
  
  // Patient Dashboard
  'total_care': { fr: 'Total de soin', ar: 'إجمالي العلاج' },
  'remaining': { fr: 'Reste', ar: 'المتبقي' },
  'installments_paid': { fr: 'Tranches payées', ar: 'الأقساط المدفوعة' },
  'past_appointments': { fr: 'Rendez-vous déjà fait', ar: 'المواعيد السابقة' },
  'next_appointment': { fr: 'Prochain rendez-vous', ar: 'الموعد القادم' },
  'clinic_location': { fr: 'Localisation de la clinique', ar: 'موقع العيادة' },
  'emergency_contact': { fr: 'Contact d\'urgence', ar: 'جهة اتصال الطوارئ' },
  'my_account': { fr: 'Mon compte', ar: 'حسابي' },
  
  // Receptionist Dashboard
  'patient_management': { fr: 'Gestion des patients', ar: 'إدارة المرضى' },
  'create_patient': { fr: 'Créer un patient', ar: 'إنشاء مريض' },
  'add_payment': { fr: 'Ajouter un paiement', ar: 'إضافة دفعة' },
  'schedule_appointment': { fr: 'Planifier un rendez-vous', ar: 'جدولة موعد' },
  'doctor_schedule': { fr: 'Emploi du temps médecin', ar: 'جدول الطبيب' },
  'upcoming_appointments': { fr: 'Rendez-vous à venir', ar: 'المواعيد القادمة' },
  'completed': { fr: 'Terminé', ar: 'مكتمل' },
  'pending': { fr: 'En attente', ar: 'قيد الانتظار' },
  'payment_status': { fr: 'Statut de paiement', ar: 'حالة الدفع' },
  'assign_doctor': { fr: 'Attribuer un médecin', ar: 'تعيين طبيب' },
  
  // Doctor Dashboard
  'my_patients': { fr: 'Mes patients', ar: 'مرضاي' },
  'my_schedule': { fr: 'Mon emploi du temps', ar: 'جدولي' },
  'care_type': { fr: 'Type de soin', ar: 'نوع العلاج' },
  'total_amount': { fr: 'Montant total', ar: 'المبلغ الإجمالي' },
  'mark_completed': { fr: 'Marquer comme terminé', ar: 'وضع علامة مكتمل' },
  'patient_details': { fr: 'Détails du patient', ar: 'تفاصيل المريض' },
  
  // Owner Dashboard
  'statistics': { fr: 'Statistiques', ar: 'إحصائيات' },
  'total_revenue': { fr: 'Revenu total', ar: 'إجمالي الإيرادات' },
  'revenue_by_doctor': { fr: 'Revenu par médecin', ar: 'الإيرادات حسب الطبيب' },
  'total_patients': { fr: 'Total patients', ar: 'إجمالي المرضى' },
  'patients_per_doctor': { fr: 'Patients par médecin', ar: 'المرضى لكل طبيب' },
  'manage_doctors': { fr: 'Gérer les médecins', ar: 'إدارة الأطباء' },
  'manage_receptionists': { fr: 'Gérer les réceptionnistes', ar: 'إدارة موظفي الاستقبال' },
  'create_doctor': { fr: 'Créer un médecin', ar: 'إنشاء طبيب' },
  'create_receptionist': { fr: 'Créer un réceptionniste', ar: 'إنشاء موظف استقبال' },
  'select_period': { fr: 'Sélectionner la période', ar: 'اختر الفترة' },
  'year': { fr: 'Année', ar: 'سنة' },
  'month': { fr: 'Mois', ar: 'شهر' },
  'custom_range': { fr: 'Période personnalisée', ar: 'فترة مخصصة' },
  
  // Common
  'save': { fr: 'Enregistrer', ar: 'حفظ' },
  'cancel': { fr: 'Annuler', ar: 'إلغاء' },
  'delete': { fr: 'Supprimer', ar: 'حذف' },
  'edit': { fr: 'Modifier', ar: 'تعديل' },
  'view': { fr: 'Voir', ar: 'عرض' },
  'close': { fr: 'Fermer', ar: 'إغلاق' },
  'confirm': { fr: 'Confirmer', ar: 'تأكيد' },
  'da': { fr: 'DA', ar: 'دج' },
  'no_data': { fr: 'Aucune donnée', ar: 'لا توجد بيانات' },
  'loading': { fr: 'Chargement...', ar: 'جار التحميل...' },
  'error': { fr: 'Erreur', ar: 'خطأ' },
  'success': { fr: 'Succès', ar: 'نجاح' },
  'dashboard': { fr: 'Tableau de bord', ar: 'لوحة القيادة' },
  'calendar': { fr: 'Calendrier', ar: 'التقويم' },
  'today': { fr: 'Aujourd\'hui', ar: 'اليوم' },
  'select_doctor': { fr: 'Sélectionner un médecin', ar: 'اختر طبيبًا' },
  'amount_paid': { fr: 'Montant payé', ar: 'المبلغ المدفوع' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
