import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { AlertTriangle } from "lucide-react";


export const dynamic = 'force-dynamic';
export default function RiskAssessmentPage() {
  return (
    <ActionPageTemplate
      actionType="risk-assessment"
      actionTitle="Évaluation des Risques"
      actionDescription="Identification, analyse et priorisation des risques projet/business avec plans de mitigation"
      actionIcon={<AlertTriangle className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "risk-management-expert", "strategy-expert"]}
      contextPlaceholder="Décrivez le projet, l'initiative ou la situation pour identifier et évaluer les risques..."
    />
  );
}
