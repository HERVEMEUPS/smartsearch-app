const { Declaration, AuditLog } = require('../models');
// Import différé pour éviter la dépendance circulaire
let matchingService = null;
const getMatchingService = () => {
  if (!matchingService) {
    matchingService = require('./matchingService');
  }
  return matchingService;
};

class DeclarationService {
  /**
   * Créer une nouvelle déclaration
   */
  async create(userId, data) {
    // Créer la déclaration
    const declaration = await Declaration.create({
      utilisateur: userId,
      type: data.type,
      typeDocument: data.typeDocument,
      description: data.description,
      nomPartiel: data.nomPartiel,
      numeroPartiel: data.numeroPartiel,
      dateEvenement: data.dateEvenement,
      localisation: data.localisation,
      photoUrl: data.photoUrl,
      contactMasque: data.contactMasque !== false, // true par défaut
      metadata: {
        source: 'web',
        userAgent: data.userAgent,
        ipAddress: data.ipAddress
      }
    });

    // Log d'audit
    await AuditLog.log({
      acteurId: userId,
      action: 'CREATE_DECLARATION',
      entite: 'DECLARATION',
      entiteId: declaration._id,
      details: { type: declaration.type, typeDocument: declaration.typeDocument }
    });

    // Déclencher le matching en arrière-plan (ne pas attendre)
    if (declaration.canBeMatched()) {
      setImmediate(() => {
        getMatchingService().findMatchesFor(declaration._id)
          .catch(err => console.error('Erreur matching asynchrone:', err));
      });
    }

    return declaration;
  }

  /**
   * Obtenir toutes les déclarations avec filtres et pagination
   */
  async getAll(filters = {}, page = 1, limit = 20) {
    const query = {};

    // Filtres
    if (filters.type) {
      // Accepter les anciennes et nouvelles valeurs
      const typeMapping = {
        'PERTE': ['PERTE', 'Perdu', 'perdu'],
        'DECOUVERTE': ['DECOUVERTE', 'Trouvé', 'trouve', 'retrouvé']
      };

      if (typeMapping[filters.type]) {
        query.type = { $in: typeMapping[filters.type] };
      } else if (filters.type === 'Perdu' || filters.type === 'perdu') {
        query.type = { $in: ['PERTE', 'Perdu', 'perdu'] };
      } else if (filters.type === 'Trouvé' || filters.type === 'trouve' || filters.type === 'retrouvé') {
        query.type = { $in: ['DECOUVERTE', 'Trouvé', 'trouve', 'retrouvé'] };
      } else {
        query.type = filters.type;
      }
    }

    if (filters.typeDocument) {
      query.typeDocument = filters.typeDocument;
    }

    if (filters.statut) {
      query.statut = filters.statut;
    }

    if (filters.ville) {
      query['localisation.ville'] = { $regex: filters.ville, $options: 'i' };
    }

    if (filters.dateDebut || filters.dateFin) {
      query.dateEvenement = {};
      if (filters.dateDebut) {
        query.dateEvenement.$gte = new Date(filters.dateDebut);
      }
      if (filters.dateFin) {
        query.dateEvenement.$lte = new Date(filters.dateFin);
      }
    }

    // Recherche texte
    if (filters.search) {
      query.$or = [
        { description: { $regex: filters.search, $options: 'i' } },
        { nomPartiel: { $regex: filters.search, $options: 'i' } },
        { numeroPartiel: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [rawDeclarations, total] = await Promise.all([
      Declaration.find(query)
        .populate('utilisateur', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Declaration.countDocuments(query)
    ]);

    // Mapper les champs MongoDB vers le format frontend
    const declarations = rawDeclarations.map(decl => ({
      ...decl,
      id: decl._id,
      typeDeclaration: decl.type === 'PERTE' ? 'perdu' : 'trouve',
      nom: decl.nomPartiel,
      numero: decl.numeroPartiel,
      lieu: decl.localisation?.ville,
      date: decl.dateEvenement,
      declarantUsername: decl.utilisateur?.username,
      declarantId: decl.utilisateur?._id,
      dateDeclaration: decl.createdAt
    }));

    return {
      declarations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtenir les déclarations d'un utilisateur
   */
  async getUserDeclarations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [declarations, total] = await Promise.all([
      Declaration.find({ utilisateur: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Declaration.countDocuments({ utilisateur: userId })
    ]);

    return {
      declarations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtenir une déclaration par ID
   */
  async getById(id) {
    const declaration = await Declaration.findById(id)
      .populate('utilisateur', 'username email telephone');

    if (!declaration) {
      throw new Error('Déclaration non trouvée');
    }

    return declaration;
  }

  /**
   * Mettre à jour une déclaration
   */
  async update(id, userId, updates) {
    const declaration = await Declaration.findById(id);

    if (!declaration) {
      throw new Error('Déclaration non trouvée');
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (declaration.utilisateur.toString() !== userId.toString()) {
      throw new Error('Non autorisé à modifier cette déclaration');
    }

    // Champs modifiables
    const allowedFields = [
      'description',
      'nomPartiel',
      'numeroPartiel',
      'localisation',
      'photoUrl',
      'contactMasque'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        declaration[key] = updates[key];
      }
    });

    await declaration.save();

    // Log d'audit
    await AuditLog.log({
      acteurId: userId,
      action: 'UPDATE_DECLARATION',
      entite: 'DECLARATION',
      entiteId: declaration._id,
      details: { updatedFields: Object.keys(updates) }
    });

    // Re-déclencher le matching si changements significatifs
    if (updates.description || updates.nomPartiel || updates.numeroPartiel) {
      setImmediate(() => {
        getMatchingService().findMatchesFor(declaration._id)
          .catch(err => console.error('Erreur matching:', err));
      });
    }

    return declaration;
  }

  /**
   * Supprimer une déclaration (soft delete)
   */
  async delete(id, userId) {
    const declaration = await Declaration.findById(id);

    if (!declaration) {
      throw new Error('Déclaration non trouvée');
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (declaration.utilisateur.toString() !== userId.toString()) {
      throw new Error('Non autorisé à supprimer cette déclaration');
    }

    // Soft delete : changer le statut
    declaration.statut = 'ARCHIVEE';
    await declaration.save();

    // Log d'audit
    await AuditLog.log({
      acteurId: userId,
      action: 'DELETE_DECLARATION',
      entite: 'DECLARATION',
      entiteId: declaration._id
    });

    return { message: 'Déclaration archivée avec succès' };
  }

  /**
   * Obtenir les statistiques des déclarations
   */
  async getStatistics(filters = {}) {
    const query = {};

    if (filters.dateDebut || filters.dateFin) {
      query.createdAt = {};
      if (filters.dateDebut) {
        query.createdAt.$gte = new Date(filters.dateDebut);
      }
      if (filters.dateFin) {
        query.createdAt.$lte = new Date(filters.dateFin);
      }
    }

    const [
      total,
      byType,
      byDocument,
      byStatut,
      byVille,
      byMonth
    ] = await Promise.all([
      Declaration.countDocuments(query),

      Declaration.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),

      Declaration.aggregate([
        { $match: query },
        { $group: { _id: '$typeDocument', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      Declaration.aggregate([
        { $match: query },
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ]),

      Declaration.aggregate([
        { $match: query },
        { $group: { _id: '$localisation.ville', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      Declaration.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    const byTypeObj = byType.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    const perdus = byTypeObj.PERTE || 0;
    const trouves = byTypeObj.DECOUVERTE || 0;
    const tauxRecuperation = total > 0 ? Math.round((trouves / total) * 100) : 0;

    // Formater les mois pour le frontend
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const parMois = byMonth.map(({ _id, count }) => [
      `${monthNames[_id.month - 1]} ${_id.year}`,
      count
    ]);

    return {
      total,
      perdus,
      trouves,
      correspondances: 0, // Sera calculé par matchingService
      tauxRecuperation,
      byType: byTypeObj,
      parType: byDocument.map(({ _id, count }) => [_id, count]),
      parLieu: byVille.map(({ _id, count }) => [_id || 'Non spécifié', count]),
      parMois,
      byDocument: byDocument.map(({ _id, count }) => ({ document: _id, count })),
      byStatut: byStatut.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      topVilles: byVille.map(({ _id, count }) => ({ ville: _id, count }))
    };
  }
}

module.exports = new DeclarationService();
