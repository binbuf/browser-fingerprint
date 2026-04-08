import type { ProtocolHandlerEntry } from './types';

export const protocolHandlerList: ProtocolHandlerEntry[] = [
  // Communication
  { scheme: 'zoommtg', applicationName: 'Zoom', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  { scheme: 'slack', applicationName: 'Slack', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  { scheme: 'discord', applicationName: 'Discord', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  { scheme: 'msteams', applicationName: 'Microsoft Teams', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  { scheme: 'skype', applicationName: 'Skype', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  { scheme: 'tg', applicationName: 'Telegram', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  { scheme: 'whatsapp', applicationName: 'WhatsApp', platforms: ['windows', 'macos'], category: 'communication' },
  { scheme: 'webex', applicationName: 'Webex', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  { scheme: 'mailto', applicationName: 'Default Email Client', platforms: ['windows', 'macos', 'linux'], category: 'communication' },
  
  // Development
  { scheme: 'vscode', applicationName: 'VS Code', platforms: ['windows', 'macos', 'linux'], category: 'development' },
  { scheme: 'jetbrains', applicationName: 'JetBrains Toolbox', platforms: ['windows', 'macos', 'linux'], category: 'development' },
  { scheme: 'subl', applicationName: 'Sublime Text', platforms: ['windows', 'macos', 'linux'], category: 'development' },
  { scheme: 'txmt', applicationName: 'TextMate', platforms: ['macos'], category: 'development' },
  { scheme: 'github-mac', applicationName: 'GitHub Desktop', platforms: ['macos'], category: 'development' },
  { scheme: 'github-windows', applicationName: 'GitHub Desktop', platforms: ['windows'], category: 'development' },
  { scheme: 'sourcetree', applicationName: 'Sourcetree', platforms: ['windows', 'macos'], category: 'development' },

  // Gaming
  { scheme: 'steam', applicationName: 'Steam', platforms: ['windows', 'macos', 'linux'], category: 'gaming' },
  { scheme: 'com.epicgames.launcher', applicationName: 'Epic Games', platforms: ['windows', 'macos'], category: 'gaming' },
  { scheme: 'battlenet', applicationName: 'Battle.net', platforms: ['windows', 'macos'], category: 'gaming' },
  { scheme: 'origin', applicationName: 'Origin', platforms: ['windows'], category: 'gaming' },
  { scheme: 'uplay', applicationName: 'Ubisoft Connect', platforms: ['windows'], category: 'gaming' },
  { scheme: 'goggalaxy', applicationName: 'GOG Galaxy', platforms: ['windows', 'macos'], category: 'gaming' },
  
  // Media
  { scheme: 'spotify', applicationName: 'Spotify', platforms: ['windows', 'macos', 'linux'], category: 'media' },
  { scheme: 'vlc', applicationName: 'VLC Media Player', platforms: ['windows', 'macos', 'linux'], category: 'media' },
  { scheme: 'itmss', applicationName: 'iTunes', platforms: ['windows', 'macos'], category: 'media' },
  { scheme: 'plex', applicationName: 'Plex', platforms: ['windows', 'macos', 'linux'], category: 'media' },
  { scheme: 'music', applicationName: 'Apple Music', platforms: ['macos'], category: 'media' },
  
  // Productivity
  { scheme: 'figma', applicationName: 'Figma', platforms: ['windows', 'macos'], category: 'productivity' },
  { scheme: 'notion', applicationName: 'Notion', platforms: ['windows', 'macos', 'linux'], category: 'productivity' },
  { scheme: 'obsidian', applicationName: 'Obsidian', platforms: ['windows', 'macos', 'linux'], category: 'productivity' },
  { scheme: 'onepassword', applicationName: '1Password', platforms: ['windows', 'macos', 'linux'], category: 'productivity' },
  { scheme: 'evernote', applicationName: 'Evernote', platforms: ['windows', 'macos'], category: 'productivity' },
  { scheme: 'trello', applicationName: 'Trello', platforms: ['windows', 'macos'], category: 'productivity' },
  { scheme: 'postman', applicationName: 'Postman', platforms: ['windows', 'macos', 'linux'], category: 'productivity' },
  
  // Other
  { scheme: 'teamviewer10', applicationName: 'TeamViewer', platforms: ['windows', 'macos', 'linux'], category: 'other' },
  { scheme: 'anydesk', applicationName: 'AnyDesk', platforms: ['windows', 'macos', 'linux'], category: 'other' },
  { scheme: 'magnet', applicationName: 'Torrent Client', platforms: ['windows', 'macos', 'linux'], category: 'other' },
  { scheme: 'alfred', applicationName: 'Alfred', platforms: ['macos'], category: 'other' }
];
