# Handling Concurrent Reservations

To handle concurrent concert reservations, I will use the following approaches

1. **Locking**:
   - Use database row-level locking (I choose Pessimistic Locking) to lock the row while a reservation is being processed.
   - This prevents other transactions from modifying the same row until the lock is released.

2. **Message Queue**:
   - When a user requests a reservation, the request is placed in a queue and processed sequentially.
   - This ensures orderly handling of concurrent requests.

3. **Real-Time Updates of Available Seats to Users**:
   - Implement WebSockets to provide real-time updates to users about seat availability.
   - This ensures that users are notified of available concerts in real time.
