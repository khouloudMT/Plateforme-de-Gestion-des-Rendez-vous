const Appointment = require('../models/Appointment');

async function updateAppointmentStatuses() {
    const now = new Date();
  
    // Expire les rendez-vous "pending" dont la date/heure sont passées
    await Appointment.updateMany(
      { status: 'pending', date: { $lt: now } },
      { $set: { status: 'expired' } }
    );
  
    // Complète les rendez-vous "confirmed" dont l'heure est dépassée de 30 minutes
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    await Appointment.updateMany(
      { status: 'confirmed', date: { $lt: thirtyMinutesAgo } },
      { $set: { status: 'completed' } }
    );
  };
  
module.exports = updateAppointmentStatuses;
