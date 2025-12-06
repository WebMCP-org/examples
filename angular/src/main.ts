/**
 * Angular WebMCP Example Application
 *
 * Entry point for the Angular application with WebMCP integration.
 *
 * @see https://docs.mcp-b.ai/frameworks/angular
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch((err) => console.error(err));
