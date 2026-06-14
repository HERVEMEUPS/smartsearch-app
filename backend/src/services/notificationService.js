const { Notification, User, Declaration } = require('../models');

class NotificationService {
  /**
   * Notifier qu'une correspondance a été trouvée
   */
  async notifyMatch(correspondance) {
    try {
      // Récupérer les déclarations avec utilisateurs
      const [declPerte, declDecouverte] = await Promise.all([
        Declaration.findById(correspondance.declarationPerteId).populate('utilisateur'),
        Declaration.findById(correspondance.declarationDecouverteId).populate('utilisateur')
      ]);

      if (!declPerte || !declDecouverte) {
        throw new Error('Déclarations non trouvées');
      }

      const scorePercent = Math.round(correspondance.scoreGlobal * 100);

      // Notification pour le déclarant de la perte
      await this.create({
        destinataireId: declPerte.utilisateur._id,
        type: 'MATCH_TROUVE',
        canal: 'IN_APP',
        titre: '🎉 Correspondance trouvée !',
        contenu: `Un document correspondant à votre déclaration a été trouvé avec un score de confiance de ${scorePercent}%. Consultez les détails pour prendre contact.`,
        correspondanceId: correspondance._id,
        declarationId: declPerte._id
      });

      // Notification pour le déclarant de la découverte
      await this.create({
        destinataireId: declDecouverte.utilisateur._id,
        type: 'MATCH_TROUVE',
        canal: 'IN_APP',
        titre: '🎉 Correspondance trouvée !',
        contenu: `Quelqu'un recherche le document que vous avez trouvé (score: ${scorePercent}%). Vous pouvez le contacter via la plateforme.`,
        correspondanceId: correspondance._id,
        declarationId: declDecouverte._id
      });

      console.log(`✅ Notifications envoyées pour correspondance ${correspondance._id}`);

      // TODO: Envoyer email/SMS si configuré
      // if (declPerte.utilisateur.preferences?.notificationEmail) {
      //   await this.sendEmail(declPerte.utilisateur, ...);
      // }

    } catch (error) {
      console.error('Erreur notifyMatch:', error);
      throw error;
    }
  }

  /**
   * Notifier qu'une correspondance a été acceptée
   */
  async notifyMatchAccepted(correspondance, acceptedBy) {
    const [declPerte, declDecouverte] = await Promise.all([
      Declaration.findById(correspondance.declarationPerteId).populate('utilisateur'),
      Declaration.findById(correspondance.declarationDecouverteId).populate('utilisateur')
    ]);

    // Notifier l'autre partie
    const otherUserId = declPerte.utilisateur._id.toString() === acceptedBy.toString()
      ? declDecouverte.utilisateur._id
      : declPerte.utilisateur._id;

    await this.create({
      destinataireId: otherUserId,
      type: 'NOUVEAU_CONTACT',
      canal: 'IN_APP',
      titre: '👤 Correspondance acceptée',
      contenu: 'L\'autre partie a accepté la correspondance. Vous pouvez maintenant prendre contact pour organiser la restitution.',
      correspondanceId: correspondance._id
    });
  }

  /**
   * Notifier que la récupération est confirmée
   */
  async notifyRecoveryConfirmed(correspondance) {
    const declDecouverte = await Declaration.findById(correspondance.declarationDecouverteId)
      .populate('utilisateur');

    await this.create({
      destinataireId: declDecouverte.utilisateur._id,
      type: 'CONFIRMATION_RECUP',
      canal: 'IN_APP',
      titre: '✅ Récupération confirmée',
      contenu: 'Le propriétaire a confirmé avoir récupéré son document. Merci pour votre bonne action !',
      correspondanceId: correspondance._id
    });
  }

  /**
   * Créer une notification
   */
  async create(data) {
    const notification = await Notification.create({
      destinataireId: data.destinataireId,
      type: data.type,
      canal: data.canal || 'IN_APP',
      titre: data.titre,
      contenu: data.contenu,
      correspondanceId: data.correspondanceId,
      declarationId: data.declarationId,
      expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    });

    // Marquer immédiatement comme envoyée pour IN_APP
    if (data.canal === 'IN_APP') {
      await notification.markAsSent();
    }

    return notification;
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getUserNotifications(userId, unreadOnly = false, limit = 50) {
    const query = { destinataireId: userId };

    if (unreadOnly) {
      query.statut = { $in: ['EN_ATTENTE', 'ENVOYEE'] };
      query.canal = { $in: ['IN_APP', 'PUSH'] };
    }

    const notifications = await Notification.find(query)
      .populate('correspondanceId')
      .populate('declarationId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications;
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    if (notification.destinataireId.toString() !== userId.toString()) {
      throw new Error('Non autorisé');
    }

    await notification.markAsRead();

    return notification;
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      {
        destinataireId: userId,
        statut: { $in: ['EN_ATTENTE', 'ENVOYEE'] },
        canal: { $in: ['IN_APP', 'PUSH'] }
      },
      {
        statut: 'LUE',
        readAt: new Date()
      }
    );

    return { message: 'Toutes les notifications marquées comme lues' };
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(userId) {
    const count = await Notification.countUnread(userId);
    return count;
  }

  /**
   * Supprimer les notifications expirées (cron job)
   */
  async cleanupExpired() {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    console.log(`🗑️  ${result.deletedCount} notifications expirées supprimées`);

    return result.deletedCount;
  }

  /**
   * Envoyer un email (si configuré)
   */
  async sendEmail(user, subject, content) {
    // TODO: Intégrer SendGrid
    console.log(`📧 Email à ${user.email}: ${subject}`);

    const notification = await Notification.create({
      destinataireId: user._id,
      type: 'SYSTEME',
      canal: 'EMAIL',
      titre: subject,
      contenu: content
    });

    // Simulation envoi email
    await notification.markAsSent('simulated-email-id');

    return notification;
  }

  /**
   * Envoyer un SMS (si configuré)
   */
  async sendSMS(user, message) {
    // TODO: Intégrer Twilio
    console.log(`📱 SMS à ${user.telephone}: ${message}`);

    const notification = await Notification.create({
      destinataireId: user._id,
      type: 'SYSTEME',
      canal: 'SMS',
      titre: 'Notification OUFAREZ',
      contenu: message
    });

    // Simulation envoi SMS
    await notification.markAsSent('simulated-sms-id');

    return notification;
  }
}

module.exports = new NotificationService();
