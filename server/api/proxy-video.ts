import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string;

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL parameter is required',
    });
  }

  // Vérifier que l'URL provient d'une source autorisée (NASA, NOAA, etc.)
  const allowedDomains = [
    'svs.gsfc.nasa.gov',
    'epic.gsfc.nasa.gov',
    'earthobservatory.nasa.gov',
    'nasa.gov',
    'noaa.gov',
    'goes.noaa.gov',
    'commondatastorage.googleapis.com', // Fallback pour tests
  ];

  try {
    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some((domain) => urlObj.hostname.endsWith(domain));

    if (!isAllowed) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Domain not allowed',
      });
    }

    // Récupérer la vidéo
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch video from ${url}: ${response.status} ${response.statusText}`);
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch video: ${response.statusText}`,
      });
    }

    // Copier les headers pertinents
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    if (response.headers.get('Content-Length')) {
      headers.set('Content-Length', response.headers.get('Content-Length')!);
    }

    // Retourner le stream vidéo
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy video',
    });
  }
});
