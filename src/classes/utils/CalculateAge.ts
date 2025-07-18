export const calculateAge = (dateString?: string): number | undefined => {
    if (!dateString) {
        return undefined;
    }

    const dateParts = dateString.split('.');

    if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);

        const birthDate = new Date(year, month - 1, day); // месяц в Date начинается с 0
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    return undefined;
}