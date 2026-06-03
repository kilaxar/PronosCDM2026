# ⚽ Pronos Coupe du Monde 2026

Application de pronostics entre amis pour la Coupe du Monde 2026.  
**Technologie** : Single-page HTML — Vue 3 + Firebase. Aucun serveur requis.

---

## 🚀 Déploiement en 15 minutes (guide complet)

### Étape 1 — Créer un projet Firebase (gratuit)

1. Va sur **https://console.firebase.google.com**
2. Clique **"Ajouter un projet"**
3. Nom du projet : ex. `pronos-cdm2026`
4. Désactive Google Analytics si tu veux (pas nécessaire)
5. Clique **"Créer le projet"**

---

### Étape 2 — Activer l'Authentification

1. Dans ton projet Firebase, menu gauche → **Authentication**
2. Clique **"Commencer"**
3. Onglet **"Sign-in method"**
4. Active **"E-mail/Mot de passe"** → Activer → Enregistrer

---

### Étape 3 — Créer la base de données Firestore

1. Menu gauche → **Firestore Database**
2. Clique **"Créer une base de données"**
3. Choisis **"Mode production"** (on va configurer les règles juste après)
4. Sélectionne une région : `eur3 (Europe)` ou `europe-west1`
5. Clique **"Activer"**

---

### Étape 4 — Configurer les règles de sécurité Firestore

1. Dans Firestore → onglet **"Règles"**
2. Remplace tout le contenu par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    function isAuth() {
      return request.auth != null;
    }

    // Profils utilisateurs
    match /users/{userId} {
      allow read: if isAuth();
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
    }

    // Matchs (lecture pour tous, écriture admin uniquement)
    match /matches/{matchId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    // Pronostics
    match /predictions/{predId} {
      allow read: if isAuth();
      allow write: if isAuth() && request.auth.uid == request.resource.data.uid;
    }

    // Paramètres (barème)
    match /settings/{docId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }
  }
}
```

3. Clique **"Publier"**

---

### Étape 5 — Récupérer la config Firebase

1. Dans Firebase → ⚙️ **Paramètres du projet** → onglet **"Général"**
2. Descends jusqu'à **"Tes applications"** → clique **"</>  Web"**
3. Donne un nom (ex: `pronos-web`) et clique **"Enregistrer l'app"**
4. Copie le bloc `firebaseConfig` qui apparaît :

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pronos-cdm2026.firebaseapp.com",
  projectId: "pronos-cdm2026",
  storageBucket: "pronos-cdm2026.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

---

### Étape 6 — Configurer le fichier HTML

Ouvre `prono2026.html` dans un éditeur de texte (Notepad, TextEdit, VS Code…)

Trouve cette section en haut du fichier :

```js
const CONFIG = {
  firebase: {
    apiKey:            "VOTRE_API_KEY",
    authDomain:        "VOTRE_PROJECT.firebaseapp.com",
    projectId:         "VOTRE_PROJECT_ID",
    storageBucket:     "VOTRE_PROJECT.appspot.com",
    messagingSenderId: "VOTRE_SENDER_ID",
    appId:             "VOTRE_APP_ID"
  },
  adminCode: "ADMIN2026"   // ← Change ce code secret !
};
```

Remplace chaque valeur `VOTRE_...` par les vraies valeurs de ta config Firebase.

**Change aussi `adminCode`** par un code secret que tu connaîtras seul (ex: `"Marseille13OM!"`).

---

### Étape 7 — Déployer sur Netlify (hébergement gratuit)

**Option A — Glisser-déposer (le plus simple)** :
1. Va sur **https://app.netlify.com** → crée un compte gratuit (avec ton email ou GitHub)
2. Depuis le Dashboard, glisse le fichier `prono2026.html` dans la zone **"Drop your site here"**
3. Netlify te donne une URL du type : `https://random-name.netlify.app`
4. Optionnel : dans **"Site settings" → "Domain management"**, change le nom pour `pronos-cdm2026.netlify.app`

**Option B — Via GitHub (recommandé pour mises à jour faciles)** :
1. Crée un dépôt GitHub public ou privé
2. Upload `prono2026.html` dedans (renomme-le `index.html`)
3. Sur Netlify → "Add new site" → "Import an existing project" → GitHub
4. Netlify déploiera automatiquement à chaque modification

> ⚠️ **Important CORS** : Pour que l'API football-data.org fonctionne depuis ton domaine Netlify, enregistre ton URL sur https://www.football-data.org/client/register (gratuit). Ce n'est pas obligatoire pour la saisie manuelle des résultats.

---

### Étape 8 — Première connexion et initialisation

1. Ouvre l'URL Netlify sur ton téléphone
2. Clique **"Inscription"**
3. Saisis ton pseudo, email, mot de passe
4. Dans **"Code admin"**, saisis le code que tu as choisi (ex: `Marseille13OM!`)
5. Tu es maintenant admin !
6. Va dans l'onglet ⚙️ **Admin** → **Matchs**
7. Clique **"⬆️ Initialiser les matchs de groupe"** → les 72 matchs apparaissent
8. Partage l'URL à tes amis → ils s'inscrivent sans code admin

---

## 📱 Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| **Pronostic résultat** | Victoire dom. / Nul / Victoire ext. (indépendant du score) |
| **Pronostic score** | Score exact pour chaque équipe (indépendant du résultat) |
| **Verrouillage** | Les pronos se ferment automatiquement à l'heure du match |
| **Classement** | Mis à jour après chaque recalcul de points |
| **Voir les pronos** | Clique sur un match → pronos de tous les joueurs |
| **Résultats auto** | Via API football-data.org (token gratuit requis) |
| **Résultats manuels** | Saisie admin directe dans l'onglet Résultats |
| **Barème configurable** | Points par phase, modifiables par l'admin |

---

## 🏆 Système de points (défaut, modifiable)

| Phase | Score exact | Score partiel* | Résultat correct |
|---|---|---|---|
| Groupes | **5 pts** | 2 pts | 3 pts |
| Huitièmes | **7 pts** | 3 pts | 4 pts |
| Quarts | **9 pts** | 4 pts | 5 pts |
| Demi-finales | **11 pts** | 5 pts | 6 pts |
| 3ème Place | **8 pts** | 3 pts | 4 pts |
| Finale | **15 pts** | 7 pts | 8 pts |

> *Score partiel = un seul but correct (ex: prédit 2-0, réel 2-1 → 2 pts car but domicile correct)

**Les pronostics résultat et score sont 100% indépendants.**  
Ex: prédir "Victoire Brésil" + score "0-1" est autorisé et chaque prono est évalué séparément.

---

## 🔄 Mettre à jour les résultats

### Automatiquement (recommandé)
1. Crée un compte gratuit sur https://www.football-data.org
2. Copie ton token API (dans Mon compte)
3. Admin → Résultats → colle le token → "Récupérer les résultats via API"

### Manuellement
1. Admin → Résultats → "Saisie manuelle d'un résultat"
2. Sélectionne le match, saisis les buts dom. et ext.
3. Les points sont calculés automatiquement

### Ajouter les matchs éliminatoires
À mesure que le tournoi avance :
1. Admin → Matchs → "Ajouter un match éliminatoire"
2. Saisis les deux équipes qualifiées, la phase, le lieu, l'heure (CEST)

---

## 🔧 Dépannage

**L'app affiche une erreur Firebase au démarrage**  
→ Vérifie que les valeurs dans `CONFIG.firebase` correspondent exactement à ta config Firebase.

**Je ne peux pas m'inscrire**  
→ Vérifie que l'authentification Email/Mot de passe est activée dans Firebase Console.

**Les matchs n'apparaissent pas**  
→ Clique sur Admin → Initialiser les matchs de groupe.

**L'API résultats ne fonctionne pas**  
→ Enregistre ton domaine Netlify sur football-data.org. Ou utilise la saisie manuelle.

**Quelqu'un a modifié les pronos d'un autre**  
→ Vérifie que les règles Firestore sont bien configurées (Étape 4).

---

## 💡 Astuces

- **Ajoute l'app à ton écran d'accueil** : Safari/Chrome → Partager → "Sur l'écran d'accueil"
- **Partage le lien Netlify** à tous tes amis via WhatsApp ou SMS
- **Recalcul des points** : si tu modifies le barème en cours de route, utilise "Recalculer tous les points" pour tout remettre à jour
- Le **code admin** n'est jamais stocké dans Firebase — il est uniquement dans le fichier HTML. Garde-le secret !

---

*Application construite avec Vue 3, Firebase, Tailwind CSS.*  
*Données des matchs : FIFA World Cup 2026 — Schedule officiel.*
