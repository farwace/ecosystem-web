export const prepareNumber = (number: number) => {
    return number.toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}