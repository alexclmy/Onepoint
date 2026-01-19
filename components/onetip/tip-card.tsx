"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ExternalLink, ArrowRight, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OneTip } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TipEditForm } from "./tip-edit-form";
import { useToast } from "@/hooks/use-toast";

interface TipCardProps {
  tip: OneTip;
  onUpvote?: (id: string) => Promise<void>;
  onEdit?: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const categoryColors: Record<string, string> = {
  llm: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  tools: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  process: "bg-green-500/10 text-green-500 border-green-500/20",
  communication: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  analysis: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  general: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const categoryLabels: Record<string, string> = {
  llm: "LLM",
  tools: "Outils",
  process: "Processus",
  communication: "Communication",
  analysis: "Analyse",
  general: "Général",
};

export function TipCard({ tip, onUpvote, onEdit, onDelete }: TipCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [upvotes, setUpvotes] = useState(tip.upvotes);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpvoting || !onUpvote) return;

    setIsUpvoting(true);
    try {
      await onUpvote(tip.id);
      setUpvotes((prev) => prev + 1);
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/onetip/${tip.id}`);
  };

  const handleEdit = async (data: any) => {
    if (!onEdit) return;
    await onEdit(tip.id, data);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(tip.id);
      toast({
        title: "Succès",
        description: "Le tip a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tip",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group relative"
        onClick={handleCardClick}
      >
        {/* Menu dropdown en haut à droite */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {tip.imageUrl && (
          <div className="w-full h-48 overflow-hidden rounded-t-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tip.imageUrl}
              alt={tip.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors pr-8">
                {tip.title}
              </CardTitle>
            </div>
            <Badge className={categoryColors[tip.category] || categoryColors.general} variant="outline">
              {categoryLabels[tip.category] || tip.category}
            </Badge>
          </div>
          <CardDescription className="line-clamp-3">{tip.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              disabled={isUpvoting}
              className="hover:bg-primary/10"
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${isUpvoting ? "animate-pulse" : ""}`} />
              <span className="font-semibold">{upvotes}</span>
            </Button>
            {tip.linkUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(tip.linkUrl, "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" className="group-hover:text-primary">
            En savoir plus
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog d'édition */}
      <TipEditForm
        tip={tip}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEdit}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le tip "{tip.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
