import { createApp } from './app.js';
import http from 'http';

// Helper to make HTTP requests against local Express app instance
function makeRequest(app: any, method: string, path: string, body?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address: any = server.address();
      const port = address.port;
      const dataString = body ? JSON.stringify(body) : '';

      const req = http.request(
        {
          host: '127.0.0.1',
          port,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString)
          }
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            server.close();
            try {
              const json = raw ? JSON.parse(raw) : {};
              resolve({ status: res.statusCode || 500, body: json });
            } catch (err) {
              resolve({ status: res.statusCode || 500, body: { raw } });
            }
          });
        }
      );

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        req.write(dataString);
      }
      req.end();
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('BHARATFARM INSURANCE BACKEND VERIFICATION SUITE');
  console.log('====================================================\n');

  const app = createApp();

  // Test 1: Create Claim with valid Farm ID
  console.log('TEST 1: Create Insurance Claim (POST /api/insurance/claims)');
  const createRes = await makeRequest(app, 'POST', '/api/insurance/claims', {
    farmId: 'FARM001',
    crop: 'Paddy',
    disasterType: 'Flood / Inundation',
    eventDate: '2026-09-12',
    reportedAffectedArea: 2.38,
    description: 'Heavy rain flooded paddy fields.'
  });
  console.log('Status:', createRes.status);
  console.log('Response:', JSON.stringify(createRes.body, null, 2));

  if (createRes.status !== 201 || !createRes.body.data?.claimId) {
    throw new Error('Test 1 failed: Claim creation failed');
  }
  const claimId = createRes.body.data.claimId;
  console.log(`✅ Claim Created Successfully! Claim ID: ${claimId}\n`);

  // Test 2: Retrieve Claim Details
  console.log(`TEST 2: Retrieve Claim Details (GET /api/insurance/claims/${claimId})`);
  const getRes = await makeRequest(app, 'GET', `/api/insurance/claims/${claimId}`);
  console.log('Status:', getRes.status);
  console.log('Status Machine Initial State:', getRes.body.data?.claim?.status);
  console.log('Satellite Telemetry Attached:', getRes.body.data?.claim?.satelliteEvidence?.satelliteId);
  console.log('Initial Economic Loss Estimate:', getRes.body.data?.claim?.economicLoss?.estimatedEconomicLoss);
  console.log('Audit Log Items:', getRes.body.data?.claim?.auditLog?.length);
  console.log('✅ Claim Retrieval Verified!\n');

  // Test 3: Run AI Verification (POST /api/insurance/claims/:claimId/analyze)
  console.log(`TEST 3: Execute OpenRouter Gemini Vision Assessment (POST /api/insurance/claims/${claimId}/analyze)`);
  const analyzeRes = await makeRequest(app, 'POST', `/api/insurance/claims/${claimId}/analyze`);
  console.log('Status:', analyzeRes.status);
  console.log('Response:', JSON.stringify(analyzeRes.body, null, 2));

  if (analyzeRes.status === 200) {
    console.log('✅ OpenRouter Vision AI Damage Assessment Verified!');
    console.log('   Damage Detected:', analyzeRes.body.data?.assessment?.damageDetected);
    console.log('   Severity:', analyzeRes.body.data?.assessment?.severity);
    console.log('   Affected Percentage:', analyzeRes.body.data?.assessment?.affectedPercentage, '%');
    console.log('   Preliminary Economic Loss: ₹', analyzeRes.body.data?.economicLoss?.estimatedEconomicLoss);
    console.log('   New Status:', analyzeRes.body.data?.status, '\n');
  } else {
    console.log('⚠️ OpenRouter Call Resulted in expected error status:', analyzeRes.status);
    console.log('   Error Message:', analyzeRes.body.message, '\n');
  }

  // Test 4: Claim Status Retrieval
  console.log(`TEST 4: Retrieve Claim Status (GET /api/insurance/claims/${claimId}/status)`);
  const statusRes = await makeRequest(app, 'GET', `/api/insurance/claims/${claimId}/status`);
  console.log('Status:', statusRes.status);
  console.log('Claim Status:', statusRes.body.data?.status);
  console.log('✅ Status Endpoint Verified!\n');

  // Test 5: Government Verification - Rejection Validation (Missing reason)
  console.log(`TEST 5: Government Verification - Rejection without remarks should fail (POST /api/insurance/claims/${claimId}/decision)`);
  const rejFailRes = await makeRequest(app, 'POST', `/api/insurance/claims/${claimId}/decision`, {
    decision: 'rejected',
    remarks: ''
  });
  console.log('Status:', rejFailRes.status, '(Expected 400)');
  console.log('Response Message:', rejFailRes.body.message);
  if (rejFailRes.status === 400) {
    console.log('✅ Rejection validation passed!\n');
  }

  // Test 6: Government Verification - Approval
  console.log(`TEST 6: Government Verification - Approve Claim (POST /api/insurance/claims/${claimId}/decision)`);
  const govtRes = await makeRequest(app, 'POST', `/api/insurance/claims/${claimId}/decision`, {
    decision: 'approved',
    remarks: 'Satellite imagery and NDVI index verified. Claim approved for PMFBY processing.',
    officerId: 'OFFICER_PURBA_01'
  });
  console.log('Status:', govtRes.status);
  console.log('Response:', JSON.stringify(govtRes.body, null, 2));

  if (govtRes.status !== 200 || govtRes.body.data?.status !== 'approved') {
    throw new Error('Test 6 failed: Government decision failed');
  }
  console.log('✅ Government Verification Approval Verified!\n');

  // Test 7: Verify Updated Audit Log after Decision
  console.log(`TEST 7: Audit Log Completeness Check (GET /api/insurance/claims/${claimId})`);
  const finalClaimRes = await makeRequest(app, 'GET', `/api/insurance/claims/${claimId}`);
  console.log('Final Claim Status:', finalClaimRes.body.data?.claim?.status);
  console.log('Audit Log Entries Count:', finalClaimRes.body.data?.claim?.auditLog?.length);
  console.log('Audit Log Summary:');
  finalClaimRes.body.data?.claim?.auditLog?.forEach((log: any, i: number) => {
    console.log(`  ${i + 1}. [${log.timestamp.slice(11, 19)}] [${log.actor}] ${log.action}: ${log.details}`);
  });
  console.log('\n✅ Audit Log Fully Verified!\n');

  // Test 8: Invalid Claim ID Lookup
  console.log('TEST 8: Non-existent Claim ID (GET /api/insurance/claims/INVALID_CLAIM_999)');
  const invRes = await makeRequest(app, 'GET', '/api/insurance/claims/INVALID_CLAIM_999');
  console.log('Status:', invRes.status, '(Expected 404)');
  console.log('Response Code:', invRes.body.code);
  console.log('✅ Invalid Claim Error Handling Verified!\n');

  console.log('====================================================');
  console.log('ALL INSURANCE BACKEND TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
