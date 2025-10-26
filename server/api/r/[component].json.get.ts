export default defineEventHandler(async event => {
  const componentName = getRouterParam(event, 'component')

  if (!componentName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Component name is required',
    })
  }

  try {
    // Servir le fichier JSON depuis public/r/
    const content = await $fetch(`/r/${componentName}.json`)

    return content
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: `Component "${componentName}" not found`,
    })
  }
})
