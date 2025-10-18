// Test webhook endpoint with proper Clerk format
import 'dotenv/config';
import fetch from 'node-fetch';

const testWebhookEndpoint = async () => {
    try {
        const webhookUrl = 'https://job-portal-server-one-blush.vercel.app/webhooks';
        
        // Simulate Clerk webhook payload (exact format)
        const mockPayload = {
            data: {
                id: 'user_test_789',
                email_addresses: [{
                    email_address: 'webhook-test@example.com'
                }],
                first_name: 'Webhook',
                last_name: 'Test',
                image_url: 'https://example.com/webhook-test.jpg'
            },
            type: 'user.created'
        };

        console.log('Testing webhook endpoint...');
        console.log('URL:', webhookUrl);
        console.log('Payload:', JSON.stringify(mockPayload, null, 2));

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'svix-id': 'test-id-123',
                'svix-timestamp': Date.now().toString(),
                'svix-signature': 'test-signature'
            },
            body: JSON.stringify(mockPayload)
        });

        const result = await response.text();
        console.log('Response status:', response.status);
        console.log('Response body:', result);

        if (response.status === 200) {
            console.log('✅ Webhook test successful!');
        } else {
            console.log('❌ Webhook test failed');
        }

    } catch (error) {
        console.error('Error testing webhook:', error);
    }
};

testWebhookEndpoint();
