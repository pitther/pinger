export const getTimestampString = () => {
    return new Date().toLocaleString('en-US', { hour12: false });
}