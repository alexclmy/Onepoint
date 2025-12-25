# Migrations Supabase

Ce dossier contient les migrations SQL pour la base de données Supabase.

## 📋 Fichiers de Migration

### `schema.sql`
Le schéma complet de la base de données incluant :
- Table `experts` avec les 24 experts prédéfinis
- Table `analyses` pour les analyses stratégiques
- Table `llm_configs` pour la configuration LLM
- Table `user_questions` pour les questions posées par les agents
- Table `company` pour le contexte entreprise
- **Table `veille_history`** pour l'historique des veilles stratégiques

### `migration-experts.sql`
Migration pour ajouter les experts prédéfinis à une base de données existante.

### `migration-veille.sql`
Migration pour ajouter la table `veille_history` à une base de données existante.

## 🚀 Comment Appliquer les Migrations

### Option 1 : Base de données vide (nouveau projet)
1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez le contenu de `schema.sql`
5. Cliquez sur **Run**

### Option 2 : Base de données existante (mise à jour)

#### Pour ajouter la table veille_history :
1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez le contenu de `migration-veille.sql`
6. Cliquez sur **Run**

#### Pour ajouter les experts prédéfinis :
1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez le contenu de `migration-experts.sql`
6. Cliquez sur **Run**

## ✅ Vérification

Pour vérifier que les migrations ont été appliquées correctement :

```sql
-- Vérifier que la table veille_history existe
SELECT * FROM veille_history LIMIT 1;

-- Vérifier les experts prédéfinis
SELECT COUNT(*) FROM experts WHERE is_predefined = true;
-- Devrait retourner 24

-- Vérifier les indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('veille_history', 'experts', 'analyses');
```

## 🐛 Dépannage

### Erreur : "relation veille_history does not exist"
➡️ Vous devez appliquer la migration `migration-veille.sql`

### Erreur : "column company_id does not exist"
➡️ Vérifiez que vous utilisez bien le bon schéma SQL

### Les veilles ne s'affichent pas dans Historique
1. Vérifiez que la table existe : `SELECT * FROM veille_history;`
2. Vérifiez les logs de l'API : Console du navigateur → Network → `/api/veilles`
3. Vérifiez les permissions Supabase (RLS policies)

## 📚 Structure de la Table veille_history

```sql
CREATE TABLE veille_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  parameters JSONB NOT NULL,
  keywords JSONB NOT NULL,
  company_id UUID REFERENCES company(id) ON DELETE SET NULL,
  sub_queries JSONB NOT NULL,
  results JSONB NOT NULL,
  final_report TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS)

Si RLS est activé sur votre projet Supabase, vous devez ajouter des policies :

```sql
-- Policy pour lire les veilles (exemple)
CREATE POLICY "Allow read access to veilles"
ON veille_history FOR SELECT
USING (true);

-- Policy pour créer des veilles (exemple)
CREATE POLICY "Allow insert access to veilles"
ON veille_history FOR INSERT
WITH CHECK (true);

-- Policy pour supprimer des veilles (exemple)
CREATE POLICY "Allow delete access to veilles"
ON veille_history FOR DELETE
USING (true);
```

**Note** : Adaptez ces policies selon vos besoins de sécurité.
