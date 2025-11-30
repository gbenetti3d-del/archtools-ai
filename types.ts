export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 data URL for UI display
  isStreaming?: boolean;
}

export interface CompanyConfig {
  companyName: string;
  tone: 'formal' | 'welcoming' | 'minimalist' | 'innovative';
  context: string; // The "feeding" data
  websiteUrl?: string;
}

export interface UserProfile {
  name: string;
  company: string;
  project: string; // Project Name
  clientType: 'new' | 'existing';
  // Specific fields for new clients
  projectType?: string; // e.g. Residential, Commercial
  projectStage?: string; // e.g. Blueprint, Launch
  additionalInfo?: string; // Specific goals/needs
}

export interface EmailLog {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  body: string;
  type: 'lead' | 'report';
}

export interface UIConfig {
  fontSize: 'small' | 'normal' | 'large';
}

export enum ViewState {
  CONFIG = 'CONFIG',
  START = 'START',
  SPLASH = 'SPLASH',
  REGISTER = 'REGISTER',
  CHAT = 'CHAT'
}