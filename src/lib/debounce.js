/**
 * Creates a debounced version of a function.
 *
 * @param {Function} func The function to debounce.
 * @param {number} delay The number of milliseconds to delay.
 * @returns {Function} A debounced function.
 */
export const debounceFunc = (func, delay) => {
    let timeoutId;

    return (...args) => {
        const context = this;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args); // Call the original function
        }, delay);
    };
}