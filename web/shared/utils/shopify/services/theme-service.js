import { executeGraphQLQuery } from '../../lib.js'

const GET_MAIN_THEME_ID = `
query getMainThemeId {
  themes(first: 1, roles: [MAIN]) {
    nodes {
      id
    }
  }
}
`

const GET_FILES = `
  query getFiles($filenames: [String!]!, $themeId: ID!) {
  theme(id: $themeId) {
    files(filenames: $filenames) {
      nodes {
        filename
        body {
        ... on OnlineStoreThemeFileBodyText { content }
        ... on OnlineStoreThemeFileBodyBase64 { contentBase64 }
        }
      }
    }
  }
}
`

const APP_BLOCK_EXTENSION_HANDLE = 'widget-app-block'
const APP_EMBED_EXTENSION_HANDLE = 'widget-app-embed'

export async function checkThemeSupport(session) {
  const APP_BLOCK_TEMPLATES = ['product', 'collection', 'index']

  // Get main theme ID
  const themeData = await executeGraphQLQuery(session, GET_MAIN_THEME_ID, {
    errorMessage: 'We had an issue retrieving the main theme ID'
  })
  const themeId = themeData.themes.nodes[0].id

  // Get JSON templates
  const settingsData = await executeGraphQLQuery(session, GET_FILES, {
    variables: {
      themeId,
      filenames: ['config/settings_data.json']
    },
    errorMessage: 'We had an issue retrieving the theme files'
  })

  let isAppEmbedIntegrated = false
  if (settingsData?.theme?.files?.nodes?.length > 0) {
    try {
      const finalSettings = JSON.parse(
        JSON.parse(JSON.stringify(settingsData.theme.files.nodes[0].body.content).replace(/\/\*[\s\S]*?\*\//g, ''))
      )
      const appBlock = Object.values(finalSettings?.current?.blocks || {}).find((block) =>
        block.type.includes(APP_EMBED_EXTENSION_HANDLE)
      )
      isAppEmbedIntegrated = appBlock ? !appBlock.disabled : false
    } catch (error) {
      console.error('Error parsing theme settings:', error)
    }
  }

  // Get JSON templates
  const templatesData = await executeGraphQLQuery(session, GET_FILES, {
    variables: {
      themeId,
      filenames: APP_BLOCK_TEMPLATES.map((f) => `templates/${f}.json`)
    },
    errorMessage: 'We had an issue retrieving the theme files'
  })

  let isAppBlockIntegrated = false
  const jsonTemplateFiles = templatesData.theme.files.nodes
  const jsonTemplateData = jsonTemplateFiles
    .map((file) => {
      try {
        // Clean the content before parsing
        const cleanedContent = file.body.content
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments including the header
          .trim() // Remove any extra whitespace

        const appBlock = Object.values(JSON.parse(cleanedContent)?.sections?.main?.blocks || {}).find((block) =>
          block.type.includes(APP_BLOCK_EXTENSION_HANDLE)
        )
        isAppBlockIntegrated = appBlock ? !appBlock.disabled : false

        return {
          filename: file.filename,
          body: JSON.parse(cleanedContent)
        }
      } catch (error) {
        // console.error(`Failed to parse JSON template ${file.filename}:`, error)
        return null
      }
    })
    .filter(Boolean)

  // Retrieve the body of JSON templates and find what section is set as `main`
  const templateMainSections = jsonTemplateData
    .map((file) => {
      const main = Object.entries(file.body.sections).find(
        ([id, section]) => id === 'main' || section.type.startsWith('main-')
      )
      if (main) {
        return 'sections/' + main[1].type + '.liquid'
      }
    })
    .filter((section) => section)

  const sectionFiles = await executeGraphQLQuery(session, GET_FILES, {
    variables: {
      themeId,
      filenames: templateMainSections
    },
    errorMessage: 'We had an issue retrieving the theme files'
  })

  const sectionsWithAppBlock = sectionFiles.theme.files.nodes
    .map((file) => {
      let acceptsAppBlock = false
      try {
        const themeData = file.body.content
        const match = themeData.match(/\{\%\s+schema\s+\%\}([\s\S]*?)\{\%\s+endschema\s+\%\}/m)
        if (match) {
          const schema = JSON.parse(match[1])
          if (schema && schema.blocks) {
            acceptsAppBlock = schema.blocks.some((b) => b.type === '@app')
          }
        }
      } catch (error) {
        // console.error('Error parsing section file:', error)
        return null
      }
      return acceptsAppBlock ? file : null
    })
    .filter((section) => section)

  // const hasThisAppIntegrated = sectionsWithAppBlock.some((section) => section.hasThisAppBlock)
  return {
    themeId,
    supportsAppBlocks: sectionsWithAppBlock.length > 0,
    hasThisAppIntegrated: isAppEmbedIntegrated || isAppBlockIntegrated,
    isAppEmbedIntegrated,
    isAppBlockIntegrated
  }
}

export async function getThemeAppSettingsService(session) {
  // Get main theme ID
  const themeData = await executeGraphQLQuery(session, GET_MAIN_THEME_ID, {
    errorMessage: 'We had an issue retrieving the main theme ID'
  })
  const themeId = themeData.themes.nodes[0].id

  // Get settings data
  const settingsData = await executeGraphQLQuery(session, GET_FILES, {
    variables: {
      themeId,
      filenames: ['config/settings_data.json']
    },
    errorMessage: 'We had an issue retrieving the theme settings'
  })

  let appEmbedSettings = {}
  if (settingsData?.theme?.files?.nodes?.length > 0) {
    try {
      const finalSettings = JSON.parse(
        JSON.parse(JSON.stringify(settingsData.theme.files.nodes[0].body.content)).replace(/\/\*[\s\S]*?\*\//g, '')
      )
      const appBlock = Object.values(finalSettings?.current?.blocks || {}).find((block) =>
        block.type.includes(APP_EMBED_EXTENSION_HANDLE)
      )
      if (appBlock && !appBlock.disabled) {
        appEmbedSettings = appBlock.settings || {}
      }
    } catch (error) {
      console.error('Error parsing theme settings:', error)
    }
  }

  // Get template files to check for app block settings
  const templatesData = await executeGraphQLQuery(session, GET_FILES, {
    variables: {
      themeId,
      filenames: ['templates/product.json', 'templates/collection.json', 'templates/index.json']
    },
    errorMessage: 'We had an issue retrieving the theme files'
  })

  let appBlockSettings = {}
  if (templatesData?.theme?.files?.nodes) {
    for (const file of templatesData.theme.files.nodes) {
      try {
        const cleanedContent = file.body.content.replace(/\/\*[\s\S]*?\*\//g, '').trim()

        const template = JSON.parse(cleanedContent)
        const appBlock = Object.values(template?.sections?.main?.blocks || {}).find((block) =>
          block.type.includes(APP_BLOCK_EXTENSION_HANDLE)
        )

        if (appBlock && !appBlock.disabled) {
          appBlockSettings = appBlock.settings || {}
          break // Use the first active app block settings we find
        }
      } catch (error) {
        console.error(`Error parsing template ${file.filename}:`, error)
      }
    }
  }

  return {
    themeId,
    appBlockSettings,
    appEmbedSettings
  }
}
