const { Declaration, Correspondance, AuditLog } = require('../models');
const axios = require('axios');
const config = require('../config');
const notificationService = require('./notificationService');

class MatchingService {
  /**
   * Trouver des correspondances pour une déclaration
   */
  async findMatchesFor(declarationId) {
    try {
      const declaration = await Declaration.findById(declarationId);

      if (!declaration || !declaration.canBeMatched()) {
        return;
      }

      // 1. Filtrage déterministe (candidats potentiels)
      const candidates = await Declaration
        .find()
        .matchCandidates(declaration, config.matching.windowDays);

      console.log(`🔍 ${candidates.length} candidats trouvés pour matching`);

      // 2. Pour chaque candidat, appeler le service IA
      for (const candidate of candidates) {
        try {
          // Vérifier si une correspondance existe déjà
          const existing = await Correspondance.findOne({
            declarationPerteId: declaration.type === 'PERTE' ? declaration._id : candidate._id,
            declarationDecouverteId: declaration.type === 'DECOUVERTE' ? declaration._id : candidate._id
          });

          if (existing) {
            continue; // Skip si déjà traité
          }

          const matchResult = await this.computeMatch(declaration, candidate);

          if (matchResult.au_dessus_du_seuil) {
            await this.createCorrespondance(declaration, candidate, matchResult);
          }
        } catch (error) {
          console.error(`Erreur matching avec ${candidate._id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Erreur findMatchesFor:', error);
      throw error;
    }
  }

  /**
   * Calculer le score de correspondance (version simplifiée sans IA)
   */
  async computeMatch(declA, declB) {
    try {
      // Calcul de similarité simple mais efficace (sans service IA externe)
      const scores = {
        typeDocument: 0,
        nom: 0,
        numero: 0,
        localisation: 0,
        date: 0
      };

      // 1. Type de document (35% du score) - Doit être identique
      if (declA.typeDocument === declB.typeDocument) {
        scores.typeDocument = 0.35;
      }

      // 2. Nom (30% du score) - Similarité de chaîne avec normalisation
      if (declA.nomPartiel && declB.nomPartiel) {
        const similarity = this.calculateStringSimilarity(
          declA.nomPartiel.toLowerCase().trim(),
          declB.nomPartiel.toLowerCase().trim()
        );
        scores.nom = similarity * 0.30;
      }

      // 3. Numéro (25% du score) - Match exact = score maximal
      if (declA.numeroPartiel && declB.numeroPartiel) {
        const numA = declA.numeroPartiel.replace(/[\s\-_./]/g, '').toLowerCase();
        const numB = declB.numeroPartiel.replace(/[\s\-_./]/g, '').toLowerCase();

        if (numA === numB) {
          // Match exact sur le numéro = score maximal
          scores.numero = 0.25;
        } else if (numA.includes(numB) || numB.includes(numA)) {
          // Match partiel
          const ratio = Math.min(numA.length, numB.length) / Math.max(numA.length, numB.length);
          scores.numero = 0.25 * ratio;
        } else {
          // Calculer similarité avec Levenshtein
          const similarity = this.calculateLevenshteinSimilarity(numA, numB);
          if (similarity >= 0.8) {
            scores.numero = 0.25 * similarity;
          }
        }
      }

      // 4. Localisation (5% du score) - Même ville (case-insensitive)
      if (declA.localisation?.ville && declB.localisation?.ville) {
        const villeA = declA.localisation.ville.toLowerCase().trim();
        const villeB = declB.localisation.ville.toLowerCase().trim();

        if (villeA === villeB) {
          scores.localisation = 0.05;
        } else if (this.calculateStringSimilarity(villeA, villeB) >= 0.85) {
          // Villes similaires (typos, accents)
          scores.localisation = 0.03;
        }
      }

      // 5. Date (5% du score) - Dans une fenêtre de temps raisonnable
      if (declA.dateEvenement && declB.dateEvenement) {
        const dateA = new Date(declA.dateEvenement);
        const dateB = new Date(declB.dateEvenement);
        const diffDays = Math.abs((dateB - dateA) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          scores.date = 0.05;
        } else if (diffDays <= 30) {
          scores.date = 0.03;
        } else if (diffDays <= 60) {
          scores.date = 0.01;
        }
      }

      // Calcul du score global
      const scoreGlobal = Object.values(scores).reduce((sum, val) => sum + val, 0);

      // Bonus pour correspondance parfaite (même numéro + même nom)
      let bonus = 0;
      if (scores.numero === 0.25 && scores.nom >= 0.27) {
        bonus = 0.10; // Bonus de 10% pour match quasi-parfait
      }

      const scoreFinal = Math.min(1.0, scoreGlobal + bonus);

      // Retourner dans le format attendu
      return {
        score_global: scoreFinal,
        score_nlp: scores.nom + scores.numero,
        score_llm: scores.typeDocument,
        score_geo: scores.localisation + scores.date,
        au_dessus_du_seuil: scoreFinal >= config.matching.scoreThreshold,
        details: scores,
        bonus: bonus,
        justification: `Score calculé: ${(scoreFinal * 100).toFixed(1)}%. ` +
          `Type: ${declA.typeDocument === declB.typeDocument ? '✓' : '✗'}, ` +
          `Nom: ${(scores.nom / 0.30 * 100).toFixed(0)}%, ` +
          `Numéro: ${scores.numero > 0 ? '✓' : '✗'}` +
          (bonus > 0 ? ` (Bonus: +${(bonus * 100).toFixed(0)}%)` : '')
      };
    } catch (error) {
      console.error('Erreur calcul match:', error);
      throw error;
    }
  }

  /**
   * Calculer la similarité entre deux chaînes (algorithme de Jaro-Winkler simplifié)
   */
  calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    // Normaliser les chaînes
    str1 = str1.trim().toLowerCase();
    str2 = str2.trim().toLowerCase();

    // Si une chaîne contient l'autre
    if (str1.includes(str2) || str2.includes(str1)) {
      return 0.9;
    }

    // Calcul simple de similarité par caractères communs
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    let matches = 0;
    const minLen = Math.min(len1, len2);

    for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) {
        matches++;
      }
    }

    // Bonus pour les mots communs
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w)).length;

    const charSimilarity = matches / maxLen;
    const wordSimilarity = commonWords / Math.max(words1.length, words2.length);

    return (charSimilarity * 0.5) + (wordSimilarity * 0.5);
  }

  /**
   * Calculer la distance de Levenshtein et la convertir en score de similarité
   */
  calculateLevenshteinSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const len1 = str1.length;
    const len2 = str2.length;

    // Créer la matrice de distances
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    // Initialiser la première ligne et colonne
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    // Remplir la matrice
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Suppression
          matrix[i][j - 1] + 1,      // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    // Distance de Levenshtein
    const distance = matrix[len1][len2];

    // Convertir en score de similarité (0 à 1)
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1.0 : 1.0 - (distance / maxLen);
  }

  /**
   * Créer une correspondance dans la base de données
   */
  async createCorrespondance(declA, declB, matchResult) {
    // Déterminer qui est la perte et qui est la découverte
    const declPerte = declA.type === 'PERTE' ? declA : declB;
    const declDecouverte = declA.type === 'DECOUVERTE' ? declA : declB;

    // Créer la correspondance
    const correspondance = await Correspondance.create({
      declarationPerteId: declPerte._id,
      declarationDecouverteId: declDecouverte._id,
      scoreGlobal: matchResult.score_global,
      scoreNLP: matchResult.score_nlp,
      scoreLLM: matchResult.score_llm,
      scoreGeo: matchResult.score_geo,
      statut: 'PROPOSEE',
      metadataIA: {
        modelUsed: matchResult.metadata?.model_used || 'unknown',
        confidence: matchResult.score_global,
        reasoning: matchResult.raisonnement,
        processingTimeMs: matchResult.metadata?.processing_time_ms,
        version: '1.0'
      }
    });

    // Mettre à jour les statuts des déclarations
    await Declaration.updateMany(
      { _id: { $in: [declPerte._id, declDecouverte._id] } },
      { statut: 'EN_MATCH' }
    );

    // Log d'audit
    await AuditLog.log({
      acteurType: 'SYSTEM',
      action: 'CREATE_MATCH',
      entite: 'CORRESPONDANCE',
      entiteId: correspondance._id,
      details: {
        scoreGlobal: correspondance.scoreGlobal,
        perteId: declPerte._id,
        decouverteId: declDecouverte._id
      }
    });

    // Déclencher les notifications
    try {
      await notificationService.notifyMatch(correspondance);
    } catch (error) {
      console.error('Erreur envoi notifications:', error);
    }

    console.log(`✅ Correspondance créée: ${correspondance._id} (score: ${matchResult.score_global})`);

    return correspondance;
  }

  /**
   * Obtenir toutes les correspondances avec filtres
   */
  async getAll(filters = {}, page = 1, limit = 20) {
    const query = {};

    if (filters.statut) {
      query.statut = filters.statut;
    }

    if (filters.minScore) {
      query.scoreGlobal = { $gte: parseFloat(filters.minScore) };
    }

    const skip = (page - 1) * limit;

    const [correspondances, total] = await Promise.all([
      Correspondance.find(query)
        .populate('declarationPerteId')
        .populate('declarationDecouverteId')
        .sort({ scoreGlobal: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Correspondance.countDocuments(query)
    ]);

    return {
      correspondances,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtenir les correspondances pour une déclaration
   */
  async getForDeclaration(declarationId) {
    const correspondances = await Correspondance
      .find()
      .forDeclaration(declarationId)
      .populate('declarationPerteId')
      .populate('declarationDecouverteId')
      .lean();

    return correspondances;
  }

  /**
   * Obtenir une correspondance par ID
   */
  async getById(id) {
    const correspondance = await Correspondance.findById(id)
      .populate({
        path: 'declarationPerteId',
        populate: { path: 'utilisateur', select: 'username email telephone' }
      })
      .populate({
        path: 'declarationDecouverteId',
        populate: { path: 'utilisateur', select: 'username email telephone' }
      });

    if (!correspondance) {
      throw new Error('Correspondance non trouvée');
    }

    return correspondance;
  }

  /**
   * Accepter une correspondance
   */
  async accept(id, userId, commentaire = null) {
    const correspondance = await this.getById(id);

    // Vérifier que l'utilisateur est concerné
    const declPerte = correspondance.declarationPerteId;
    const declDecouverte = correspondance.declarationDecouverteId;

    if (
      declPerte.utilisateur._id.toString() !== userId.toString() &&
      declDecouverte.utilisateur._id.toString() !== userId.toString()
    ) {
      throw new Error('Non autorisé');
    }

    await correspondance.accept(commentaire);

    // Log d'audit
    await AuditLog.log({
      acteurId: userId,
      action: 'ACCEPT_MATCH',
      entite: 'CORRESPONDANCE',
      entiteId: correspondance._id
    });

    // Notification à l'autre partie
    await notificationService.notifyMatchAccepted(correspondance, userId);

    return correspondance;
  }

  /**
   * Rejeter une correspondance
   */
  async reject(id, userId, commentaire = null) {
    const correspondance = await this.getById(id);

    // Vérifier que l'utilisateur est concerné
    const declPerte = correspondance.declarationPerteId;
    const declDecouverte = correspondance.declarationDecouverteId;

    if (
      declPerte.utilisateur._id.toString() !== userId.toString() &&
      declDecouverte.utilisateur._id.toString() !== userId.toString()
    ) {
      throw new Error('Non autorisé');
    }

    await correspondance.reject(commentaire);

    // Log d'audit
    await AuditLog.log({
      acteurId: userId,
      action: 'REJECT_MATCH',
      entite: 'CORRESPONDANCE',
      entiteId: correspondance._id
    });

    return correspondance;
  }

  /**
   * Confirmer la récupération
   */
  async confirm(id, userId) {
    const correspondance = await this.getById(id);

    // Vérifier que c'est le déclarant de la perte
    const declPerte = correspondance.declarationPerteId;

    if (declPerte.utilisateur._id.toString() !== userId.toString()) {
      throw new Error('Seul le déclarant de la perte peut confirmer la récupération');
    }

    await correspondance.confirm();

    // Clôturer les déclarations
    await Declaration.updateMany(
      { _id: { $in: [correspondance.declarationPerteId, correspondance.declarationDecouverteId] } },
      { statut: 'CLOTUREE' }
    );

    // Log d'audit
    await AuditLog.log({
      acteurId: userId,
      action: 'CONFIRM_RECOVERY',
      entite: 'CORRESPONDANCE',
      entiteId: correspondance._id
    });

    // Notification de succès
    await notificationService.notifyRecoveryConfirmed(correspondance);

    return correspondance;
  }

  /**
   * Ajouter un feedback sur une correspondance
   */
  async addFeedback(id, userId, feedback) {
    const correspondance = await Correspondance.findById(id);

    if (!correspondance) {
      throw new Error('Correspondance non trouvée');
    }

    correspondance.feedbackQualite = {
      pertinent: feedback.pertinent,
      commentaire: feedback.commentaire
    };

    await correspondance.save();

    return correspondance;
  }

  /**
   * Obtenir les statistiques de matching
   */
  async getStatistics() {
    const stats = await Correspondance.getStatistics();

    const total = await Correspondance.countDocuments();
    const highQuality = await Correspondance.countDocuments({ scoreGlobal: { $gte: 0.8 } });

    return {
      total,
      highQuality,
      byStatut: stats.reduce((acc, { _id, count, avgScore }) => {
        acc[_id] = { count, avgScore: avgScore?.toFixed(3) };
        return acc;
      }, {}),
      successRate: total > 0 ? ((stats.find(s => s._id === 'CONFIRMEE')?.count || 0) / total * 100).toFixed(2) : 0
    };
  }
}

module.exports = new MatchingService();
