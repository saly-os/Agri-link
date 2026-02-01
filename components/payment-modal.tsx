"use client"

import { useState } from "react"
import { Check, Smartphone, CreditCard, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  total: number
  onSuccess: (data: { method: string; phoneNumber: string; address: string }) => void
  isLoading?: boolean
}

const paymentMethods = [
  { 
    id: "orange", 
    name: "Orange Money", 
    color: "bg-orange-500",
    logo: "OM"
  },
  { 
    id: "wave", 
    name: "Wave", 
    color: "bg-blue-500",
    logo: "W"
  },
  { 
    id: "free", 
    name: "Free Money", 
    color: "bg-green-600",
    logo: "FM"
  },
]

type Step = "select" | "confirm" | "processing" | "success"

export function PaymentModal({ open, onClose, total, onSuccess, isLoading }: PaymentModalProps) {
  const [step, setStep] = useState<Step>("select")
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  const handleConfirm = () => {
    setStep("processing")
    // Submit to API
    onSuccess({
      method: selectedMethod === "orange" ? "orange_money" : selectedMethod === "wave" ? "wave" : "free_money",
      phoneNumber: phone,
      address: address,
    })
  }

  // Reset when closing
  const resetState = () => {
    setStep("select")
    setSelectedMethod(null)
    setPhone("")
    setAddress("")
  }

  const handleClose = () => {
    if (step !== "processing" && !isLoading) {
      onClose()
      resetState()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "select" && "Choisir le mode de paiement"}
            {step === "confirm" && "Confirmer le paiement"}
            {step === "processing" && "Paiement en cours..."}
            {step === "success" && "Paiement reussi !"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && "Selectionnez votre methode de paiement preferee"}
            {step === "confirm" && `Montant total: ${total.toLocaleString()} FCFA`}
            {step === "processing" && "Veuillez valider sur votre telephone"}
            {step === "success" && "Votre commande a ete confirmee"}
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-3 py-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id)
                  setStep("confirm")
                }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-lg border-2 p-4 transition-all",
                  "hover:border-primary hover:bg-primary/5"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold",
                  method.color
                )}>
                  {method.logo}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-sm text-muted-foreground">Paiement mobile securise</p>
                </div>
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Methode</span>
                <span className="font-medium">
                  {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {total.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse de livraison</Label>
              <Input
                id="address"
                type="text"
                placeholder="Ex: Medina, Dakar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numero de telephone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="77 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Vous recevrez une demande de validation sur ce numero
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setStep("select")}
              >
                Retour
              </Button>
              <Button
                className="flex-1"
                disabled={phone.length < 9 || address.length < 3}
                onClick={handleConfirm}
              >
                Confirmer
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <Smartphone className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <p className="text-center text-muted-foreground">
              Composez votre code PIN sur votre telephone pour valider le paiement
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="text-center font-semibold text-lg mb-1">Merci pour votre commande !</p>
            <p className="text-center text-muted-foreground">
              Le producteur a ete notifie
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
