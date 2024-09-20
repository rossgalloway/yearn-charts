export const getApiVersion = (version: string): string => {
    if (version.startsWith('0')) {
        return 'v2'; // For versions starting with 0
    } else if (version.startsWith('3')) {
        return 'v3'; // For versions starting with 3
    }
    return 'unknown'; // Default case
};