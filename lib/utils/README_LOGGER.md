# Système de Logging Centralisé

## Vue d'ensemble

Le projet utilise un système de logging centralisé pour remplacer les appels directs à `console.log`, `console.warn`, et `console.error`.

## Avantages

1. **Contrôle centralisé** : Activer/désactiver les logs de debug depuis un seul endroit
2. **Environnement-aware** : Les logs de debug ne s'affichent qu'en développement
3. **Meilleure lisibilité** : Emojis et structure cohérente
4. **Performance** : Les logs de debug sont complètement ignorés en production

## Utilisation

### Import du logger

```typescript
import { logger } from '@/lib/utils/logger';

// Ou pour un module spécifique
import { createModuleLogger } from '@/lib/utils/logger';
const log = createModuleLogger('MonModule');
```

### Niveaux de log

```typescript
// Debug - Seulement en développement ou si DEBUG=true
logger.debug('Message de debug', { data: value });
log.debug('Détails techniques', { count: 42 });

// Info - Informations générales
logger.info('Opération réussie', { userId: '123' });
log.info('Analyse démarrée', { actionCount: 3 });

// Warning - Avertissements
logger.warn('Attention : ressource limitée', { remaining: 5 });
log.warn('Configuration manquante, utilisation des valeurs par défaut');

// Error - Erreurs critiques
logger.error('Erreur lors de la sauvegarde', error, { itemId: '456' });
log.error('Échec de la connexion API', error);
```

### Groupement de logs (debug seulement)

```typescript
logger.group('Traitement batch');
// ... plusieurs logs ...
logger.groupEnd();
```

## Configuration

### Variables d'environnement

```bash
# Activer les logs de debug en production (déconseillé)
DEBUG=true

# En développement, les logs de debug sont toujours activés
NODE_ENV=development
```

### Logger par module

Pour avoir le nom du module dans tous les logs :

```typescript
// En haut du fichier
const log = createModuleLogger('HybridOrchestrator');

// Utilisation
log.debug('Starting analysis', { expertCount: 3 });
// Output: 🔍 Starting analysis { module: 'HybridOrchestrator', expertCount: 3 }
```

## Migration depuis console.log

### Avant

```typescript
console.log('🚀 Starting analysis...', { count: 3 });
console.warn('⚠️ Config missing');
console.error('❌ Failed:', error);
```

### Après

```typescript
const log = createModuleLogger('MyModule');

log.debug('Starting analysis', { count: 3 });
log.warn('Config missing');
log.error('Operation failed', error);
```

## Best Practices

1. **Utiliser le bon niveau** :
   - `debug` : Détails techniques pour le développement
   - `info` : Événements importants de l'application
   - `warn` : Situations anormales mais récupérables
   - `error` : Erreurs critiques nécessitant attention

2. **Fournir du contexte** :
   ```typescript
   // ❌ Mauvais
   log.error('Failed');

   // ✅ Bon
   log.error('Failed to save analysis', error, { analysisId, userId });
   ```

3. **Éviter les logs excessifs** :
   - Ne pas logger chaque ligne de code
   - Logger les points clés du workflow
   - Utiliser `debug` pour les détails, `info` pour les jalons

4. **Sécurité** :
   - Ne jamais logger de données sensibles (mots de passe, tokens, etc.)
   - Sanitiser les données utilisateur avant de les logger

## Fichiers refactorisés

Les fichiers suivants utilisent désormais le système de logging centralisé :

- ✅ `lib/utils/logger.ts` (système de logging lui-même)
- ✅ `lib/agents/hybrid-orchestrator.ts`
- ✅ `lib/agents/responses-agent.ts`
- ✅ `lib/openai/responses-client.ts`
- ✅ `app/api/analyze/route.ts`
- ✅ `app/api/oneveille/execute-veille/route.ts`
- ✅ `app/page.tsx`
- ✅ `components/analysis/timeline.tsx`

## Fichiers restants

Certains fichiers conservent `console.log` car :
- Scripts de développement (`scripts/test-connection.js`)
- Fichiers de configuration legacy
- Composants UI simples où le logger ajouterait de la complexité inutile

Ces fichiers pourront être migrés progressivement au besoin.
