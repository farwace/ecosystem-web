// Детектор нецензурной лексики (RU/EN) с учётом завуалирования.

type CheckOptions = {
    /** По умолчанию true: агрессивный режим (меньше пропусков, больше ложных срабатываний) */
    aggressive?: boolean;
};

const HOMOGLYPHS: Record<string, string> = {
    // латиница -> кириллица, где это уместно
    a: "а", e: "е", o: "о", p: "р", c: "с", y: "у", x: "х", k: "к", h: "н", t: "т", m: "м", b: "в",
    // обратные сопоставления для английских слов (кириллица -> латиница)
    а: "a", е: "e", о: "o", р: "p", с: "c", у: "y", х: "x", к: "k", н: "h", т: "t", м: "m", в: "b",
};

const LEET: Record<string, string> = {
    "0": "о",
    "1": "л", // иногда заменяют «л» в «блядь»
    "!": "i", // для англ. брани
    "|": "i",
    "3": "е",
    "4": "а",
    "@": "а",
    "$": "с",
    "5": "s",
    "6": "б",
    "7": "т",
    "8": "в",
    "9": "g",
    "+": "т",
    "€": "е",
    "¥": "у",
};

const RUSSIAN_PROFANITY_ROOTS = [
    // е/ё целенаправленно не различаем: в нормализации всё станет "е"
    "хуй", "хуе", "аху", "оху", "поху", "ниху",
    "пизд", "пезд",
    "ебл", "еба", "ебу", "ебан", "заеб", "наеб", "проеб", "уеб", "выеб", "доеб", "отеб", "подеб",
    "бля", "бляд", "блять",
    "сука", "залуп", "лох", "анал", "обсос", "вагина", "пенис",
    "муда", "муди", "мудя", "манда",
    "гандон", "гондон",
    "жоп", "говн", "гавн", "дерьм", "срат", "сру", "наср", "обос",
    "пидор", "пидар", "пидар", "педик", "даун", // включает некоторые оскорбительные сленговые формы
    "шлюх", "простит", "сосал", "соси", "отсос", "минет",
];

const ENGLISH_PROFANITY_ROOTS = [
    "fuck", "fuk", "fck",
    "shit", "bitch", "asshole", "bastard",
    "dick", "prick", "cock", "pussy", "cunt", "slut", "whore", "hoe",
    "faggot", "fag",
];

/** Удаляем диакритику, сводим ё->е, приводим к нижнему регистру */
function basicNormalize(s: string): string {
    return s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ё/g, "е");
}

/** Фолдинг омографов (латиница↔кириллица) и лейтспика в обе стороны */
function foldHomoglyphsAndLeet(s: string): string {
    let out = "";
    for (const ch of s) {
        if (LEET[ch] !== undefined) {
            out += LEET[ch];
            continue;
        }
        if (HOMOGLYPHS[ch] !== undefined) {
            out += HOMOGLYPHS[ch];
            continue;
        }
        out += ch;
    }
    return out;
}

/** Удаляем всё, кроме букв и цифр соответствующих алфавитов */
function keepLettersDigits(s: string): string {
    return s.replace(/[^\p{L}\p{N}]+/gu, "");
}

/** Сворачиваем повторы одинаковых символов: "бляяяядь" -> "блядь" (приближённо) */
function collapseRepeats(s: string): string {
    return s.replace(/(\p{L}|\p{N})\1{1,}/gu, "$1");
}

/** Доп. нормализация для минимизации ложного негативного: пробуем обе направленности (ru-biased и en-biased) */
function dualFold(s: string): { ru: string; en: string } {
    const a = foldHomoglyphsAndLeet(s);
    // Для англ. слов иногда удобнее сохранить латиницу: преобразуем кириллические омографы в латиницу
    let en = "";
    for (const ch of a) {
        // Разворачиваем “в латиницу”, если есть отображение
        if ("аборсухктмвне".includes(ch) && HOMOGLYPHS[ch]) {
            en += HOMOGLYPHS[ch]; // в таблице уже есть кир->лат
        } else {
            en += ch;
        }
    }
    return { ru: a, en };
}

/** Подготовка строки к проверке */
function normalizeForCheck(input: string) {
    const s = basicNormalize(input);
    const { ru, en } = dualFold(s);
    const prep = (x: string) => collapseRepeats(keepLettersDigits(x));
    return { ru: prep(ru), en: prep(en) };
}

/** Варианты «расширения» корней для менее агрессивного режима */
function toWordBoundaryRegex(root: string): RegExp {
    // границы слова помогут снизить ложные срабатывания, напр. "суконный"
    // Но после normalizeForCheck мы избавились от разделителей, поэтому используем простые подстроки;
    // тут же — запасной regex на оригинальном тексте (используется в fallback).
    return new RegExp(`\\b${root}\\b`, "iu");
}

/** Главная функция: true — текст чистый, false — есть мат/брань */
export function isClean(input: string, options: CheckOptions = {}): boolean {
    const { aggressive = true } = options;

    // Быстрая нормализованная проверка подстроками
    const { ru, en } = normalizeForCheck(input);

    const hitRu = RUSSIAN_PROFANITY_ROOTS.some((root) => {
        const nRoot = normalizeForCheck(root).ru;
        // Агрессивный режим — ищем как подстроку
        if (aggressive) return ru.includes(nRoot);
        // Менее агрессивный — требуем совпадение по границам «квазислова»
        return new RegExp(`(^|[^\\p{L}\\p{N}])${nRoot}([^\\p{L}\\p{N}]|$)`, "u").test(ru);
    });

    if (hitRu) return false;

    const hitEn = ENGLISH_PROFANITY_ROOTS.some((root) => {
        const nRoot = normalizeForCheck(root).en;
        if (aggressive) return en.includes(nRoot);
        return new RegExp(`(^|[^\\p{L}\\p{N}])${nRoot}([^\\p{L}\\p{N}]|$)`, "u").test(en);
    });

    if (hitEn) return false;

    // Дополнительный, более “щепетильный” слой: если пользователь «прятал» мат внутри слова со смешением,
    // попробуем мягко проверить исходную строку по словарю с границами слова.
    if (!aggressive) {
        const lowered = input.toLowerCase();
        const softHit =
            RUSSIAN_PROFANITY_ROOTS.some((r) => toWordBoundaryRegex(r).test(lowered)) ||
            ENGLISH_PROFANITY_ROOTS.some((r) => toWordBoundaryRegex(r).test(lowered));
        if (softHit) return false;
    }

    return true;
}
