import ora from 'ora';
import chalk from 'chalk';

/**
 * Display a styled step in the terminal using ora and chalk.
 * @param message Message to display while running
 * @param action Async function to execute while the spinner is active
 * @param successMessage Message to display on success (optional)
 * @param failMessage Message to display on failure (optional)
 */
export const runWithSpinner = async ({
  message,
  action,
  successMessage,
  failMessage,
}: {
  message: string;
  action: () => Promise<any>;
  successMessage?: string | ((result?: any) => string);
  failMessage?: string;
}): Promise<any> => {
  const spinner = ora({
    text: chalk.cyan(message),
    spinner: 'dots',
  }).start();
  try {
    const result = await action();
    let successMsg: string | undefined;
    if (typeof successMessage === 'function') {
      successMsg = successMessage(result);
    } else {
      successMsg = successMessage;
    }
    spinner.succeed(successMsg ? chalk.green(successMsg) : chalk.green('Success'));
    return result;
  } catch (err: any) {
    spinner.fail(
      failMessage
        ? chalk.red(`${failMessage}: ${err.message || err.stack || err}`)
        : chalk.red('Error')
    );
    throw err;
  }
};

/**
 * Display a summary of the generation process: number of files created and error details.
 * @param total Total number of files attempted
 * @param errors Array of errors with { dir, error }
 * @param warnings Array of warning messages
 */
export const displayGenerationSummary = (
  total: number,
  errors: { dir: string; error: any }[],
  options?: { successMessage?: string; extraMessage?: string; warnings?: string[] }
) => {
  const created = total - errors.length;
  console.log('\n' + chalk.bold('Generation summary:'));
  if (options?.successMessage) {
    console.log(chalk.green(options.successMessage.replace('{count}', created.toString())));
  } else {
    console.log(chalk.green(`✔ ${created} item(s) processed successfully.`));
  }
  if (options?.extraMessage) {
    console.log(chalk.green(options.extraMessage));
  }
  if (options?.warnings && options.warnings.length > 0) {
    console.log(chalk.yellow(`⚠ ${options.warnings.length} warning(s):`));
    options.warnings.forEach((warning) => {
      console.log(chalk.yellow(`  - ${warning}`));
    });
  }
  if (errors.length > 0) {
    console.log(chalk.red(`✖ ${errors.length} error(s):`));
    errors.forEach(({ dir, error }) => {
      const msg = error && error.message ? error.message : error;
      console.log(chalk.red(`  - ${dir}: ${msg}`));
    });
  } else {
    console.log(chalk.green('✔ No errors.'));
  }
};

/**
 * Display a spinner showing the number of files left to process.
 * @param remaining Number of files left
 */
export const showRemainingSpinner = (remaining: number) => {
  if (remaining > 0) {
    const spinner = ora({
      text: `Remaining files to process: ${remaining}`,
      spinner: 'dots',
    }).start();
    setTimeout(() => {
      spinner.stop();
    }, 500);
  }
};
