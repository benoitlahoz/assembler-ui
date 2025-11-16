// Core exports
export { useCheckIn } from './useCheckIn';

export type {
  DeskEventType,
  DeskEventCallback,
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
} from './useCheckIn';

// Plugin system
export type { CheckInPlugin } from './types';

// Built-in plugins
export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
} from './plugins';

export type { ValidationOptions, LoggerOptions, HistoryOptions, HistoryEntry } from './plugins';
