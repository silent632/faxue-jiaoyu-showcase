const numerals = '零一二三四五六七八九';
const units = { 十: 10, 百: 100, 千: 1000 };

export function normalizeLawSearch(value) {
  return value.normalize('NFKC').toLowerCase().replace(/(?:第\s*)?([零〇一二三四五六七八九十百千\d]+)\s*条/g, (_, digits) => {
    if (/^\d+$/.test(digits)) return `第${Number(digits)}条`;
    let total = 0;
    let last = 0;
    for (const digit of digits.replaceAll('〇', '零')) {
      if (units[digit]) {
        total += (last || 1) * units[digit];
        last = 0;
      } else {
        last = numerals.indexOf(digit);
      }
    }
    return `第${total + last}条`;
  });
}

export function formatLawVersion({ version, effective, repealed }) {
  return [version, `${effective} 施行`, repealed && `${repealed} 废止（历史版本）`].filter(Boolean).join(' · ');
}
