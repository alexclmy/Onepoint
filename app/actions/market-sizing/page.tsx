import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { PieChart } from "lucide-react";


export const dynamic = 'force-dynamic';
export default function MarketSizingPage() {
  return (
    <ActionPageTemplate
      actionType="market-sizing"
      actionTitle="Market Sizing (TAM/SAM/SOM)"
      actionDescription="Estimation de la taille du marché total adressable, disponible et capturé"
      actionIcon={<PieChart className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "market-research-expert", "strategy-expert", "data-expert"]}
      contextPlaceholder="Décrivez votre offre, votre marché cible, la géographie et les segments pour estimer le TAM/SAM/SOM..."
    />
  );
}
