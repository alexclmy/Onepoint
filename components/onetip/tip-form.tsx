"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./rich-text-editor";

interface TipFormProps {
  onSubmit: (tip: {
    title: string;
    description: string;
    content: string;
    imageUrl?: string;
    linkUrl?: string;
    category: string;
  }) => Promise<void>;
}

const categories = [
  { value: "llm", label: "LLM" },
  { value: "tools", label: "Outils" },
  { value: "process", label: "Processus" },
  { value: "communication", label: "Communication" },
  { value: "analysis", label: "Analyse" },
  { value: "general", label: "Général" },
];

export function TipForm({ onSubmit }: TipFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    category: "general",
  });

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      toast({
        title: "Succès",
        description: "L'image a été uploadée avec succès",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        imageUrl: formData.imageUrl || undefined,
        linkUrl: formData.linkUrl || undefined,
        category: formData.category,
      });

      toast({
        title: "Succès",
        description: "Le tip a été ajouté avec succès",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        content: "",
        imageUrl: "",
        linkUrl: "",
        category: "general",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du tip",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Ajouter un nouveau tip
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau tip</DialogTitle>
          <DialogDescription>
            Partagez une astuce ou un outil utile avec vos collègues consultants.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Titre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Générer des emails HTML avec un LLM"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description courte <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Une brève description qui apparaîtra sur la card"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Catégorie <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Contenu détaillé <span className="text-destructive">*</span>
            </Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Commencez à écrire votre tip..."
            />
            <p className="text-xs text-muted-foreground">
              Utilisez les outils de formatage ci-dessus pour structurer votre contenu
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image de couverture (optionnel)</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://exemple.com/image.jpg"
                  className="flex-1"
                />
                <div className="relative">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploadingImage}
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {formData.imageUrl && (
                <div className="relative w-full h-32 rounded-md overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">Lien externe (optionnel)</Label>
            <Input
              id="linkUrl"
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="https://exemple.com"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter le tip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
