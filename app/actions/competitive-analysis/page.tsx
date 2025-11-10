import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Users } from "lucide-react";

export default function CompetitiveAnalysisPage() {
  return (
    <ActionPageTemplate
      actionType="competitive-analysis"
      actionTitle="Analyse Concurrentielle"
      actionDescription="Étude approfondie des concurrents directs et indirects, leurs forces, faiblesses et positionnement"
      actionIcon={<Users className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "competitive-intelligence-expert", "market-research-expert"]}
      contextPlaceholder="Listez vos concurrents principaux et décrivez le contexte de marché pour l'analyse concurrentielle..."
    />
  );
}
