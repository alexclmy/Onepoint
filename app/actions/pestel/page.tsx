import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Globe } from "lucide-react";


export const dynamic = 'force-dynamic';
export default function PestelPage() {
  return (
    <ActionPageTemplate
      actionType="pestel"
      actionTitle="Analyse PESTEL"
      actionDescription="Analyse de l'environnement macro-économique (Politique, Économique, Social, Technologique, Environnemental, Légal)"
      actionIcon={<Globe className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "strategy-expert", "market-research-expert"]}
      contextPlaceholder="Décrivez le contexte du marché, l'industrie et la géographie pour l'analyse PESTEL..."
    />
  );
}
