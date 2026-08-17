# Prompt Claude Code — App web de suivi clients TCIF

## Avant de lancer Claude Code

1. Crée un compte gratuit sur [supabase.com](https://supabase.com), crée un nouveau projet ("tcif-crm" par exemple). Une fois créé, récupère dans Project Settings → API : le **Project URL** et la clé **anon public**.
2. Crée un compte gratuit sur [vercel.com](https://vercel.com) (tu pourras t'y connecter avec GitHub).
3. Lance `claude` dans un nouveau dossier de projet vide.

## Prompt à copier dans Claude Code

---

### Contexte

Je suis TCIF, une auto-entreprise de développement web. Je veux une app web simple pour suivre mes clients, leurs abonnements et mes devis/factures. C'est un outil interne, juste pour moi (pas pour mes clients), accessible depuis mon ordinateur et mon téléphone.

### Stack demandée

- Application web simple (HTML/CSS/JS, ou React si tu penses que c'est plus simple à faire évoluer — à toi de choisir, mais reste léger, pas de complexité inutile)
- **Supabase** comme base de données (je te donnerai l'URL du projet et la clé API)
- Un **login simple** (email/mot de passe via Supabase Auth) pour protéger l'accès, un seul compte utilisateur (le mien)
- Déployable facilement sur **Vercel**

### Fonctionnalités

Quatre sections, avec une navigation simple entre elles :

1. **Clients** : liste des clients avec nom/raison sociale, contact (email/téléphone), activité, site (URL), statut (Prospect / Actif / En pause / Terminé), date de signature, notes. Ajout/modification/suppression.

2. **Suivi de projet** : pour chaque client, l'étape actuelle (Premier échange / Devis envoyé / Acompte reçu / En création / Livré / Abonnement actif), date de dernière action, prochaine action, notes.

3. **Abonnements** : client, montant mensuel, date de renouvellement du domaine, statut du prélèvement (À jour / En retard / Résilié), dernière facture envoyée.

4. **Devis & Factures** : client, type (Devis/Facture), numéro, date, montant, statut (Envoyé / Accepté / Payé / En attente).

5. **Tableau de bord** (page d'accueil de l'app) : quelques chiffres clés calculés automatiquement — nombre de clients actifs, revenu mensuel récurrent total, devis en attente, factures impayées.

### Design

Simple et propre, pas besoin de reprendre l'identité visuelle du site tcif-pro.fr — c'est un outil interne. Priorité à la clarté et à la facilité d'usage sur mobile (je veux pouvoir l'utiliser depuis mon téléphone).

### Données de départ

Deux clients réels à préremplir : Jérôme Cotard (magnétisme, massages énergétiques, jeromecotard.fr, statut Terminé) et Françoise (lithothérapie, numérologie, jais9.fr, statut Terminé, c'était une refonte de site existant).

### Étapes de travail

1. Propose-moi d'abord la structure des tables Supabase (schéma), je valide
2. Une fois validé, code l'app
3. Explique-moi comment connecter mon projet Supabase (où mettre l'URL et la clé) et comment déployer sur Vercel, étape par étape et simplement
