/**
 * demoService.js
 * Bundles 5 realistic sample log files for 1-click Demo Mode showcase.
 * Uploads sample files through the real Module 1 POST /api/upload endpoint.
 */

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:8000');

export const SAMPLE_LOGS = {
  java_npe: {
    id: 'java_npe',
    title: 'Java NullPointerException',
    category: 'Application Error',
    severity: 'HIGH',
    filename: 'sample_java_npe.log',
    description: 'NullPointerException in UserService during payment checkout request processing.',
    content: `2024-01-15 10:23:01 INFO  [main] com.app.server.Application - Starting application server on port 8080
2024-01-15 10:23:02 INFO  [main] com.app.config.AppConfig - Loaded database configuration from /etc/app/config.yml
2024-01-15 10:23:03 INFO  [main] com.app.db.HikariPool - Database pool initialized with 20 max connections
2024-01-15 10:23:04 INFO  [http-8080-1] com.app.controller.OrderController - Received checkout request for user_id=4521
2024-01-15 10:23:05 ERROR [http-8080-1] com.app.service.UserService - NullPointerException: Cannot invoke method getName() on null object reference
    at com.app.service.UserService.processUser(UserService.java:87)
    at com.app.controller.UserController.handleRequest(UserController.java:45)
    at com.app.middleware.AuthMiddleware.doFilter(AuthMiddleware.java:32)
    at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119)
2024-01-15 10:23:06 ERROR [http-8080-1] com.app.controller.OrderController - Request processing failed; nested exception is java.lang.NullPointerException
2024-01-15 10:23:07 INFO  [http-8080-1] com.app.service.TransactionManager - Rolling back active transaction for user_id=4521
2024-01-15 10:23:08 WARN  [http-8080-1] com.app.circuitbreaker.CircuitBreaker - Circuit breaker OPEN for UserService after 3 consecutive failures
`,
  },
  db_timeout: {
    id: 'db_timeout',
    title: 'Database Connection Timeout',
    category: 'Database / Infra',
    severity: 'CRITICAL',
    filename: 'sample_db_timeout.log',
    description: 'PostgreSQL connection pool exhaustion leading to query socket timeout.',
    content: `2024-01-15 14:15:00 INFO  [pool-1] com.app.db.HealthCheck - Database ping check succeeded (lat=1.2ms)
2024-01-15 14:15:10 WARN  [pool-1] com.app.db.HikariPool - Connection pool active connections: 20/20 (100% capacity)
2024-01-15 14:15:15 ERROR [pool-1] com.app.db.HikariPool - Connection is not available, request timed out after 30000ms.
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:162)
    at com.app.dao.UserRepository.findUserById(UserRepository.java:102)
2024-01-15 14:15:16 FATAL [main] com.app.server.Application - Unrecoverable database connectivity loss. Initiating graceful shutdown.
2024-01-15 14:15:17 INFO  [main] com.app.server.Application - Server shut down cleanly.
`,
  },
  auth_failure: {
    id: 'auth_failure',
    title: 'Authentication & Security Failure',
    category: 'Security',
    severity: 'HIGH',
    filename: 'sample_auth_failure.log',
    description: 'JWT signature verification failure and unauthorized access attempts.',
    content: `2024-01-15 11:00:01 INFO  [auth-service] AuthController - Login attempt for username=admin
2024-01-15 11:00:02 WARN  [auth-service] JwtTokenProvider - Invalid JWT signature detected from IP: 192.168.1.105
2024-01-15 11:00:03 ERROR [auth-service] SecurityFilter - UnauthorizedAccessException: Token expired or tampered
    at com.app.security.JwtAuthenticationFilter.doFilter(JwtAuthenticationFilter.java:64)
    at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:209)
2024-01-15 11:00:04 WARN  [auth-service] RateLimiter - IP 192.168.1.105 blocked for 15 minutes due to 5 consecutive auth failures
`,
  },
  python_traceback: {
    id: 'python_traceback',
    title: 'Python Django Traceback',
    category: 'Backend Microservice',
    severity: 'MEDIUM',
    filename: 'sample_python_traceback.log',
    description: 'Django KeyError in API payload parsing during analytics webhook processing.',
    content: `2024-01-15 16:30:10 [INFO] django.channels.server: HTTP GET /api/v1/analytics/ 200 [0.045s]
2024-01-15 16:30:12 [ERROR] django.request: Internal Server Error: /api/v1/webhooks/payment/
Traceback (most recent call last):
  File "/venv/lib/python3.11/site-packages/django/core/handlers/exception.py", line 55, in inner
    response = get_response(request)
  File "/app/webhooks/views.py", line 42, in process_payment
    customer_id = payload['data']['customer']['id']
KeyError: 'customer'
2024-01-15 16:30:13 [WARNING] webhooks.views: Webhook payload missing required key 'customer'
`,
  },
  oom_error: {
    id: 'oom_error',
    title: 'JVM OutOfMemoryError',
    category: 'Infrastructure',
    severity: 'CRITICAL',
    filename: 'sample_oom_error.log',
    description: 'Java heap space exhaustion during batch report generation.',
    content: `2024-01-15 03:00:00 INFO  [batch-job] ReportJob - Starting nightly PDF aggregation job
2024-01-15 03:02:15 WARN  [batch-job] MemoryMonitor - Heap usage: 3.8GB / 4.0GB (95%)
2024-01-15 03:02:30 FATAL [batch-job] com.app.batch.ReportGenerator - java.lang.OutOfMemoryError: Java heap space
    at com.app.batch.ReportGenerator.buildPdfBytes(ReportGenerator.java:142)
    at com.app.batch.ReportJob.execute(ReportJob.java:88)
2024-01-15 03:02:31 ERROR [main] System.err - Terminating JVM due to OutOfMemoryError (Exit code 137)
`,
  },
};

/**
 * Uploads a sample log file through the real Module 1 upload endpoint (POST /api/upload).
 */
export async function uploadSampleLog(sampleKey) {
  const sample = SAMPLE_LOGS[sampleKey];
  if (!sample) throw new Error(`Unknown sample key: ${sampleKey}`);

  const blob = new Blob([sample.content], { type: 'text/plain' });
  const file = new File([blob], sample.filename, { type: 'text/plain' });

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

/**
 * Runs the full pipeline: uploads sample log, triggers log parsing analysis,
 * and automatically triggers SRE AI report generation for all discovered incidents.
 */
export async function runFullDemoPipeline(sampleKey) {
  // 1. Upload
  const metadata = await uploadSampleLog(sampleKey);

  // 2. Parse (GET /api/analyze/{file_id})
  const parseRes = await fetch(`${API_BASE}/api/analyze/${metadata.file_id}`);
  if (!parseRes.ok) {
    throw new Error(`Log parsing failed with status ${parseRes.status}`);
  }
  const parseData = await parseRes.json();

  // 3. AI SRE Analysis for all discovered incidents (POST /api/ai/analyze/{incident_id})
  if (parseData && parseData.incidents && parseData.incidents.length > 0) {
    for (const incident of parseData.incidents) {
      try {
        await fetch(`${API_BASE}/api/ai/analyze/${incident.incident_id}`, {
          method: 'POST',
        });
      } catch (err) {
        console.error(`AI analysis failed for incident ${incident.incident_id}:`, err);
      }
    }
  }

  return metadata;
}
