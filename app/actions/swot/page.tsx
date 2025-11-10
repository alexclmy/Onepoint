import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Target } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function SwotPage() {
  return (
    <ActionPageTemplate
      actionType="swot"
      actionTitle="Analyse SWOT"
      actionDescription="Analyse des forces, faiblesses, opportunités et menaces"
      actionIcon={<Target className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "strategy-expert"]}
      contextPlaceholder="Décrivez l'entreprise, le projet ou la situation à analyser avec SWOT..."
    />
  );
}
