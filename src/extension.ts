// extension.ts
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

interface ModelRecommendation {
  category: string
  models: string[]
  examples: string[]
}

interface ModelDataConfig {
  version: string
  lastUpdated: string
  categories: ModelRecommendation[]
}

// Configuration for remote data source
const REMOTE_DATA_URL =
  'https://raw.githubusercontent.com/naftalib/copilot-model-selector-data/main/models.json'
const CHECK_UPDATE_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

let modelData: ModelRecommendation[] = []

// Load model data from local JSON file
function loadLocalModelData(
  context: vscode.ExtensionContext
): ModelRecommendation[] {
  try {
    const dataPath = path.join(context.extensionPath, 'data', 'models.json')
    const fileContent = fs.readFileSync(dataPath, 'utf8')
    const config: ModelDataConfig = JSON.parse(fileContent)
    return config.categories
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load model data: ${error}`)
    return []
  }
}

// Fetch updated model data from GitHub
async function fetchRemoteModelData(): Promise<ModelDataConfig | null> {
  return new Promise((resolve) => {
    https
      .get(REMOTE_DATA_URL, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          try {
            const config: ModelDataConfig = JSON.parse(data)
            resolve(config)
          } catch (error) {
            console.error('Failed to parse remote data:', error)
            resolve(null)
          }
        })
      })
      .on('error', (error) => {
        console.error('Failed to fetch remote data:', error)
        resolve(null)
      })
  })
}

// Check for and apply updates
async function checkForUpdates(
  context: vscode.ExtensionContext
): Promise<boolean> {
  const remoteConfig = await fetchRemoteModelData()

  if (!remoteConfig) {
    return false
  }

  // Load current local version
  const dataPath = path.join(context.extensionPath, 'data', 'models.json')
  let localVersion = '0.0.0'

  try {
    const localContent = fs.readFileSync(dataPath, 'utf8')
    const localConfig: ModelDataConfig = JSON.parse(localContent)
    localVersion = localConfig.version
  } catch (error) {
    // If local file doesn't exist or is corrupted, we'll update it
  }

  // Compare versions
  if (remoteConfig.version !== localVersion) {
    // Save updated data
    try {
      fs.writeFileSync(dataPath, JSON.stringify(remoteConfig, null, 2), 'utf8')
      modelData = remoteConfig.categories
      return true
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to save updated model data: ${error}`
      )
      return false
    }
  }

  return false
}

// Schedule periodic update checks
function scheduleUpdateChecks(
  context: vscode.ExtensionContext,
  provider: ModelCategoriesProvider
) {
  // Check on activation
  checkForUpdates(context).then((updated) => {
    if (updated) {
      vscode.window.showInformationMessage(
        'AI Model data updated to latest version'
      )
      provider.refresh()
    }
  })

  // Schedule periodic checks
  const timer = setInterval(async () => {
    const updated = await checkForUpdates(context)
    if (updated) {
      vscode.window.showInformationMessage('AI Model data updated')
      provider.refresh()
    }
  }, CHECK_UPDATE_INTERVAL)

  context.subscriptions.push(new vscode.Disposable(() => clearInterval(timer)))
}

class ModelCategoryItem extends vscode.TreeItem {
  constructor(
    public readonly recommendation: ModelRecommendation,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(recommendation.category, collapsibleState)
    this.tooltip = recommendation.examples.join(', ')
    this.description = `${recommendation.models.length} models`
    this.contextValue = 'modelCategory'
    this.command = {
      command: 'copilot-model-selector.selectCategory',
      title: 'View Details',
      arguments: [recommendation],
    }
  }
}

class ModelItem extends vscode.TreeItem {
  constructor(public readonly modelName: string) {
    super(modelName, vscode.TreeItemCollapsibleState.None)
    this.iconPath = new vscode.ThemeIcon('symbol-method')
  }
}

class ModelCategoriesProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!element) {
      // Return top-level categories
      return Promise.resolve(
        modelData.map(
          (rec) =>
            new ModelCategoryItem(
              rec,
              vscode.TreeItemCollapsibleState.Collapsed
            )
        )
      )
    } else if (element instanceof ModelCategoryItem) {
      // Return models for this category
      return Promise.resolve(
        element.recommendation.models.map((model) => new ModelItem(model))
      )
    }
    return Promise.resolve([])
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Load initial model data
  modelData = loadLocalModelData(context)

  // Register the tree view provider
  const modelCategoriesProvider = new ModelCategoriesProvider()
  vscode.window.registerTreeDataProvider(
    'modelCategories',
    modelCategoriesProvider
  )

  // Schedule automatic update checks
  scheduleUpdateChecks(context, modelCategoriesProvider)

  // Register refresh command (now also checks for updates)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'copilot-model-selector.refreshCategories',
      async () => {
        const updated = await checkForUpdates(context)
        modelCategoriesProvider.refresh()
        vscode.window.showInformationMessage(
          updated
            ? 'Model data updated to latest version!'
            : 'Model data is already up to date'
        )
      }
    )
  )

  // Register category selection command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'copilot-model-selector.selectCategory',
      (recommendation: ModelRecommendation) => {
        showModelRecommendation(recommendation)
      }
    )
  )

  // Keep the original command palette command
  let disposable = vscode.commands.registerCommand(
    'copilot-model-selector.selectModel',
    async () => {
      // Create quick pick items with filtering
      const items: vscode.QuickPickItem[] = modelData.map((rec) => ({
        label: rec.category,
        description: rec.models.join(' • '),
        detail: rec.examples.join(', '),
      }))

      const quickPick = vscode.window.createQuickPick()
      quickPick.items = items
      quickPick.placeholder = 'Search for your use case...'
      quickPick.matchOnDescription = true
      quickPick.matchOnDetail = true

      quickPick.onDidChangeSelection((selection) => {
        if (selection[0]) {
          const selected = modelData.find(
            (rec) => rec.category === selection[0].label
          )
          if (selected) {
            showModelRecommendation(selected)
            quickPick.hide()
          }
        }
      })

      quickPick.onDidHide(() => quickPick.dispose())
      quickPick.show()
    }
  )

  context.subscriptions.push(disposable)
}

function showModelRecommendation(rec: ModelRecommendation) {
  const panel = vscode.window.createWebviewPanel(
    'modelRecommendation',
    'Model Recommendation',
    vscode.ViewColumn.Beside,
    {}
  )

  panel.webview.html = getWebviewContent(rec)
}

function getWebviewContent(rec: ModelRecommendation): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Model Recommendation</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
    }
    h2 {
      color: var(--vscode-textLink-foreground);
      border-bottom: 2px solid var(--vscode-textLink-foreground);
      padding-bottom: 10px;
    }
    h3 {
      color: var(--vscode-textPreformat-foreground);
      margin-top: 20px;
    }
    ul {
      list-style-type: none;
      padding-left: 0;
    }
    li {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: var(--vscode-textLink-foreground);
    }
    .model {
      background-color: var(--vscode-editor-selectionBackground);
      padding: 4px 8px;
      border-radius: 3px;
      display: inline-block;
      margin: 4px;
    }
    .examples {
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
  </style>
</head>
<body>
  <h2>${rec.category}</h2>
  
  <h3>Recommended Models:</h3>
  <div>
    ${rec.models.map((model) => `<span class="model">${model}</span>`).join('')}
  </div>
  
  <h3>Use Cases:</h3>
  <ul>
    ${rec.examples.map((ex) => `<li>${ex}</li>`).join('')}
  </ul>
</body>
</html>`
}

export function deactivate() {}
