module.exports = {
  // ... existing config ...
  experimental: {
    // ... other experimental options ...
    turbo: {
      // Add your Turbopack configuration here
    }
  },
  // Disable default favicon generation
  webpack: (config) => {
    config.plugins = config.plugins.filter(
      (plugin) => !['FaviconsWebpackPlugin', 'GenerateFaviconPlugin'].includes(plugin.constructor.name)
    );
    return config;
  },
}; 