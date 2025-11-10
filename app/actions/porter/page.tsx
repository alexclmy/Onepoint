import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Shield } from "lucide-react";

export default function PorterPage() {
  return (
    <ActionPageTemplate
      actionType="porter"
      actionTitle="5 Forces de Porter"
      actionDescription="Analyse de la concurrence et des forces du marché (rivalité concurrentielle, pouvoir des fournisseurs/clients, menaces de substituts/nouveaux entrants)"
      actionIcon={<Shield className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "competitive-intelligence-expert", "strategy-expert"]}
      contextPlaceholder="Décrivez le marché, l'industrie et les acteurs pour analyser les forces concurrentielles..."
    />
  );
}
