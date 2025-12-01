# Checklist pour passer en production avec atelierlola.fr

## ✅ Actions URGENTES à faire

### 1. **Vercel - Configuration du domaine**

1. Allez dans votre projet Vercel → Settings → Domains
2. Ajoutez `atelierlola.fr` et `www.atelierlola.fr` (si vous voulez gérer les deux)
3. Suivez les instructions pour configurer les DNS (généralement un CNAME vers Vercel)
4. Vérifiez que le domaine est actif et que le certificat SSL est généré

### 2. **Vercel - Variables d'environnement**

Dans Vercel Dashboard → Settings → Environment Variables, mettez à jour :

```
NEXT_PUBLIC_ROOT_URL=https://atelierlola.fr
```

⚠️ **IMPORTANT** : Utilisez `https://` (pas `http://`)

### 3. **Stripe - Webhook en mode LIVE**

1. Allez dans Stripe Dashboard → Developers → Webhooks
2. **Passez en mode LIVE** (pas test) en haut à droite
3. Créez un nouveau webhook endpoint :
   - **URL** : `https://atelierlola.fr/api/stripe/webhook`
   - **Événements à écouter** :
     - `checkout.session.completed`
     - `payment_intent.succeeded`
4. Copiez le **Webhook signing secret** (commence par `whsec_`)
5. Ajoutez-le dans Vercel comme variable d'environnement :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
   ```

### 4. **Stripe - Clés API en mode LIVE**

1. Dans Stripe Dashboard → Developers → API keys
2. **Passez en mode LIVE** (pas test)
3. Copiez la **Secret key** (commence par `sk_live_`)
4. Ajoutez-la dans Vercel comme variable d'environnement :
   ```
   STRIPE_SECRET_KEY=sk_live_votre_cle_ici
   ```

⚠️ **ATTENTION** : Ne mélangez pas les clés test et live !

### 5. **Supabase - Pas de changement nécessaire**

Supabase n'a pas besoin de configuration spécifique pour un changement de domaine. Les URLs Supabase restent les mêmes.

### 6. **Redéployer sur Vercel**

Après avoir mis à jour toutes les variables d'environnement :
1. Allez dans Vercel → Deployments
2. Cliquez sur "Redeploy" sur le dernier déploiement
3. Ou faites un commit/push pour déclencher un nouveau déploiement

## ✅ Vérifications après déploiement

### 1. Testez le site
- [ ] Visitez `https://atelierlola.fr` - le site doit se charger
- [ ] Vérifiez que les images se chargent correctement
- [ ] Testez la navigation entre les pages

### 2. Testez Stripe (en mode LIVE)
- [ ] Ajoutez un produit au panier
- [ ] Cliquez sur "Commander"
- [ ] Utilisez une carte de test Stripe (ex: `4242 4242 4242 4242`)
- [ ] Vérifiez que vous êtes redirigé vers la page de succès
- [ ] Vérifiez dans Stripe Dashboard → Payments que la commande apparaît
- [ ] Vérifiez dans Supabase que l'ordre est créé dans la table `orders`

### 3. Testez le webhook
- [ ] Allez dans Stripe Dashboard → Developers → Webhooks
- [ ] Cliquez sur votre webhook
- [ ] Vérifiez que les événements sont reçus (colonne "Recent deliveries")
- [ ] Si des erreurs apparaissent, vérifiez les logs Vercel

### 4. Vérifiez les métadonnées
- [ ] Testez le partage sur Facebook/Twitter (les images Open Graph doivent s'afficher)
- [ ] Utilisez [opengraph.xyz](https://www.opengraph.xyz/) pour vérifier

## 🔒 Sécurité

- [ ] Vérifiez que `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` sont bien en mode LIVE
- [ ] Vérifiez que les variables d'environnement ne sont pas exposées dans le code client
- [ ] Activez le HTTPS uniquement dans Vercel (Settings → Security)

## 📝 Notes importantes

- **Ne mélangez jamais les clés test et live** : cela peut causer des problèmes de paiement
- **Le webhook doit être en HTTPS** : Stripe n'accepte pas les webhooks en HTTP
- **Les URLs de retour Stripe** sont automatiquement détectées depuis l'en-tête `Origin` de la requête, donc pas besoin de les changer dans le code
- **Les métadonnées Open Graph** utilisent `NEXT_PUBLIC_ROOT_URL`, donc mettez-le à jour

## 🆘 En cas de problème

1. **Webhook non reçu** :
   - Vérifiez que l'URL est correcte dans Stripe
   - Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct dans Vercel
   - Vérifiez les logs Vercel pour les erreurs

2. **Paiements qui ne fonctionnent pas** :
   - Vérifiez que vous utilisez les clés LIVE (pas test)
   - Vérifiez que le domaine est bien configuré dans Vercel
   - Testez avec une carte de test Stripe

3. **Images qui ne se chargent pas** :
   - Vérifiez que les URLs Supabase sont correctes
   - Vérifiez que le bucket Supabase est public
   - Vérifiez `next.config.mjs` pour les domaines autorisés


