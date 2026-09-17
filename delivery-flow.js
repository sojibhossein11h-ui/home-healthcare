// Home Healthcare — Delivery private contact + chat helpers.
// These helpers work with the RLS-protected Supabase tables.
(() => {
  const sb = window.supabaseClient;
  if (!sb) return;

  window.getAssignedDeliveryContact = async (deliveryId) => {
    const { data, error } = await sb.from('delivery_private_contacts')
      .select('delivery_id, patient_phone')
      .eq('delivery_id', deliveryId)
      .single();
    if (error) throw error;
    return data;
  };

  window.sendDeliveryMessage = async (deliveryId, text) => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('LOGIN_REQUIRED');
    const message = String(text || '').trim();
    if (!message) throw new Error('MESSAGE_REQUIRED');
    const { data, error } = await sb.from('delivery_messages').insert({
      delivery_id: deliveryId,
      sender_id: user.id,
      message
    }).select('id,delivery_id,sender_id,message,created_at').single();
    if (error) throw error;
    return data;
  };

  window.loadDeliveryMessages = async (deliveryId) => {
    const { data, error } = await sb.from('delivery_messages')
      .select('id,delivery_id,sender_id,message,created_at')
      .eq('delivery_id', deliveryId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  };
})();
