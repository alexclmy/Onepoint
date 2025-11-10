import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Layers } from "lucide-react";


export const dynamic = 'force-dynamic';
export default function BusinessModelCanvasPage() {
  return (
    <ActionPageTemplate
      actionType="business-model-canvas"
      actionTitle="Business Model Canvas"
      actionDescription="Modélisation complète du modèle économique (9 blocs : segments clients, proposition de valeur, canaux, relation client, revenus, ressources, activités, partenaires, coûts)"
      actionIcon={<Layers className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "business-model-expert", "strategy-expert"]}
      contextPlaceholder="Décrivez votre business, votre offre, vos clients et votre modèle économique pour construire le Business Model Canvas..."
    />
  );
}
