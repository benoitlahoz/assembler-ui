/**
 * A composable to simplify file building and downloading.
 *
 * @type registry:hook
 * @category files
 */

export const useDownload = () => {
  const downloadJson = (filename: string, content: object) => {
    const jsonString = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.visibility = 'hidden';
    a.style.position = 'absolute';
    a.style.zIndex = '-9999';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.visibility = 'hidden';
    a.style.position = 'absolute';
    a.style.zIndex = '-9999';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    downloadJson,
    downloadText,
  };
};
