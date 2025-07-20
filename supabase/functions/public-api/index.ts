import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key required" }), 
      { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // Create Supabase service client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Validate API key and get salon_id
    const { data: keyValidation } = await supabase.rpc('validate_api_key', {
      _key_hash: apiKey,
      _permissions: getRequiredPermissions(req.method, url.pathname)
    });

    if (!keyValidation?.is_valid) {
      return new Response(
        JSON.stringify({ error: "Invalid API key or insufficient permissions" }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const salonId = keyValidation.salon_id;

    // Log API request
    await supabase.from('api_logs').insert({
      salon_id: salonId,
      endpoint: url.pathname,
      method: req.method,
      ip_address: req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for"),
      user_agent: req.headers.get("user-agent"),
      execution_time_ms: 0 // Will be updated later
    });

    // Route API requests
    const startTime = Date.now();
    let response;

    if (url.pathname.startsWith("/api/v1/clients")) {
      response = await handleClientsAPI(req, supabase, salonId);
    } else if (url.pathname.startsWith("/api/v1/appointments")) {
      response = await handleAppointmentsAPI(req, supabase, salonId);
    } else if (url.pathname.startsWith("/api/v1/services")) {
      response = await handleServicesAPI(req, supabase, salonId);
    } else if (url.pathname.startsWith("/api/v1/analytics")) {
      response = await handleAnalyticsAPI(req, supabase, salonId);
    } else {
      response = new Response(
        JSON.stringify({ error: "Endpoint not found" }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const executionTime = Date.now() - startTime;

    return response;
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function getRequiredPermissions(method: string, pathname: string): string[] {
  const resource = pathname.split('/')[3]; // Extract resource from /api/v1/{resource}
  
  if (method === "GET") {
    return [`read:${resource}`];
  } else if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return [`write:${resource}`];
  }
  
  return [];
}

async function handleClientsAPI(req: Request, supabase: any, salonId: string) {
  const url = new URL(req.url);
  
  if (req.method === "GET") {
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const search = url.searchParams.get("search");
    
    let query = supabase
      .from('clients')
      .select('id, first_name, last_name, email, phone, created_at, last_visit_date, total_visits, total_spent')
      .eq('salon_id', salonId)
      .range(offset, offset + limit - 1);
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%, last_name.ilike.%${search}%, phone.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ data, count: data?.length || 0 }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  if (req.method === "POST") {
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...body, salon_id: salonId })
      .select()
      .single();
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ data }), 
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  return new Response(
    JSON.stringify({ error: "Method not allowed" }), 
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleAppointmentsAPI(req: Request, supabase: any, salonId: string) {
  const url = new URL(req.url);
  
  if (req.method === "GET") {
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const status = url.searchParams.get("status");
    
    let query = supabase
      .from('appointments')
      .select(`
        id, scheduled_date, scheduled_time, status, price, notes,
        clients(id, first_name, last_name, phone),
        pets(id, name, breed),
        services(id, name, duration_minutes)
      `)
      .eq('salon_id', salonId);
    
    if (startDate) query = query.gte('scheduled_date', startDate);
    if (endDate) query = query.lte('scheduled_date', endDate);
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ data }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  if (req.method === "POST") {
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({ ...body, salon_id: salonId })
      .select()
      .single();
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ data }), 
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  return new Response(
    JSON.stringify({ error: "Method not allowed" }), 
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleServicesAPI(req: Request, supabase: any, salonId: string) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, base_price, duration_minutes, is_active')
      .eq('salon_id', salonId)
      .eq('is_active', true);
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ data }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  return new Response(
    JSON.stringify({ error: "Method not allowed" }), 
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleAnalyticsAPI(req: Request, supabase: any, salonId: string) {
  const url = new URL(req.url);
  
  if (req.method === "GET" && url.pathname.includes("/revenue")) {
    const startDate = url.searchParams.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = url.searchParams.get("end_date") || new Date().toISOString().split('T')[0];
    
    const { data: kpiData } = await supabase.rpc('calculate_salon_kpi', {
      salon_uuid: salonId,
      start_date: startDate,
      end_date: endDate
    });
    
    return new Response(
      JSON.stringify({ data: kpiData }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  return new Response(
    JSON.stringify({ error: "Endpoint not found" }), 
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}