import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { LayoutGrid } from "lucide-react";

export default function BcgPage() {
  return (
    <ActionPageTemplate
      actionType="bcg"
      actionTitle="Matrice BCG"
      actionDescription="Positionnement stratégique du portefeuille de produits/activités (Stars, Cash Cows, Question Marks, Dogs)"
      actionIcon={<LayoutGrid className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "strategy-expert", "product-expert"]}
      contextPlaceholder="Listez les produits ou activités à positionner dans la matrice BCG avec leurs parts de marché et croissance..."
    />
  );
}
