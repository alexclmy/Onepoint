# Configuration Supabase Storage pour OneTip

## Créer le bucket "images"

Pour permettre l'upload d'images dans OneTip, vous devez créer un bucket de stockage dans Supabase.

### Étapes via l'interface Supabase

1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Storage** (menu latéral)
4. Cliquez sur **New bucket**
5. Configurez le bucket :
   - **Name**: `images`
   - **Public bucket**: ✅ Coché (pour permettre l'accès public aux images)
   - **File size limit**: 5MB (ou selon vos besoins)
   - **Allowed MIME types**: Laisser vide pour accepter tous les types d'images
6. Cliquez sur **Create bucket**

### Étapes via SQL

Vous pouvez aussi créer le bucket via SQL :

```sql
-- Créer le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Configurer les policies pour permettre l'upload et la lecture
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');
```

## Structure du bucket

Les images uploadées seront stockées avec la structure suivante :

```
images/
└── onetip/
    ├── 1704096000000-abc123.jpg
    ├── 1704096001000-def456.png
    └── ...
```

## Taille maximale des fichiers

L'API d'upload limite la taille des fichiers à **5MB** par défaut. Vous pouvez modifier cette limite dans `/app/api/upload/route.ts` :

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

## Types de fichiers acceptés

Seules les images sont acceptées :
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG
- etc.

La validation se fait au niveau du MIME type (`image/*`).

## URLs des images

Une fois uploadée, chaque image obtient une URL publique du format :

```
https://[votre-projet].supabase.co/storage/v1/object/public/images/onetip/[nom-fichier]
```

Cette URL est automatiquement insérée dans l'éditeur ou utilisée comme image de couverture du tip.

## Sécurité

⚠️ **Important** : Le bucket est configuré en mode public pour permettre l'affichage des images sans authentification. Si vous souhaitez restreindre l'accès, vous devrez :

1. Désactiver le mode public du bucket
2. Mettre à jour les policies RLS
3. Utiliser des URLs signées pour accéder aux images

## Nettoyage

Pour supprimer les images inutilisées, vous pouvez utiliser le Supabase Dashboard ou créer une fonction SQL :

```sql
-- Supprimer toutes les images dans le dossier onetip
DELETE FROM storage.objects
WHERE bucket_id = 'images' AND name LIKE 'onetip/%';
```

⚠️ Attention : Cette opération est irréversible. Assurez-vous de ne pas supprimer des images encore utilisées dans des tips.
