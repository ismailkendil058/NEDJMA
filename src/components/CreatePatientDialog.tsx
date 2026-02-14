import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinicStore } from '@/stores/clinicStore';
import { PatientStatus } from '@/types/patient';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePatientDialogProps {
  actorId: string;
  actorName: string;
  actorRole: 'receptionist' | 'owner';
  trigger?: React.ReactNode;
}

export function CreatePatientDialog({ actorId, actorName, actorRole, trigger }: CreatePatientDialogProps) {
  const { doctors, addPatient } = useClinicStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorId, setDoctorId] = useState('');

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length > 100) {
      toast.error('Nom invalide (1-100 caractères)');
      return;
    }
    if (!/^0[5-7]\d{8}$/.test(phone)) {
      toast.error('Numéro de téléphone invalide (format: 05XXXXXXXX)');
      return;
    }
    if (!selectedDoctor) {
      toast.error('Veuillez sélectionner un médecin');
      return;
    }

    addPatient(
      {
        name: name.trim(),
        phone,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        status: PatientStatus.NEW,
        careType: null,
        careTotal: 0,
        careTotalLocked: false,
        nextAppointmentId: null,
        notificationConsent: null,
      },
      actorId,
      actorName,
      actorRole
    );

    toast.success(`Patient ${name.trim()} créé avec succès`);
    setName('');
    setPhone('');
    setDoctorId('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
            <UserPlus className="w-4 h-4" />
            Nouveau patient
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Nouveau patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mohamed Kadi"
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="0555123456"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Médecin traitant</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un médecin" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90">
            Créer le patient
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
