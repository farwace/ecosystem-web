export function PreparedTimerString(time?: number) {
    const minutes = Math.floor(((time || 0) / 60));
    const seconds = (time || 0) % 60;
    const paddedMinutes = (minutes < 10 ? '0' : '') + minutes.toString();
    const paddedSeconds = (seconds < 10 ? '0' : '') + seconds.toString();

    return `${paddedMinutes}:${paddedSeconds}`;
}