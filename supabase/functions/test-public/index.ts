// @ts-nocheck
// Simple test function to check if public access works
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, authorization, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Simple test response
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Public API is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      test_data: {
        surveys: [
          { id: 'survey-001', title: 'Customer Satisfaction Survey' },
          { id: 'survey-002', title: 'Product Feedback Survey' },
          { id: 'survey-003', title: 'Employee Engagement Survey' }
        ]
      }
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
})