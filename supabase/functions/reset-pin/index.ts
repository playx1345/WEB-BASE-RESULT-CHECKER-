import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "request_reset" | "verify_reset";
  matric_number: string;
  method?: "sms" | "email";
  token?: string;
  new_pin?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    console.log("PIN Reset request:", { action: body.action, matric: body.matric_number, method: body.method });

    if (body.action === "request_reset") {
      // Step 1: Request a PIN reset
      const { data: tokenData, error: tokenError } = await supabase
        .rpc("create_pin_reset_token", { p_matric_number: body.matric_number });

      if (tokenError) {
        console.error("Error creating reset token:", tokenError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create reset token" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = tokenData as { 
        success: boolean; 
        error?: string; 
        token?: string; 
        phone_number?: string;
        email?: string;
        full_name?: string;
      };

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error || "Student not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const resetCode = result.token!;
      const phoneNumber = result.phone_number;
      const email = result.email;
      const fullName = result.full_name || "Student";

      // Send via SMS if phone number available and method is SMS
      if (body.method === "sms" && phoneNumber) {
        const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
          console.error("Twilio credentials not configured");
          return new Response(
            JSON.stringify({ success: false, error: "SMS service not configured" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const message = `PLAPOLY CS Dept: Your PIN reset code is ${resetCode}. This code expires in 15 minutes. Do not share this code with anyone.`;

        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
          
          const formData = new URLSearchParams();
          formData.append("To", phoneNumber);
          formData.append("From", twilioPhoneNumber);
          formData.append("Body", message);

          const smsResponse = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${authHeader}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          });

          if (!smsResponse.ok) {
            const errorText = await smsResponse.text();
            console.error("Twilio error:", errorText);
            return new Response(
              JSON.stringify({ success: false, error: "Failed to send SMS" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.log("SMS sent successfully to:", phoneNumber.substring(0, 6) + "****");
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Reset code sent via SMS",
              method: "sms",
              masked_contact: phoneNumber.substring(0, 3) + "****" + phoneNumber.slice(-2)
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (smsError) {
          console.error("SMS sending error:", smsError);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to send SMS" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // If no phone or method is email, return info for admin contact
      // In a production system, you'd integrate with an email service here
      console.log("Reset code generated for:", body.matric_number);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: phoneNumber 
            ? "Reset code sent via SMS" 
            : "No phone number on file. Please contact the ICT department.",
          method: phoneNumber ? "sms" : "contact_admin",
          has_phone: !!phoneNumber,
          has_email: !!email
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (body.action === "verify_reset") {
      // Step 2: Verify code and reset PIN
      if (!body.token || !body.new_pin) {
        return new Response(
          JSON.stringify({ success: false, error: "Token and new PIN are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate PIN format (6 digits)
      if (!/^\d{6}$/.test(body.new_pin)) {
        return new Response(
          JSON.stringify({ success: false, error: "PIN must be exactly 6 digits" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: resetResult, error: resetError } = await supabase
        .rpc("verify_and_reset_pin", {
          p_matric_number: body.matric_number,
          p_token: body.token,
          p_new_pin: body.new_pin
        });

      if (resetError) {
        console.error("Error resetting PIN:", resetError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to reset PIN" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = resetResult as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error || "Invalid or expired reset code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("PIN reset successful for:", body.matric_number);

      return new Response(
        JSON.stringify({ success: true, message: "PIN reset successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("PIN Reset error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
