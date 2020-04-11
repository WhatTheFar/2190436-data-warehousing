import * as cliProgress from 'cli-progress';

export function createSingleProgressBar() {
  const progressBar = new cliProgress.SingleBar({
    format:
      '[{bar}] {percentage}% | ETA: {eta_formatted} | Time: {duration_formatted} | {value}/{total}',
    barCompleteChar: '=',
    barIncompleteChar: '-',
  });
  return progressBar;
}
