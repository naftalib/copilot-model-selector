# AI Model Selector - Data Repository

This repository contains the model data used by the [Copilot Model Selector VS Code Extension](https://github.com/your-username/copilot-model-selector).

## Structure

The `models.json` file contains:

- **version**: Semantic version number
- **lastUpdated**: Date of last update (YYYY-MM-DD)
- **categories**: Array of model categories with recommendations

## Updating the Data

To update the model recommendations:

1. Edit `models.json`
2. Increment the `version` number (following semver)
3. Update the `lastUpdated` date
4. Commit and push changes

The extension will automatically fetch updates within 24 hours, or users can manually refresh via the extension's refresh button.

## Data Format

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-10",
  "categories": [
    {
      "category": "Category Name",
      "models": ["Model 1", "Model 2"],
      "examples": ["Use case 1", "Use case 2"]
    }
  ]
}
```

## Contributing

Feel free to submit PRs with:

- New AI models and their capabilities
- Updated model recommendations
- New use case categories
- Corrected or improved descriptions

## License

MIT
