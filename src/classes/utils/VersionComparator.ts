export class VersionComparator {
    static isGreater(version1: string, version2: string): boolean {
        return this.compare(version1, version2) === 1;
    }

    static isLess(version1: string, version2: string): boolean {
        return this.compare(version1, version2) === -1;
    }

    static isEqual(version1: string, version2: string): boolean {
        return this.compare(version1, version2) === 0;
    }

    static compare(version1: string, version2: string): number {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const part1 = v1[i] || 0;
            const part2 = v2[i] || 0;

            if (part1 !== part2) {
                return part1 > part2 ? 1 : -1;
            }
        }

        return 0;
    }
}
