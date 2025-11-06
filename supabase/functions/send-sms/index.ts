import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  announcementId: string;
  targetLevel: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing required configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { announcementId, targetLevel }: SMSRequest = await req.json();

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get announcement details
    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .select('title, content')
      .eq('id', announcementId)
      .single();

    if (announcementError || !announcement) {
      console.error('Failed to fetch announcement:', announcementError);
      return new Response(
        JSON.stringify({ error: 'Announcement not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query for students based on target level
    let studentsQuery = supabase
      .from('students')
      .select('profiles!inner(phone_number, full_name)')
      .not('profiles.phone_number', 'is', null);

    if (targetLevel !== 'all') {
      studentsQuery = studentsQuery.eq('level', targetLevel);
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) {
      console.error('Failed to fetch students:', studentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch students' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!students || students.length === 0) {
      console.log('No students found with phone numbers for target level:', targetLevel);
      return new Response(
        JSON.stringify({ message: 'No students found with phone numbers', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare SMS message
    const smsMessage = `PLASU ALERT: ${announcement.title}\n\n${announcement.content}`;
    const twilioAuthHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    let successCount = 0;
    let failureCount = 0;

    // Send SMS to each student
    for (const student of students) {
      const phoneNumber = student.profiles?.phone_number;
      
      if (!phoneNumber) continue;

      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuthHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: phoneNumber,
            Body: smsMessage,
          }),
        });

        if (response.ok) {
          successCount++;
          console.log(`SMS sent successfully to ${phoneNumber}`);
        } else {
          const errorData = await response.text();
          console.error(`Failed to send SMS to ${phoneNumber}:`, errorData);
          failureCount++;
        }
      } catch (error) {
        console.error(`Error sending SMS to ${phoneNumber}:`, error);
        failureCount++;
      }
    }

    console.log(`SMS sending complete. Success: ${successCount}, Failures: ${failureCount}`);

    return new Response(
      JSON.stringify({
        message: 'SMS sending completed',
        sent: successCount,
        failed: failureCount,
        total: students.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-sms function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});