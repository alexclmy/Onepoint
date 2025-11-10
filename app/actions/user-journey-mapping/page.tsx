import { ActionPageTemplate } from "@/components/actions/action-page-template";
import { Route } from "lucide-react";

export default function UserJourneyMappingPage() {
  return (
    <ActionPageTemplate
      actionType="user-journey-mapping"
      actionTitle="User Journey Mapping"
      actionDescription="Cartographie du parcours utilisateur avec identification des points de contact, émotions et opportunités d'amélioration"
      actionIcon={<Route className="h-8 w-8 text-primary" />}
      suggestedExperts={["super-consultant-onepoint", "ux-expert", "customer-success-expert"]}
      contextPlaceholder="Décrivez le parcours utilisateur à analyser, les personas concernés et les objectifs utilisateurs..."
    />
  );
}
