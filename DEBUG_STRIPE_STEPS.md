# Debug Stripe Connection - Step by Step

## Steps to Find the Error

1. **Click on `/api/checkout` function** in the Resources tab
2. You'll see:
   - **Logs** - Runtime logs from when the function runs
   - **Metrics** - Performance data
   - **Settings** - Function configuration

3. **To see the actual error:**
   - Look at the **Logs** section
   - Try to checkout in your app
   - The logs will show in real-time
   - Look for error messages related to Stripe

## What to Look For in Logs

When you try checkout, you should see:
- `Stripe key prefix: sk_test_` - Confirms the key is loaded
- `Creating Stripe checkout session with X items` - Shows function is running
- **Error messages** - This is what we need to see!

## Common Error Messages

- `No such API key` - Invalid API key
- `Invalid API Key` - Key expired or wrong
- `ECONNREFUSED` or `network` - Connection issue
- `Request was retried 2 times` - Network timeout

## Next Steps

1. Click `/api/checkout` now
2. Try checkout in your app
3. Watch the logs appear
4. Copy the error message you see
5. Share it with me so I can fix it!

