-- OneTip table for storing tips and tools for consultants
CREATE TABLE IF NOT EXISTS onetip (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onetip_created_at ON onetip(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onetip_category ON onetip(category);
CREATE INDEX IF NOT EXISTS idx_onetip_upvotes ON onetip(upvotes DESC);

-- Insert initial tip about using LLM for HTML email templates
INSERT INTO onetip (
  title,
  description,
  content,
  category
) VALUES (
  'Générer des emails HTML professionnels avec un LLM',
  'Apprenez à utiliser un LLM pour créer des templates d''emails HTML propres et professionnels aux couleurs de votre client.',
  E'# Utilisation d''un LLM pour créer des emails HTML professionnels

## Informations générales

Les LLM (Large Language Models) comme ChatGPT, Claude, ou Gemini sont capables de générer du code HTML propre et structuré. Cette technique est particulièrement utile pour créer rapidement des emails professionnels avec un design personnalisé.

## Ce qu''il est possible de faire

Avec un LLM, vous pouvez générer des emails HTML qui incluent :

- **Design personnalisé** : Utilisation des couleurs et de la charte graphique de votre client
- **Mise en page professionnelle** : Structure claire avec header, body, footer
- **Éléments visuels** : Images, logos, icônes
- **Call-to-Actions (CTA)** : Boutons cliquables avec styling personnalisé
- **Responsive design** : Templates qui s''adaptent aux différents appareils
- **Tableaux et listes** : Pour organiser l''information de manière claire

## Comment faire

### 1. Préparer les informations

Avant de solliciter le LLM, rassemblez :
- Le contenu textuel de votre email
- Les codes couleurs de votre client (ex: #009DDF pour le bleu Onepoint)
- Les URLs des images/logos à inclure
- Le texte et l''URL des boutons CTA

### 2. Formuler votre demande au LLM

Voici un exemple de prompt efficace :

```
Génère un email HTML professionnel avec les caractéristiques suivantes :

- Couleur principale : #009DDF (bleu)
- Couleur secondaire : #F5F5F5 (gris clair)
- Header avec logo (URL : https://exemple.com/logo.png)
- Titre : "Nouvelle fonctionnalité disponible"
- Paragraphe d''introduction expliquant la nouvelle fonctionnalité
- Section avec 3 points clés (avec icônes)
- Bouton CTA "Découvrir maintenant" qui pointe vers https://exemple.com/feature
- Footer avec informations de contact et liens réseaux sociaux

Le design doit être moderne, épuré et responsive.
```

### 3. Affiner le résultat

N''hésitez pas à demander des modifications :
- "Ajoute plus d''espacement entre les sections"
- "Rends le bouton CTA plus visible"
- "Change la police pour une police plus moderne"
- "Ajoute une bordure subtile autour des sections"

### 4. Tester l''email

Une fois le code HTML généré :
1. Copiez le code dans un fichier .html
2. Testez-le dans votre client email
3. Vérifiez le rendu sur mobile et desktop
4. Utilisez des outils comme Litmus ou Email on Acid pour tester la compatibilité

## Conseils supplémentaires

- **Soyez précis** : Plus vous donnez de détails au LLM, meilleur sera le résultat
- **Itérez** : N''hésitez pas à demander plusieurs versions
- **Validez la compatibilité** : Certains clients emails ne supportent pas toutes les fonctionnalités CSS
- **Optimisez les images** : Utilisez des URLs d''images hébergées et optimisées
- **Respectez le RGPD** : Incluez les mentions légales nécessaires dans le footer

## Exemple de résultat

Le LLM peut générer un email comme celui-ci :

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Professionnel</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white;">
          <!-- Header -->
          <tr>
            <td style="background-color: #009DDF; padding: 30px; text-align: center;">
              <img src="logo.png" alt="Logo" width="150">
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="color: #009DDF; margin: 0 0 20px 0;">Nouvelle fonctionnalité</h1>
              <p style="color: #333; line-height: 1.6;">Votre contenu ici...</p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #009DDF; padding: 15px 40px; border-radius: 5px;">
                    <a href="https://exemple.com" style="color: white; text-decoration: none; font-weight: bold;">
                      Découvrir maintenant
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 30px; text-align: center; color: #666;">
              <p>© 2024 Votre Entreprise</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

Cette approche vous permet de créer des communications professionnelles et personnalisées en quelques minutes !',
  'llm'
);
