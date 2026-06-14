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
   * Calculer le score de correspondance via le service IA
   */
  async computeMatch(declA, declB) {
    try {
      // Vérifier que le service IA est configuré
      if (!config.aiService.url) {
        throw new Error('Service IA non configuré');
      }

      const response = await axios.post(
        `${config.aiService.url}/api/ai/compute-match`,
        {
          declarationA: {
            id: declA._id.toString(),
            type: declA.type,
            typeDocument: declA.typeDocument,
            description: declA.description,
            nomPartiel: declA.nomPartiel,
            numeroPartiel: declA.numeroPartiel,
            dateEvenement: declA.dateEvenement,
            localisation: {
              ville: declA.localisation.ville,
              quartier: declA.localisation.quartier
            }
          },
          declarationB: {
            id: declB._id.toString(),
            type: declB.type,
            typeDocument: declB.typeDocument,
            description: declB.description,
            nomPartiel: declB.nomPartiel,
            numeroPartiel: declB.numeroPartiel,
            dateEvenement: declB.dateEvenement,
            localisation: {
              ville: declB.localisation.ville,
              quartier: declB.localisation.quartier
            }
          }
        },
        {
          timeout: config.aiService.timeout || 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Service IA error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        throw new Error('Service IA non disponible. Vérifiez qu\'il est démarré sur ' + config.aiService.url);
      } else {
        throw error;
      }
    }
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
