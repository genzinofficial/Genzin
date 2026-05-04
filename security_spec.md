# Security Specification

## Data Invariants
1. A user profile must match the authenticated `uid`.
2. An order must belong to a valid user and cannot be modified by other users.
3. Orders once 'completed' cannot be modified by users.

## The Dirty Dozen Payloads
1. Spoof User ID: { userId: "attacker-id", email: "victim@example.com" }
2. Unauthorized Order Read: Attempting to list orders without user filter.
3. Order Hijack: Updating `order.userId` to a different UID.
4. Status Skip: Directly setting status to 'completed' without payment.
5. Large String Attack: 2MB string in `displayName`.
6. Shadow Fields: Adding `isAdmin: true` to a user document.
7. Future Date: Setting `createdAt` to year 3000.
8. Email Spoof: Using a non-verified email for admin access.
9. Delete User Profile: Attacker deleting someone else's profile.
10. Collection Scraping: Trying to read `/users` without document ID.
11. Orphaned Order: Creating an order for a non-existent user.
12. Identity Integrity: Changing `email` field after creation.

## Test Strategy
Testing will be performed via rules simulator and manual verification of denied operations.
