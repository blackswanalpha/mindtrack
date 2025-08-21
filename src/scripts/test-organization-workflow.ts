#!/usr/bin/env tsx

/**
 * Test script for the organization/member workflow system
 * This script tests the complete workflow from database initialization to API endpoints
 */

import { initializeDatabase } from '@/lib/db-init';
import { OrganizationService } from '@/lib/organization-service';
import { 
  createOrganization,
  getUserOrganizations,
  getOrganizationMembers,
  createInvitation,
  acceptInvitation,
  checkUserPermission
} from '@/lib/organization-db';
import { createAuditLog, createNotification } from '@/lib/audit-utils';
import { testEmailConfiguration } from '@/lib/email-service';

interface TestUser {
  id: number;
  name: string;
  email: string;
}

interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  data?: any;
}

class OrganizationWorkflowTester {
  private results: TestResult[] = [];
  private testUsers: TestUser[] = [
    { id: 1, name: 'John Owner', email: 'john@example.com' },
    { id: 2, name: 'Jane Admin', email: 'jane@example.com' },
    { id: 3, name: 'Bob Member', email: 'bob@example.com' },
    { id: 4, name: 'Alice Viewer', email: 'alice@example.com' }
  ];

  private async runTest(testName: string, testFn: () => Promise<any>): Promise<void> {
    try {
      console.log(`Running test: ${testName}`);
      const data = await testFn();
      this.results.push({ test: testName, success: true, data });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.results.push({ 
        test: testName, 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      console.log(`❌ ${testName} - FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Organization Workflow Tests\n');

    // Test 1: Database Initialization
    await this.runTest('Database Initialization', async () => {
      const success = await initializeDatabase();
      if (!success) {
        throw new Error('Database initialization failed');
      }
      return { initialized: true };
    });

    // Test 2: Email Configuration
    await this.runTest('Email Configuration', async () => {
      const isValid = await testEmailConfiguration();
      return { emailConfigured: isValid };
    });

    // Test 3: Organization Creation
    let testOrganization: any;
    await this.runTest('Organization Creation', async () => {
      testOrganization = await createOrganization({
        name: 'Test Healthcare Organization',
        description: 'A test organization for healthcare research',
        type: 'healthcare',
        contact_email: 'contact@testhealthcare.com',
        contact_phone: '+1-555-0123',
        address: '123 Test Street, Test City, TC 12345'
      }, this.testUsers[0].id);

      if (!testOrganization || !testOrganization.id) {
        throw new Error('Organization creation failed');
      }

      return testOrganization;
    });

    // Test 4: User Organizations Retrieval
    await this.runTest('User Organizations Retrieval', async () => {
      const organizations = await getUserOrganizations(this.testUsers[0].id);
      
      if (organizations.length === 0) {
        throw new Error('No organizations found for user');
      }

      if (organizations[0].id !== testOrganization.id) {
        throw new Error('Retrieved organization does not match created organization');
      }

      return { organizationCount: organizations.length, organizations };
    });

    // Test 5: Permission Checking
    await this.runTest('Permission Checking', async () => {
      const ownerPermission = await checkUserPermission(testOrganization.id, this.testUsers[0].id);
      
      if (!ownerPermission.hasAccess || ownerPermission.role !== 'owner') {
        throw new Error('Owner permissions not set correctly');
      }

      const nonMemberPermission = await checkUserPermission(testOrganization.id, this.testUsers[1].id);
      
      if (nonMemberPermission.hasAccess) {
        throw new Error('Non-member should not have access');
      }

      return { ownerPermission, nonMemberPermission };
    });

    // Test 6: Member Invitation
    let testInvitation: any;
    await this.runTest('Member Invitation', async () => {
      testInvitation = await createInvitation(testOrganization.id, {
        email: this.testUsers[1].email,
        role: 'admin'
      }, this.testUsers[0].id);

      if (!testInvitation || !testInvitation.token) {
        throw new Error('Invitation creation failed');
      }

      return testInvitation;
    });

    // Test 7: Invitation Acceptance
    await this.runTest('Invitation Acceptance', async () => {
      const result = await acceptInvitation(testInvitation.token, this.testUsers[1].id);
      
      if (!result.success || !result.member) {
        throw new Error('Invitation acceptance failed');
      }

      return result;
    });

    // Test 8: Organization Members Retrieval
    await this.runTest('Organization Members Retrieval', async () => {
      const members = await getOrganizationMembers(testOrganization.id);
      
      if (members.length !== 2) {
        throw new Error(`Expected 2 members, got ${members.length}`);
      }

      const owner = members.find(m => m.role === 'owner');
      const admin = members.find(m => m.role === 'admin');

      if (!owner || !admin) {
        throw new Error('Expected owner and admin members');
      }

      return { memberCount: members.length, members };
    });

    // Test 9: Multiple Invitations
    await this.runTest('Multiple Invitations', async () => {
      const memberInvitation = await createInvitation(testOrganization.id, {
        email: this.testUsers[2].email,
        role: 'member'
      }, this.testUsers[1].id);

      const viewerInvitation = await createInvitation(testOrganization.id, {
        email: this.testUsers[3].email,
        role: 'viewer'
      }, this.testUsers[1].id);

      // Accept both invitations
      const memberResult = await acceptInvitation(memberInvitation.token, this.testUsers[2].id);
      const viewerResult = await acceptInvitation(viewerInvitation.token, this.testUsers[3].id);

      if (!memberResult.success || !viewerResult.success) {
        throw new Error('Failed to accept multiple invitations');
      }

      return { memberInvitation, viewerInvitation, memberResult, viewerResult };
    });

    // Test 10: Final Member Count
    await this.runTest('Final Member Count', async () => {
      const members = await getOrganizationMembers(testOrganization.id);
      
      if (members.length !== 4) {
        throw new Error(`Expected 4 members, got ${members.length}`);
      }

      const roleCount = {
        owner: members.filter(m => m.role === 'owner').length,
        admin: members.filter(m => m.role === 'admin').length,
        member: members.filter(m => m.role === 'member').length,
        viewer: members.filter(m => m.role === 'viewer').length
      };

      if (roleCount.owner !== 1 || roleCount.admin !== 1 || roleCount.member !== 1 || roleCount.viewer !== 1) {
        throw new Error('Incorrect role distribution');
      }

      return { totalMembers: members.length, roleCount, members };
    });

    // Test 11: Audit Logging
    await this.runTest('Audit Logging', async () => {
      const auditLog = await createAuditLog({
        user_id: this.testUsers[0].id,
        organization_id: testOrganization.id,
        action: 'test_workflow_completed',
        entity_type: 'organization',
        entity_id: testOrganization.id,
        details: { test: 'workflow_test', timestamp: new Date().toISOString() }
      });

      if (!auditLog || !auditLog.id) {
        throw new Error('Audit log creation failed');
      }

      return auditLog;
    });

    // Test 12: Notification System
    await this.runTest('Notification System', async () => {
      const notification = await createNotification({
        user_id: this.testUsers[1].id,
        organization_id: testOrganization.id,
        title: 'Test Workflow Completed',
        message: 'The organization workflow test has been completed successfully.',
        type: 'system',
        entity_type: 'organization',
        entity_id: testOrganization.id
      });

      if (!notification || !notification.id) {
        throw new Error('Notification creation failed');
      }

      return notification;
    });

    // Test 13: Organization Service Integration
    await this.runTest('Organization Service Integration', async () => {
      // Test creating organization through service
      const serviceOrg = await OrganizationService.createOrganization({
        name: 'Service Test Organization',
        description: 'Created through OrganizationService',
        type: 'research'
      }, this.testUsers[0].id);

      if (!serviceOrg || !serviceOrg.id) {
        throw new Error('Service organization creation failed');
      }

      // Test inviting member through service
      const serviceInvitation = await OrganizationService.inviteMember(
        serviceOrg.id,
        {
          email: this.testUsers[2].email,
          role: 'member'
        },
        this.testUsers[0].id
      );

      if (!serviceInvitation || !serviceInvitation.token) {
        throw new Error('Service invitation failed');
      }

      return { serviceOrg, serviceInvitation };
    });

    this.printResults();
  }

  private printResults(): void {
    console.log('\n📊 Test Results Summary');
    console.log('========================');

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.error}`);
        });
    }

    console.log('\n✅ Passed Tests:');
    this.results
      .filter(r => r.success)
      .forEach(r => {
        console.log(`  - ${r.test}`);
      });

    if (passed === total) {
      console.log('\n🎉 All tests passed! The organization workflow system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Run the tests
async function main() {
  const tester = new OrganizationWorkflowTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { OrganizationWorkflowTester };
