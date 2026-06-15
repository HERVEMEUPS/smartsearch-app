/**
 * MODULE DE RECHERCHE INTELLIGENTE
 * Algorithme avancé avec fuzzy matching et correspondances automatiques
 */

const Fuse = require('fuse.js');
const stringSimilarity = require('string-similarity');

/**
 * Configuration de Fuse.js pour la recherche floue
 */
const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // 0 = correspondance exacte, 1 = tout correspond
    keys: [
        { name: 'nom', weight: 0.4 },
        { name: 'typeDocument', weight: 0.3 },
        { name: 'lieu', weight: 0.2 },
        { name: 'numero', weight: 0.1 }
    ]
};

/**
 * Recherche intelligente avec fuzzy matching
 * Tolère les fautes de frappe et les variations
 */
function intelligentSearch(documents, searchCriteria) {
    const {
        typeDocument,
        nom,
        numero,
        typeDeclaration,
        lieu,
        dateDebut,
        dateFin
    } = searchCriteria;

    // 1️⃣ Filtres stricts (date et type de déclaration)
    let filteredDocs = documents.filter(doc => {
        if (typeDeclaration && doc.type !== typeDeclaration) return false;

        if (dateDebut) {
            const docDate = new Date(doc.date);
            const debut = new Date(dateDebut);
            if (isNaN(docDate) || isNaN(debut) || docDate < debut) return false;
        }

        if (dateFin) {
            const docDate = new Date(doc.date);
            const fin = new Date(dateFin);
            if (isNaN(docDate) || isNaN(fin) || docDate > fin) return false;
        }

        return true;
    });

    // 2️⃣ Recherche floue avec Fuse.js
    if (nom || typeDocument || lieu) {
        const searchQuery = {
            ...(nom && { nom }),
            ...(typeDocument && { typeDocument }),
            ...(lieu && { lieu })
        };

        const fuse = new Fuse(filteredDocs, fuseOptions);

        // Construire la requête de recherche
        const fuseQuery = Object.entries(searchQuery).map(([key, value]) => ({
            [key]: value
        }));

        if (fuseQuery.length > 0) {
            const results = fuse.search(searchQuery);
            filteredDocs = results.map(result => ({
                ...result.item,
                fuzzyScore: Math.round((1 - result.score) * 100) // Score de 0 à 100
            }));
        }
    }

    // 3️⃣ Scoring avancé
    filteredDocs = filteredDocs.map(doc => {
        let score = doc.fuzzyScore || 0;
        let details = [];

        // Numéro exact (priorité absolue)
        if (numero && doc.numero && doc.numero === numero) {
            score += 50;
            details.push('Numéro exact');
        }

        // Similarité du nom (Levenshtein)
        if (nom && doc.nom) {
            const similarity = stringSimilarity.compareTwoStrings(
                nom.toLowerCase(),
                doc.nom.toLowerCase()
            );
            const nomScore = Math.round(similarity * 30);
            score += nomScore;
            if (nomScore > 15) details.push(`Nom similaire (${Math.round(similarity * 100)}%)`);
        }

        // Type de document exact
        if (typeDocument && doc.typeDocument) {
            const typeSimilarity = stringSimilarity.compareTwoStrings(
                typeDocument.toLowerCase(),
                doc.typeDocument.toLowerCase()
            );
            if (typeSimilarity > 0.8) {
                score += 20;
                details.push('Type exact');
            }
        }

        // Lieu similaire
        if (lieu && doc.lieu) {
            const lieuSimilarity = stringSimilarity.compareTwoStrings(
                lieu.toLowerCase(),
                doc.lieu.toLowerCase()
            );
            const lieuScore = Math.round(lieuSimilarity * 15);
            score += lieuScore;
            if (lieuScore > 7) details.push('Lieu similaire');
        }

        // Bonus pour documents récents (moins de 30 jours)
        const docDate = new Date(doc.date);
        const today = new Date();
        const daysDiff = Math.floor((today - docDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < 30) {
            score += 10;
            details.push('Récent');
        }

        return {
            ...doc,
            score: Math.min(Math.round(score), 100), // Cap à 100
            matchDetails: details
        };
    });

    // 4️⃣ Filtrage par seuil et tri
    filteredDocs = filteredDocs
        .filter(doc => doc.score >= 20) // Seuil minimum
        .sort((a, b) => b.score - a.score); // Tri décroissant

    return filteredDocs;
}

/**
 * Détection automatique de correspondances PERDU ↔ TROUVÉ
 * Trouve les documents perdus qui matchent avec des documents trouvés
 */
function findMatches(documents) {
    const perdus = documents.filter(d => d.type === 'PERTE');
    const trouves = documents.filter(d => d.type === 'DECOUVERTE');

    const matches = [];

    perdus.forEach(perdu => {
        trouves.forEach(trouve => {
            const match = calculateMatchScore(perdu, trouve);

            // Si score > 70%, c'est probablement une correspondance
            if (match.score >= 70) {
                matches.push({
                    perdu: {
                        id: perdu.id,
                        nom: perdu.nom,
                        typeDocument: perdu.typeDocument,
                        declarantUsername: perdu.declarantUsername
                    },
                    trouve: {
                        id: trouve.id,
                        nom: trouve.nom,
                        typeDocument: trouve.typeDocument,
                        declarantUsername: trouve.declarantUsername
                    },
                    matchScore: match.score,
                    matchDetails: match.details,
                    confidence: match.score >= 90 ? 'Très élevée' :
                               match.score >= 80 ? 'Élevée' : 'Moyenne'
                });
            }
        });
    });

    // Trier par score décroissant
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calcule le score de correspondance entre un document perdu et un trouvé
 */
function calculateMatchScore(perdu, trouve) {
    let score = 0;
    const details = [];

    // Type de document (poids 30%)
    if (perdu.typeDocument && trouve.typeDocument) {
        const typeSim = stringSimilarity.compareTwoStrings(
            perdu.typeDocument.toLowerCase(),
            trouve.typeDocument.toLowerCase()
        );
        score += typeSim * 30;
        if (typeSim > 0.8) details.push('Même type de document');
    }

    // Nom (poids 40%)
    if (perdu.nom && trouve.nom) {
        const nomSim = stringSimilarity.compareTwoStrings(
            perdu.nom.toLowerCase(),
            trouve.nom.toLowerCase()
        );
        score += nomSim * 40;
        if (nomSim > 0.7) details.push(`Nom similaire (${Math.round(nomSim * 100)}%)`);
    }

    // Numéro (poids 20%) - Si présent, c'est déterminant
    if (perdu.numero && trouve.numero) {
        if (perdu.numero === trouve.numero) {
            score += 20;
            details.push('Numéro identique');
        } else {
            const numSim = stringSimilarity.compareTwoStrings(
                perdu.numero,
                trouve.numero
            );
            score += numSim * 20;
        }
    }

    // Lieu (poids 10%)
    if (perdu.lieu && trouve.lieu) {
        const lieuSim = stringSimilarity.compareTwoStrings(
            perdu.lieu.toLowerCase(),
            trouve.lieu.toLowerCase()
        );
        score += lieuSim * 10;
        if (lieuSim > 0.5) details.push('Même lieu approximatif');
    }

    // Proximité temporelle (bonus)
    if (perdu.date && trouve.date) {
        const perduDate = new Date(perdu.date);
        const trouveDate = new Date(trouve.date);
        const daysDiff = Math.abs((perduDate - trouveDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 7) {
            score += 10; // Bonus si moins d'une semaine d'écart
            details.push('Dates proches');
        }
    }

    return {
        score: Math.round(score),
        details
    };
}

/**
 * Suggestions intelligentes basées sur la saisie partielle
 */
function getSuggestions(documents, partialInput, field = 'nom') {
    const values = documents
        .map(doc => doc[field])
        .filter(v => v && v.length > 0);

    const uniqueValues = [...new Set(values)];

    const matches = stringSimilarity.findBestMatch(
        partialInput.toLowerCase(),
        uniqueValues.map(v => v.toLowerCase())
    );

    return matches.ratings
        .filter(r => r.rating > 0.3)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(r => ({
            value: uniqueValues[matches.ratings.indexOf(r)],
            confidence: Math.round(r.rating * 100)
        }));
}

/**
 * Statistiques pour le dashboard admin
 */
function getStatistics(documents) {
    const total = documents.length;
    const perdus = documents.filter(d => d.type === 'PERTE').length;
    const trouves = documents.filter(d => d.type === 'DECOUVERTE').length;

    // Correspondances
    const matches = findMatches(documents);
    const tauxRecuperation = perdus > 0 ? Math.round((matches.length / perdus) * 100) : 0;

    // Documents par type
    const typeCounts = {};
    documents.forEach(doc => {
        typeCounts[doc.typeDocument] = (typeCounts[doc.typeDocument] || 0) + 1;
    });

    // Documents par lieu
    const lieuCounts = {};
    documents.forEach(doc => {
        lieuCounts[doc.lieu] = (lieuCounts[doc.lieu] || 0) + 1;
    });

    // Documents par mois
    const moisCounts = {};
    documents.forEach(doc => {
        const date = new Date(doc.date);
        const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        moisCounts[mois] = (moisCounts[mois] || 0) + 1;
    });

    return {
        total,
        perdus,
        trouves,
        correspondances: matches.length,
        tauxRecuperation,
        parType: Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
        parLieu: Object.entries(lieuCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
        parMois: Object.entries(moisCounts).sort()
    };
}

module.exports = {
    intelligentSearch,
    findMatches,
    getSuggestions,
    getStatistics,
    calculateMatchScore
};
