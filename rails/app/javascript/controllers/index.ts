/**
 * Stimulus controllers registration
 *
 * This file initializes the Stimulus application and registers all controllers.
 * In a full Rails app, controllers are often auto-loaded, but for this demo
 * we register them explicitly.
 */

import { Application } from '@hotwired/stimulus';
import BookmarksWebmcpController from './bookmarks_webmcp_controller';

const application = Application.start();

// Register the WebMCP bookmarks controller
application.register('bookmarks-webmcp', BookmarksWebmcpController);

export { application };
