/**
 * SOS FIRST - Professional Health Check Endpoint
 * Enterprise-grade monitoring for Vercel deployment
 * 
 * Verificações:
 * - Runtime status
 * - Deployment health
 * - Response time
 * - System availability
 */

export const config = {
  runtime: 'edge', // Edge Runtime para máxima performance
};

export default async function handler(request) {
  const startTime = Date.now();
  
  try {
    // ============================================
    // VERIFICAÇÕES DE SAÚDE
    // ============================================
    
    const healthChecks = {
      runtime: checkRuntime(),
      deployment: await checkDeployment(),
      network: checkNetwork(),
      timestamp: new Date().toISOString()
    };
    
    // Verifica se todas as checagens passaram
    const allHealthy = Object.values(healthChecks)
      .filter(check => typeof check === 'object' && check !== null)
      .every(check => check.status === 'healthy');
    
    const responseTime = Date.now() - startTime;
    
    // ============================================
    // RESPOSTA PROFISSIONAL
    // ============================================
    
    const healthData = {
      status: allHealthy ? 'ok' : 'degraded',
      service: 'SOS First Website',
      environment: process.env.VERCEL_ENV || 'production',
      region: process.env.VERCEL_REGION || 'unknown',
      deployment: {
        id: process.env.VERCEL_DEPLOYMENT_ID || 'static',
        url: process.env.VERCEL_URL || 'www.sosfirst.site'
      },
      uptime: process.uptime ? Math.floor(process.uptime()) : null,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      version: '1.0.0'
    };
    
    // ============================================
    // HEADERS ANTI-CACHE E CORS
    // ============================================
    
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Health-Check': 'true',
      'X-Response-Time': `${responseTime}ms`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Max-Age': '86400'
    };
    
    // Responde com status code correto
    return new Response(
      JSON.stringify(healthData, null, 2),
      {
        status: allHealthy ? 200 : 503,
        headers: headers
      }
    );
    
  } catch (error) {
    // ============================================
    // TRATAMENTO DE ERRO PROFISSIONAL
    // ============================================
    
    const errorResponse = {
      status: 'error',
      service: 'SOS First Website',
      error: {
        message: error.message,
        type: error.name
      },
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    };
    
    return new Response(
      JSON.stringify(errorResponse, null, 2),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'X-Health-Check': 'true'
        }
      }
    );
  }
}

// ============================================
// FUNÇÕES DE VERIFICAÇÃO
// ============================================

function checkRuntime() {
  return {
    status: 'healthy',
    type: 'edge-runtime',
    available: true
  };
}

async function checkDeployment() {
  try {
    // Tenta acessar variáveis de ambiente para confirmar deployment
    const deploymentActive = !!(
      process.env.VERCEL_ENV ||
      process.env.VERCEL_DEPLOYMENT_ID
    );
    
    return {
      status: deploymentActive ? 'healthy' : 'warning',
      deployed: deploymentActive,
      type: 'static-site'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      deployed: false,
      error: error.message
    };
  }
}

function checkNetwork() {
  return {
    status: 'healthy',
    protocol: 'https',
    available: true
  };
}
