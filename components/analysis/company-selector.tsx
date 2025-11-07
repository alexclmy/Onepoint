"use client";

import { Company } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onChange: (companyId: string | null) => void;
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  onChange,
}: CompanySelectorProps) {
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Entreprise</CardTitle>
        </div>
        <CardDescription>
          Sélectionnez l'entreprise concernée par cette analyse (optionnel)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedCompanyId || "none"}
          onValueChange={(value) => onChange(value === "none" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aucune entreprise sélectionnée" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune entreprise</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    • {company.industry}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCompany && (
          <div className="mt-3 rounded-lg border p-3">
            <h4 className="font-medium">{selectedCompany.name}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedCompany.industry}
            </p>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {selectedCompany.description}
            </p>
            {selectedCompany.glossary.length > 0 && (
              <p className="mt-2 text-xs text-primary">
                📚 {selectedCompany.glossary.length} terme
                {selectedCompany.glossary.length > 1 ? "s" : ""} dans le glossaire
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
