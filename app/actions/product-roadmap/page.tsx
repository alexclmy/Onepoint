import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Map } from "lucide-react";


export const dynamic = 'force-dynamic';
export default function ProductRoadmapPage() {
  return (
    <ActionPageTemplate
      actionType="product-roadmap"
      actionTitle="Product Roadmap"
      actionDescription="Planification stratégique de l'évolution du produit sur 6-18 mois avec priorisation des features"
      actionIcon={<Map className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "product-expert", "strategy-expert"]}
      contextPlaceholder="Décrivez votre produit actuel, la vision, les objectifs business et les contraintes pour construire la roadmap..."
    />
  );
}
