/**
 * Application entry point
 *
 * This is the main JavaScript entry point for the Rails application.
 * It imports and initializes Stimulus controllers and the WebMCP polyfill.
 *
 * @see https://docs.mcp-b.ai/frameworks/rails
 */

// Import the WebMCP polyfill to enable navigator.modelContext
import '@mcp-b/global';

// Import Stimulus application and controllers
import './controllers';

console.log('WebMCP Rails application loaded');
