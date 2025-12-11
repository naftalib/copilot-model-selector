# Setup Instructions for Auto-Update Feature

## What Was Implemented

Your extension now has **automatic update capability** for model data:

✅ **Local Data File**: `data/models.json` contains all model categories
✅ **Remote Updates**: Extension fetches updates from GitHub automatically
✅ **Version Control**: Uses semantic versioning to track updates
✅ **Configurable**: Users can customize update URL and frequency
✅ **Manual Refresh**: Sidebar refresh button checks for updates immediately

## How It Works

1. Extension loads data from local `data/models.json` on startup
2. Every 24 hours (configurable), it checks GitHub for updates
3. If a newer version is found, it downloads and applies the update
4. Users are notified when updates are applied

## Setting Up Your Data Repository

### Option 1: Use the Current Extension Data

The extension will work immediately with the included `data/models.json` file. No setup needed!

### Option 2: Create a GitHub Data Repository (Recommended)

1. **Create a new GitHub repository** (e.g., `copilot-model-selector-data`)

2. **Add the models.json file**:

   ```bash
   # Copy from your extension
   cp data/models.json /path/to/your/data/repo/models.json
   ```

3. **Commit and push to GitHub**:

   ```bash
   git add models.json
   git commit -m "Initial model data"
   git push
   ```

4. **Get the raw file URL**:

   - Go to your GitHub repo
   - Click on `models.json`
   - Click "Raw" button
   - Copy the URL (format: `https://raw.githubusercontent.com/username/repo/main/models.json`)

5. **Update the extension settings**:
   - Open VS Code Settings
   - Search for "AI Model Selector"
   - Set "Data Source URL" to your GitHub raw URL

### Option 3: Host Data Elsewhere

You can host `models.json` on any public URL:

- GitHub Gist
- GitLab
- Your own web server
- Any CDN

Just update the extension settings to point to your URL.

## Updating Model Data

### If Using GitHub:

1. Edit `models.json` in your repository
2. **Important**: Increment the `version` field (e.g., `1.0.0` → `1.0.1`)
3. Update the `lastUpdated` date
4. Commit and push

Within 24 hours, all users' extensions will automatically update!

### Version Format:

- **Patch** (1.0.0 → 1.0.1): Small updates, typo fixes
- **Minor** (1.0.0 → 1.1.0): New models, new categories
- **Major** (1.0.0 → 2.0.0): Breaking changes to data structure

## Configuration Options

Users can customize in VS Code Settings:

- **Data Source URL**: Where to fetch updates from
- **Auto Update**: Enable/disable automatic updates (default: true)
- **Update Interval**: Hours between checks (default: 24)

## Testing Updates

1. Make changes to your `models.json` on GitHub
2. In VS Code, click the refresh button in the AI Model Selector sidebar
3. You should see "Model data updated to latest version!"

## Current Configuration

The extension is currently configured to fetch from:

```
https://raw.githubusercontent.com/your-username/copilot-model-selector-data/main/models.json
```

**Replace `your-username` with your actual GitHub username when you create the data repository.**

## Next Steps

1. Create a GitHub repo for your data (optional but recommended)
2. Update the default URL in `package.json` or via VS Code settings
3. Install the new `.vsix` file: `copilot-model-selector-0.2.0.vsix`
4. Test the refresh button to verify it works

## For Contributors

If you want to accept community contributions:

1. Create a public GitHub repo with `models.json`
2. Add `DATA_REPO_README.md` to that repo
3. Accept PRs from community members with model updates
4. Review and merge updates - users get them automatically!
