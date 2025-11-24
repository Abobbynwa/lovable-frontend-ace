import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is teacher or admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    if (!userRoles.includes('teacher') && !userRoles.includes('admin')) {
      throw new Error('Only teachers and admins can send notifications');
    }

    const { userIds, title, message, type, sendEmail } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }

    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    // Create in-app notifications
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type: type || 'info',
      read: false
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      throw error;
    }

    // Send emails if requested
    if (sendEmail) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email, name')
        .in('id', userIds);

      if (profiles && profiles.length > 0) {
        for (const profile of profiles) {
          try {
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev",
                to: [profile.email],
                subject: title,
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>${title}</h2>
                    <p>${message}</p>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                      This is an automated notification from School Management Portal.
                    </p>
                  </div>
                `
              })
            });
            
            if (!emailResponse.ok) {
              throw new Error(`Email API error: ${await emailResponse.text()}`);
            }
          } catch (emailError) {
            console.error(`Failed to send email to ${profile.email}:`, emailError);
          }
        }
      }
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'notification_sent',
      resource_type: 'notification',
      details: { title, recipientCount: userIds.length, sendEmail }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${userIds.length} users`,
        data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});