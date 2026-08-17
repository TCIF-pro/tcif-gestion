# TCIF CRM

App interne de suivi clients (Clients, Suivi de projet, Abonnements, Devis & Factures, Tableau de bord).
React + Vite, base de données Supabase, déploiement Vercel.

## 1. Configurer Supabase

### 1.1 Créer les tables

1. Va sur [supabase.com](https://supabase.com) → ton projet (ex. `tcif-crm`).
2. Dans le menu de gauche, ouvre **SQL Editor** → **New query**.
3. Ouvre le fichier [`supabase/schema.sql`](supabase/schema.sql) de ce projet, copie tout son contenu, colle-le dans l'éditeur SQL de Supabase, puis clique **Run**.
4. Ça crée les 4 tables, active la sécurité (RLS), et insère les 2 clients de départ (Jérôme Cotard, Françoise).

### 1.2 Créer ton compte de connexion

1. Toujours dans Supabase, va dans **Authentication** → **Users** → **Add user** → **Create new user**.
2. Renseigne ton email et un mot de passe. Coche **Auto Confirm User** pour ne pas avoir besoin de valider par email.
3. C'est ce compte que tu utiliseras pour te connecter à l'app.

### 1.3 Récupérer l'URL et la clé API

1. Dans Supabase : **Project Settings** (icône en bas à gauche) → **API**.
2. Note deux valeurs :
   - **Project URL**
   - **anon public** (clé API publique)

## 2. Connecter l'app à ton projet Supabase

À la racine du projet, il y a un fichier `.env.example`. Fais-en une copie nommée `.env` :

```bash
cp .env.example .env
```

Ouvre `.env` et remplace les valeurs par celles récupérées à l'étape 1.3 :

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Le fichier `.env` n'est jamais envoyé sur GitHub (il est dans `.gitignore`) : tes clés restent privées.

## 3. Lancer l'app en local (optionnel, pour tester)

```bash
npm install
npm run dev
```

Ouvre l'adresse affichée (en général `http://localhost:5173`), connecte-toi avec l'email/mot de passe créés à l'étape 1.2.

## 4. Déployer sur Vercel

1. Mets ce projet sur GitHub (crée un nouveau repo, `git init` puis `git add . && git commit -m "Initial commit"`, push).
2. Va sur [vercel.com](https://vercel.com) → connecte-toi avec GitHub → **Add New** → **Project**.
3. Sélectionne le repo GitHub de l'app. Vercel détecte automatiquement Vite (build command `vite build`, output `dist`) — pas besoin de changer les réglages.
4. Avant de cliquer **Deploy**, ouvre la section **Environment Variables** et ajoute les deux mêmes variables que dans ton `.env` :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique **Deploy**. Après une minute, Vercel te donne une URL (ex. `tcif-crm.vercel.app`) — c'est ton app, accessible depuis ton ordinateur et ton téléphone.
6. Astuce mobile : ouvre cette URL sur ton téléphone puis "Ajouter à l'écran d'accueil" pour l'utiliser comme une app.

### Mettre à jour l'app plus tard

Chaque fois que tu pousses un changement sur la branche principale de GitHub, Vercel redéploie automatiquement.

## Structure du projet

```
src/
  pages/          # Les 5 écrans (Dashboard, Clients, Suivi, Abonnements, DevisFactures)
  components/      # Nav (barre de navigation), ProtectedRoute (protège l'accès)
  context/          # AuthContext (gestion de la connexion Supabase)
  supabaseClient.js # Connexion à Supabase (lit .env)
supabase/
  schema.sql        # Schéma des tables + sécurité + données de départ
```
