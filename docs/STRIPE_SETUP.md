# Guide de Configuration Stripe

Ce guide vous explique comment configurer Stripe pour votre boutique e-commerce.

## 📋 Prérequis

1. Un compte Stripe (gratuit) : [https://stripe.com](https://stripe.com)
2. Votre application Next.js en cours d'exécution

## 🔑 Étape 1 : Obtenir la Clé Secrète Stripe

### En Mode Test (Développement)

1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Assurez-vous d'être en **mode Test** (bascule en haut à droite)
3. Allez dans **Developers → API keys**
4. Copiez la **Secret key** (commence par `sk_test_...`)

### En Mode Production

1. Basculez en **mode Live** dans le dashboard
2. Allez dans **Developers → API keys**
3. Copiez la **Secret key** (commence par `sk_live_...`)

⚠️ **Important** : Ne partagez jamais votre clé secrète et ne la commitez pas dans Git !

## 🔔 Étape 2 : Configurer les Webhooks

Les webhooks permettent à Stripe de notifier votre application quand un paiement est complété.

### Option A : Développement Local (Recommandé pour tester)

#### 1. Installer Stripe CLI

**macOS (avec Homebrew) :**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux/Windows :**
Téléchargez depuis [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

#### 2. Se connecter à Stripe CLI

```bash
stripe login
```

Cela ouvrira votre navigateur pour vous authentifier.

#### 3. Démarrer le forwarding des webhooks

Dans un terminal séparé, lancez :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Vous verrez quelque chose comme :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

#### 4. Copier le Webhook Secret

Copiez la valeur `whsec_xxxxxxxxxxxxx` qui s'affiche. C'est votre **STRIPE_WEBHOOK_SECRET** pour le développement local.

### Option B : Production (Quand votre site est en ligne)

#### 1. Créer un endpoint webhook dans Stripe

1. Allez dans **Developers → Webhooks** dans votre dashboard Stripe
2. Cliquez sur **"Add endpoint"**
3. Entrez l'URL de votre endpoint :
   ```
   https://votre-domaine.com/api/stripe/webhook
   ```
4. Sélectionnez les événements à écouter :
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
5. Cliquez sur **"Add endpoint"**

#### 2. Récupérer le Webhook Signing Secret

1. Cliquez sur l'endpoint que vous venez de créer
2. Dans la section **"Signing secret"**, cliquez sur **"Reveal"**
3. Copiez la valeur (commence par `whsec_...` ou `whsec_live_...`)

C'est votre **STRIPE_WEBHOOK_SECRET** pour la production.

## ⚙️ Étape 3 : Configurer les Variables d'Environnement

Créez ou modifiez votre fichier `.env` à la racine du projet :

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici

# Pour la production, utilisez :
# STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_ici
# STRIPE_WEBHOOK_SECRET=whsec_live_votre_webhook_secret_ici
```

⚠️ **Important** : 
- Ne commitez jamais votre fichier `.env` (il est déjà dans `.gitignore`)
- Utilisez des clés différentes pour le développement et la production
- En production, configurez ces variables dans votre plateforme d'hébergement (Vercel, Netlify, etc.)

## 🧪 Étape 4 : Tester la Configuration

### 1. Démarrer votre serveur de développement

```bash
bun dev
```

### 2. Tester un paiement

1. Allez sur votre site : `http://localhost:3000`
2. Ajoutez un produit au panier
3. Cliquez sur "Commander"
4. Utilisez une carte de test Stripe :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date d'expiration** : n'importe quelle date future (ex: `12/34`)
   - **CVC** : n'importe quel 3 chiffres (ex: `123`)
   - **Code postal** : n'importe quel code postal (ex: `12345`)

### 3. Vérifier les webhooks

Dans le terminal où `stripe listen` est en cours d'exécution, vous devriez voir les événements webhook arriver.

## 📝 Événements Webhook Utilisés

Votre application écoute ces événements Stripe :

1. **`checkout.session.completed`** : Quand un client complète le checkout
   - Crée une commande dans Supabase
   - Crée les items de commande
   - Vide le panier

2. **`payment_intent.succeeded`** : Quand le paiement est confirmé
   - Met à jour le statut de la commande à "completed"

## 🔒 Sécurité

- ✅ Les webhooks sont vérifiés avec la signature Stripe
- ✅ Seuls les événements signés par Stripe sont acceptés
- ✅ Les clés secrètes ne sont jamais exposées côté client

## 🚀 Déploiement en Production

### Sur Vercel

1. Allez dans **Settings → Environment Variables**
2. Ajoutez :
   - `STRIPE_SECRET_KEY` = votre clé live
   - `STRIPE_WEBHOOK_SECRET` = votre webhook secret live
   - `NEXT_PUBLIC_ROOT_URL` = votre URL de production

### Sur Netlify

1. Allez dans **Site settings → Environment variables**
2. Ajoutez les mêmes variables

### Mettre à jour l'endpoint webhook Stripe

1. Dans Stripe Dashboard → Webhooks
2. Modifiez votre endpoint pour pointer vers votre URL de production
3. Copiez le nouveau webhook secret si nécessaire

## 🐛 Dépannage

### Le webhook ne fonctionne pas en local

- Vérifiez que `stripe listen` est en cours d'exécution
- Vérifiez que votre serveur Next.js tourne sur le port 3000
- Vérifiez que `STRIPE_WEBHOOK_SECRET` dans `.env` correspond à celui affiché par `stripe listen`

### Erreur "Invalid signature"

- Vérifiez que vous utilisez le bon webhook secret
- En local, utilisez celui de `stripe listen`
- En production, utilisez celui de votre endpoint webhook Stripe

### Les commandes ne sont pas créées

- Vérifiez les logs de votre serveur
- Vérifiez les logs dans Stripe Dashboard → Webhooks → [Votre endpoint] → Attempts
- Assurez-vous que Supabase est correctement configuré

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Cartes de test Stripe](https://stripe.com/docs/testing)

