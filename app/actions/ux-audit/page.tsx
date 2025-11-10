import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Eye } from "lucide-react";


export const dynamic = 'force-dynamic';
export default function UxAuditPage() {
  return (
    <ActionPageTemplate
      actionType="ux-audit"
      actionTitle="Audit UX"
      actionDescription="Évaluation complète de l'expérience utilisateur avec recommandations d'amélioration (ergonomie, accessibilité, usabilité)"
      actionIcon={<Eye className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "ux-expert", "product-expert"]}
      contextPlaceholder="Décrivez le produit ou site à auditer, les personas cibles et les problèmes UX observés..."
    />
  );
}
