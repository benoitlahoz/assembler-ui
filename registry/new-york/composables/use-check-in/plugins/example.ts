/**
 * Example: Using plugins with LeafletFeaturesEditor
 *
 * This demonstrates how to use the plugin system to extend
 * a CheckInDesk for managing drawing handlers.
 */

import { useCheckIn, createActiveItemPlugin, createLoggerPlugin } from '../../useCheckIn';

interface DrawingHandler {
  type: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle';
  enable: () => void;
  disable: () => void;
  supportsRepeatMode?: boolean;
}

// Setup with plugins
const { createDesk } = useCheckIn<DrawingHandler>();

const { desk } = createDesk('drawingHandlers', {
  debug: true,

  // Add plugins to extend functionality
  plugins: [
    // Track active handler
    createActiveItemPlugin(),

    // Log operations
    createLoggerPlugin({
      prefix: '[FeaturesEditor]',
      verbose: true,
    }),
  ],
});

// Register handlers
desk.checkIn('marker', {
  type: 'marker',
  enable: () => console.log('Marker drawing enabled'),
  disable: () => console.log('Marker drawing disabled'),
  supportsRepeatMode: true,
});

desk.checkIn('circle', {
  type: 'circle',
  enable: () => console.log('Circle drawing enabled'),
  disable: () => console.log('Circle drawing disabled'),
  supportsRepeatMode: true,
});

// Use plugin methods
(desk as any).setActive('marker');
// Console: [FeaturesEditor] ✅ Item checked in: marker
// Console: Marker drawing enabled

const activeHandler = (desk as any).getActive();
console.log(activeHandler?.data.type); // 'marker'

// Switch to another handler
(desk as any).setActive('circle');
// Console: Marker drawing disabled
// Console: Circle drawing enabled

// Watch active changes
watch(
  () => (desk as any).activeId?.value,
  (activeId) => {
    console.log('Active handler changed:', activeId);

    // Enable/disable handlers based on active state
    if (activeId) {
      const handler = desk.get(activeId);
      handler?.data.enable();
    }
  }
);
