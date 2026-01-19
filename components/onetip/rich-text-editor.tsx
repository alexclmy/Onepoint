"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  ImageIcon,
  CodeSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Commencez à écrire...",
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto my-4",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[300px] focus:outline-none p-4 border rounded-md",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setLinkDialogOpen(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setImageDialogOpen(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      editor.chain().focus().setImage({ src: data.url }).run();
      setImageDialogOpen(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        {/* Text Formatting */}
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Barré"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("code") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Code inline"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Titre 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citation"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("codeBlock") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloc de code"
        >
          <CodeSquare className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Insert */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setLinkDialogOpen(true)}
          title="Ajouter un lien"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setImageDialogOpen(true)}
          title="Ajouter une image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lien</DialogTitle>
            <DialogDescription>
              Sélectionnez du texte et ajoutez un lien
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemple.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={addLink}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une image</DialogTitle>
            <DialogDescription>
              Uploadez une image ou collez une URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-file">Upload une image</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
              />
              {isUploadingImage && (
                <p className="text-sm text-muted-foreground">
                  Upload en cours...
                </p>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-url">URL de l'image</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={addImage} disabled={!imageUrl}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
