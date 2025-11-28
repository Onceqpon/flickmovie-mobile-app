import { renderHook, act } from '@testing-library/react-hooks';
import useLoadData from './useloaddata';

// Mock console.error to check for "Can't perform a React state update on an unmounted component"
const originalError = console.error;
let consoleOutput: string[] = [];

beforeEach(() => {
  consoleOutput = [];
  console.error = (...args) => {
    consoleOutput.push(args.join(' '));
    originalError(...args);
  };
});

afterEach(() => {
  console.error = originalError;
});

describe('useLoadData', () => {
  it('should not update state if unmounted before promise resolves', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const fetchFunction = jest.fn(() => promise);

    const { result, unmount } = renderHook(() => useLoadData(fetchFunction));

    expect(result.current.loading).toBe(true);

    // Unmount the component while the promise is pending
    unmount();

    // Resolve the promise
    await act(async () => {
      resolvePromise('data');
    });

    // Check if any error was logged suggesting state update on unmounted component.
    const hasWarning = consoleOutput.some(msg =>
      msg.includes("Can't perform a React state update on an unmounted component") ||
      msg.includes("Warning: Can't perform a React state update on an unmounted component")
    );

    // We expect NO warning with the fix.
    expect(hasWarning).toBe(false);
  });
});
