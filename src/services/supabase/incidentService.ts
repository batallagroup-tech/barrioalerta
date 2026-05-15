import { supabase } from '../../lib/supabase';
import { Incident } from '../../types';

const TABLE = 'incidents';

function toIncident(row: any): Incident {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userPhoto: row.user_photo,
    category: row.category,
    title: row.title,
    description: row.description,
    location: { lat: row.lat, lng: row.lng },
    timestamp: row.created_at,
    verifiedCount: row.verified_count ?? 0,
    reportCount: row.report_count ?? 0,
    imageUrl: row.image_url,
    imageUrls: row.image_urls,
    isSensitive: row.is_sensitive ?? false,
    isSOS: row.is_sos ?? false,
    broadcastRadiusKm: row.broadcast_radius_km,
    verifiedBy: row.verified_by ?? [],
  };
}

export const incidentService = {
  async uploadImage(file: File, userId: string): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('incidents')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('incidents')
      .getPublicUrl(path);

    return data.publicUrl;
  },
  async createIncident(
    data: Omit<Incident, 'id' | 'timestamp' | 'verifiedCount' | 'reportCount'>
  ): Promise<string | undefined> {
    
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: data.userId || null,
        user_name: data.userName,
        user_photo: data.userPhoto,
        category: data.category,
        title: data.title,
        description: data.description,
        lat: data.location.lat,
        lng: data.location.lng,
        image_url: data.imageUrl,
        image_urls: data.imageUrls,
        is_sensitive: data.isSensitive ?? false,
        is_sos: data.isSOS ?? false,
        broadcast_radius_km: data.broadcastRadiusKm,
        verified_count: 0,
        report_count: 0,
        verified_by: [],
      })
      .select('id')
      .single();
    if (error) {
      console.error('createIncident error:', JSON.stringify(error));
      throw error;
    }
    return row?.id;
  },

  async verifyIncident(incidentId: string, userId: string) {
    const { data: current } = await supabase
      .from(TABLE)
      .select('verified_count, verified_by')
      .eq('id', incidentId)
      .single();

    if (!current) return;
    const alreadyVerified = (current.verified_by ?? []).includes(userId);
    if (alreadyVerified) return;

    await supabase
      .from(TABLE)
      .update({
        verified_count: (current.verified_count ?? 0) + 1,
        verified_by: [...(current.verified_by ?? []), userId],
      })
      .eq('id', incidentId);
  },

  async reportIncident(incidentId: string, userId: string, reason: string) {
    const { data: current } = await supabase
      .from(TABLE)
      .select('report_count')
      .eq('id', incidentId)
      .single();

    if (!current) return;

    await supabase
      .from(TABLE)
      .update({ report_count: (current.report_count ?? 0) + 1 })
      .eq('id', incidentId);

    // Guardar detalle del reporte para revision
    await supabase
      .from('incident_reports')
      .insert({
        incident_id: incidentId,
        user_id: userId,
        reason: reason,
        created_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn('incident_reports table may not exist yet:', error.message);
      });
  },

  subscribeToIncidents(callback: (incidents: Incident[]) => void) {
    const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

    // Carga inicial
    supabase
      .from(TABLE)
      .select('*')
      .or('is_sensitive.eq.false,is_sos.eq.true')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) callback(data.map(toIncident));
      });

    // Realtime
    const channel = supabase
      .channel('incidents-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: TABLE,
      }, () => {
        supabase
          .from(TABLE)
          .select('*')
          .or('is_sensitive.eq.false,is_sos.eq.true')
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false })
          .limit(100)
          .then(({ data }) => {
            if (data) callback(data.map(toIncident));
          });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
  subscribeToIncidentChat(incidentId: string, callback: (messages: any[]) => void) {
    supabase
      .from('incident_messages')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => { if (data) callback(data); });

    const channel = supabase
      .channel(`incident-chat-${incidentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'incident_messages',
        filter: `incident_id=eq.${incidentId}`
      }, () => {
        supabase
          .from('incident_messages')
          .select('*')
          .eq('incident_id', incidentId)
          .order('created_at', { ascending: true })
          .limit(100)
          .then(({ data }) => { if (data) callback(data); });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};
