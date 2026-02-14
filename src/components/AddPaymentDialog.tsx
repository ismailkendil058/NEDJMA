import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClinicStore } from '@/stores/clinicStore';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface AddPaymentDialogProps {
  patientId: string;
  patientName: string;
  remaining: number;
  actorId: string;
  actorName: string;
  actorRole: 'receptionist' | 'owner';
  trigger?: React.ReactNode;
}

export function AddPaymentDialog({ patientId, patientName, remaining, actorId, actorName, actorRole, trigger }: AddPaymentDialogProps) {
  const { addPayment } = useClinicStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (numAmount > remaining) {
      toast.error(`Le montant ne peut pas dépasser ${remaining.toLocaleString()} DA`);
      return;
    }

    addPayment(patientId, numAmount, actorId, actorName, actorRole);
    toast.success(`Paiement de ${numAmount.toLocaleString()} DA enregistré pour ${patientName}`);
    setAmount('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Paiement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Ajouter un paiement</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Patient: <strong>{patientName}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Reste à payer: <strong>{remaining.toLocaleString()} DA</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (DA)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              min={1}
              max={remaining}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90">
            Enregistrer le paiement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
