// src/components/AccountModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  accountName: string; 
}

export const AccountModal = ({ isOpen, onClose, onSubmit, accountName }: AccountModalProps) => {
  const [name, setName] = useState(accountName);

  useEffect(() => {
    if (isOpen) {
      setName(accountName);
    }
  }, [isOpen, accountName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Editar Nome da Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <label htmlFor="account-name" className="text-sm">Nome da Conta</label>
            <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-700 border-slate-600" autoFocus/>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-genesi-blue hover:bg-blue-600">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};