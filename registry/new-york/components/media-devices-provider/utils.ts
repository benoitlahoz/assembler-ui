export const updateDevices = async () => {
  try {
    return (await navigator.mediaDevices.enumerateDevices()) || [];
  } catch (error) {
    console.error('Erreur lors de la mise à jour des périphériques :', error);
    return [];
  }
};
