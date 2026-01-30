import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Erreur d&apos;authentification</CardTitle>
          <CardDescription>
            Une erreur s&apos;est produite lors de la verification de votre compte.
            Veuillez reessayer.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            Si le probleme persiste, veuillez contacter notre support a{" "}
            <a
              href="mailto:support@agrilink.sn"
              className="text-primary hover:underline"
            >
              support@agrilink.sn
            </a>
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">Retour a la connexion</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full bg-transparent">
              Retour a l&apos;accueil
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
