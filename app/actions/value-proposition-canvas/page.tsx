import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Gem } from "lucide-react";

export default function ValuePropositionCanvasPage() {
  return (
    <ActionPageTemplate
      actionType="value-proposition-canvas"
      actionTitle="Value Proposition Canvas"
      actionDescription="Alignement entre la proposition de valeur et les besoins clients (jobs, pains, gains)"
      actionIcon={<Gem className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "product-expert", "ux-expert", "marketing-expert"]}
      contextPlaceholder="Décrivez vos clients cibles, leurs besoins, douleurs et aspirations, ainsi que votre offre..."
    />
  );
}
