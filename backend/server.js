require('dotenv').config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    intelligentSearch,
    findMatches,
    getSuggestions,
    getStatistics
} = require("./intelligent-search");

const app = express();

// Configuration CORS pour production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'https://smartsearch-frontend.onrender.com']
        : '*',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "votre-secret-jwt-changez-moi";
const ADMIN_CODE = process.env.ADMIN_CODE || "ADMIN2026";
const SALT_ROUNDS = 10;

const USERS_FILE = "./users.json";
const DOCUMENTS_FILE = "./documents.json";

/**
 * Initialisation des fichiers JSON s'ils n'existent pas
 */
function initFiles() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(DOCUMENTS_FILE)) {
        fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify([], null, 2));
    }
}

/**
 * Lecture sécurisée des fichiers JSON
 */
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erreur lecture ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Écriture sécurisée des fichiers JSON
 */
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Erreur écriture ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Middleware d'authentification
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token d'authentification manquant" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré" });
        }
        req.user = user;
        next();
    });
}

/**
 * Validation des champs requis
 */
function validateFields(fields, requiredFields) {
    const missing = requiredFields.filter(field => !fields[field]);
    return missing.length === 0 ? null : missing;
}

/**
 * Génération d'ID unique
 */
function generateUserId(users) {
    if (users.length === 0) return 1;
    return Math.max(...users.map(u => u.id)) + 1;
}

/**
 * Route : Authentification utilisateur
 */
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const missing = validateFields(req.body, ['username', 'password']);
        if (missing) {
            return res.status(400).json({ message: `Champs manquants: ${missing.join(', ')}` });
        }

        const users = readJsonFile(USERS_FILE);
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Connexion réussie",
            token,
            role: user.role,
            username: user.username
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Inscription utilisateur avec rôle
 */
app.post("/register", async (req, res) => {
    try {
        const { username, password, role, adminCode } = req.body;

        const missing = validateFields(req.body, ['username', 'password', 'role']);
        if (missing) {
            return res.status(400).json({ message: `Champs manquants: ${missing.join(', ')}` });
        }

        if (username.length < 3 || password.length < 6) {
            return res.status(400).json({
                message: "Le nom d'utilisateur doit faire au moins 3 caractères et le mot de passe au moins 6 caractères"
            });
        }

        const users = readJsonFile(USERS_FILE);

        if (users.find(u => u.username === username)) {
            return res.status(400).json({ message: "Utilisateur déjà existant" });
        }

        if (role === "admin" && adminCode !== ADMIN_CODE) {
            return res.status(403).json({ message: "Code administrateur incorrect" });
        }

        if (!['admin', 'declarant'].includes(role)) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = {
            id: generateUserId(users),
            username,
            password: hashedPassword,
            role
        };

        users.push(newUser);

        if (!writeJsonFile(USERS_FILE, users)) {
            return res.status(500).json({ message: "Erreur lors de l'enregistrement" });
        }

        res.json({ message: "Compte créé avec succès" });
    } catch (error) {
        console.error("Erreur register:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Déclaration de document (protégée)
 */
app.post("/declaration", authenticateToken, (req, res) => {
    try {
        const missing = validateFields(req.body, ['typeDocument', 'nom', 'typeDeclaration', 'lieu', 'date']);
        if (missing) {
            return res.status(400).json({ message: `Champs manquants: ${missing.join(', ')}` });
        }

        const documents = readJsonFile(DOCUMENTS_FILE);

        const newDocument = {
            id: documents.length + 1,
            ...req.body,
            declarantId: req.user.id,
            declarantUsername: req.user.username,
            dateDeclaration: new Date().toISOString()
        };

        documents.push(newDocument);

        if (!writeJsonFile(DOCUMENTS_FILE, documents)) {
            return res.status(500).json({ message: "Erreur lors de l'enregistrement" });
        }

        res.json({ message: "Déclaration enregistrée", document: newDocument });
    } catch (error) {
        console.error("Erreur déclaration:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Recherche INTELLIGENTE avec fuzzy matching (protégée)
 */
app.get("/recherche", authenticateToken, (req, res) => {
    try {
        const documents = readJsonFile(DOCUMENTS_FILE);
        const searchCriteria = req.query;

        // Utiliser l'algorithme de recherche intelligente
        const resultats = intelligentSearch(documents, searchCriteria);

        res.json(resultats);
    } catch (error) {
        console.error("Erreur recherche:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Récupérer tous les documents (admin uniquement)
 */
app.get("/documents", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const documents = readJsonFile(DOCUMENTS_FILE);
        res.json(documents);
    } catch (error) {
        console.error("Erreur récupération documents:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Correspondances automatiques PERDU ↔ TROUVÉ (protégée)
 */
app.get("/correspondances", authenticateToken, (req, res) => {
    try {
        const documents = readJsonFile(DOCUMENTS_FILE);
        const matches = findMatches(documents);

        res.json({
            total: matches.length,
            correspondances: matches
        });
    } catch (error) {
        console.error("Erreur correspondances:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Suggestions intelligentes (protégée)
 */
app.get("/suggestions", authenticateToken, (req, res) => {
    try {
        const { field, query } = req.query;

        if (!field || !query || query.length < 2) {
            return res.status(400).json({ message: "Paramètres manquants (field, query)" });
        }

        const documents = readJsonFile(DOCUMENTS_FILE);
        const suggestions = getSuggestions(documents, query, field);

        res.json(suggestions);
    } catch (error) {
        console.error("Erreur suggestions:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Statistiques publiques (page d'accueil)
 */
app.get("/stats-public", (req, res) => {
    try {
        const documents = readJsonFile(DOCUMENTS_FILE);
        const users = readJsonFile(USERS_FILE);

        // Compter les correspondances
        const matches = findMatches(documents);

        const publicStats = {
            declares: documents.length,
            retrouves: matches.length,
            membres: users.length
        };

        res.json(publicStats);
    } catch (error) {
        console.error("Erreur statistiques publiques:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Statistiques pour dashboard admin (admin uniquement)
 */
app.get("/statistiques", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const documents = readJsonFile(DOCUMENTS_FILE);
        const stats = getStatistics(documents);

        res.json(stats);
    } catch (error) {
        console.error("Erreur statistiques:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Modifier un document (admin uniquement)
 */
app.put("/documents/:id", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const docId = parseInt(req.params.id);
        const documents = readJsonFile(DOCUMENTS_FILE);
        const docIndex = documents.findIndex(d => d.id === docId);

        if (docIndex === -1) {
            return res.status(404).json({ message: "Document non trouvé" });
        }

        // Mettre à jour le document
        documents[docIndex] = {
            ...documents[docIndex],
            ...req.body,
            id: docId, // Garder l'ID original
            dateModification: new Date().toISOString()
        };

        if (!writeJsonFile(DOCUMENTS_FILE, documents)) {
            return res.status(500).json({ message: "Erreur lors de la sauvegarde" });
        }

        res.json({
            message: "Document modifié avec succès",
            document: documents[docIndex]
        });
    } catch (error) {
        console.error("Erreur modification document:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Valider un document (admin uniquement)
 */
app.patch("/documents/:id/validate", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const docId = parseInt(req.params.id);
        const documents = readJsonFile(DOCUMENTS_FILE);
        const docIndex = documents.findIndex(d => d.id === docId);

        if (docIndex === -1) {
            return res.status(404).json({ message: "Document non trouvé" });
        }

        // Marquer comme validé
        documents[docIndex].statut = 'valide';
        documents[docIndex].dateValidation = new Date().toISOString();
        documents[docIndex].validateurId = req.user.id;

        if (!writeJsonFile(DOCUMENTS_FILE, documents)) {
            return res.status(500).json({ message: "Erreur lors de la sauvegarde" });
        }

        res.json({
            message: "Document validé avec succès",
            document: documents[docIndex]
        });
    } catch (error) {
        console.error("Erreur validation document:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Supprimer un document (admin uniquement)
 */
app.delete("/documents/:id", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const docId = parseInt(req.params.id);
        const documents = readJsonFile(DOCUMENTS_FILE);
        const docIndex = documents.findIndex(d => d.id === docId);

        if (docIndex === -1) {
            return res.status(404).json({ message: "Document non trouvé" });
        }

        // Supprimer le document
        const deletedDoc = documents.splice(docIndex, 1)[0];

        if (!writeJsonFile(DOCUMENTS_FILE, documents)) {
            return res.status(500).json({ message: "Erreur lors de la sauvegarde" });
        }

        res.json({
            message: "Document supprimé avec succès",
            document: deletedDoc
        });
    } catch (error) {
        console.error("Erreur suppression document:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * GESTION DES UTILISATEURS (ADMIN UNIQUEMENT)
 */

/**
 * Route : Récupérer tous les utilisateurs (admin uniquement)
 */
app.get("/users", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const users = readJsonFile(USERS_FILE);

        // Retourner les utilisateurs sans les mots de passe
        const safeUsers = users.map(({ password, ...user }) => user);

        res.json(safeUsers);
    } catch (error) {
        console.error("Erreur récupération utilisateurs:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Supprimer un utilisateur (admin uniquement)
 */
app.delete("/users/:id", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const userId = parseInt(req.params.id);

        // Ne pas permettre de supprimer son propre compte
        if (userId === req.user.id) {
            return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
        }

        const users = readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const deletedUser = users.splice(userIndex, 1)[0];

        if (!writeJsonFile(USERS_FILE, users)) {
            return res.status(500).json({ message: "Erreur lors de la sauvegarde" });
        }

        res.json({
            message: "Utilisateur supprimé avec succès",
            user: { id: deletedUser.id, username: deletedUser.username }
        });
    } catch (error) {
        console.error("Erreur suppression utilisateur:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Modifier le rôle d'un utilisateur (admin uniquement)
 */
app.patch("/users/:id/role", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const userId = parseInt(req.params.id);
        const { role } = req.body;

        if (!role || !['admin', 'declarant'].includes(role)) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        // Ne pas permettre de modifier son propre rôle
        if (userId === req.user.id) {
            return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre rôle" });
        }

        const users = readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        users[userIndex].role = role;

        if (!writeJsonFile(USERS_FILE, users)) {
            return res.status(500).json({ message: "Erreur lors de la sauvegarde" });
        }

        res.json({
            message: "Rôle modifié avec succès",
            user: {
                id: users[userIndex].id,
                username: users[userIndex].username,
                role: users[userIndex].role
            }
        });
    } catch (error) {
        console.error("Erreur modification rôle:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Réinitialiser le mot de passe d'un utilisateur (admin uniquement)
 */
app.patch("/users/:id/reset-password", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const userId = parseInt(req.params.id);
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" });
        }

        const users = readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        users[userIndex].password = hashedPassword;

        if (!writeJsonFile(USERS_FILE, users)) {
            return res.status(500).json({ message: "Erreur lors de la sauvegarde" });
        }

        res.json({
            message: "Mot de passe réinitialisé avec succès",
            user: {
                id: users[userIndex].id,
                username: users[userIndex].username
            }
        });
    } catch (error) {
        console.error("Erreur réinitialisation mot de passe:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Route : Statistiques des utilisateurs (admin uniquement)
 */
app.get("/users-stats", authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        const users = readJsonFile(USERS_FILE);
        const documents = readJsonFile(DOCUMENTS_FILE);

        const stats = {
            total: users.length,
            admins: users.filter(u => u.role === 'admin').length,
            declarants: users.filter(u => u.role === 'declarant').length,
            usersWithDeclarations: new Set(documents.map(d => d.declarantId)).size,
            topDeclarants: Object.entries(
                documents.reduce((acc, doc) => {
                    if (doc.declarantUsername) {
                        acc[doc.declarantUsername] = (acc[doc.declarantUsername] || 0) + 1;
                    }
                    return acc;
                }, {})
            )
            .map(([username, count]) => ({ username, declarations: count }))
            .sort((a, b) => b.declarations - a.declarations)
            .slice(0, 5)
        };

        res.json(stats);
    } catch (error) {
        console.error("Erreur statistiques utilisateurs:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * Initialisation et lancement du serveur
 */
// Route de santé pour Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

initFiles();

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur SmartSearch lancé sur le port ${PORT}`);
    console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});
