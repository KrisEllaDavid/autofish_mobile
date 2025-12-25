// Event Emitter for cross-component communication
// This allows components to emit and listen to data change events

type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  // Subscribe to an event
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event)!.push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  // Unsubscribe from an event
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit an event
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  // Clear all listeners for an event
  clear(event: string): void {
    this.events.delete(event);
  }

  // Clear all listeners
  clearAll(): void {
    this.events.clear();
  }
}

// Create singleton instance
export const appEvents = new EventEmitter();

// Event types for type safety
export const APP_EVENTS = {
  // Publication events
  PUBLICATION_LIKED: 'publication:liked',
  PUBLICATION_UNLIKED: 'publication:unliked',
  PUBLICATION_COMMENTED: 'publication:commented',
  PUBLICATION_CREATED: 'publication:created',
  PUBLICATION_UPDATED: 'publication:updated',
  PUBLICATION_DELETED: 'publication:deleted',

  // Chat events
  CHAT_NEW_MESSAGE: 'chat:new_message',
  CHAT_MESSAGE_READ: 'chat:message_read',
  CHAT_CREATED: 'chat:created',

  // User events
  PROFILE_UPDATED: 'profile:updated',
  AVATAR_UPDATED: 'avatar:updated',

  // Feed events
  FEED_REFRESH: 'feed:refresh',
  FAVORITES_REFRESH: 'favorites:refresh',
} as const;

export type AppEventType = typeof APP_EVENTS[keyof typeof APP_EVENTS];
