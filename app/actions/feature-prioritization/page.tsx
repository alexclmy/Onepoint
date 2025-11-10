import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { ListOrdered } from "lucide-react";


export const dynamic = 'force-dynamic';
export default function FeaturePrioritizationPage() {
  return (
    <ActionPageTemplate
      actionType="feature-prioritization"
      actionTitle="Priorisation de Features"
      actionDescription="Priorisation des fonctionnalités selon la valeur business, l'effort et l'impact utilisateur (RICE, MoSCoW, Value vs Effort)"
      actionIcon={<ListOrdered className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "product-expert", "ux-expert"]}
      contextPlaceholder="Listez les features ou initiatives à prioriser avec leurs objectifs et contraintes..."
    />
  );
}
