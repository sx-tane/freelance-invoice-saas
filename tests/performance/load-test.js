import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

// Test options
export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['rate<0.1'],              // Custom error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.yourdomain.com';

// Test data
const users = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
];

export default function () {
  // Test homepage load
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test API health endpoint
  response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test login endpoint
  const user = users[Math.floor(Math.random() * users.length)];
  response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  let token = null;
  if (check(response, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  })) {
    if (response.status === 200) {
      token = JSON.parse(response.body).token;
    }
  } else {
    errorRate.add(1);
  }

  sleep(1);

  // If login successful, test authenticated endpoints
  if (token) {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Test dashboard
    response = http.get(`${BASE_URL}/api/dashboard`, { headers });
    check(response, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard response time <1s': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    sleep(1);

    // Test invoices list
    response = http.get(`${BASE_URL}/api/invoices`, { headers });
    check(response, {
      'invoices status is 200': (r) => r.status === 200,
      'invoices response time <1s': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    sleep(1);

    // Test creating an invoice
    const newInvoice = {
      client_id: 1,
      items: [
        { description: 'Test service', quantity: 1, rate: 100 }
      ],
      due_date: '2024-12-31'
    };

    response = http.post(`${BASE_URL}/api/invoices`, JSON.stringify(newInvoice), { headers });
    check(response, {
      'create invoice status is 201': (r) => r.status === 201,
      'create invoice response time <2s': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);
  }

  sleep(2);
}

// Setup function - runs once per VU
export function setup() {
  // Could be used to create test data, get auth tokens, etc.
  console.log('Starting load test...');
}

// Teardown function - runs once at the end of the test
export function teardown(data) {
  console.log('Load test completed');
}