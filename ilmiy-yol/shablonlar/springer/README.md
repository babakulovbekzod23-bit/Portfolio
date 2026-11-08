# Springer Nature maqola shabloni (sn-jnl)

Ilmiy Yo'l platformasi. Maqola matni inglizcha yoziladi, izohlar o'zbekcha.

## Fayllar
- `main.tex`: maqola shabloni (sarlavha, mualliflar, abstract, IMRaD bo'limlari, jadval, formula, Declarations).
- `references.bib`: adabiyotlar ro'yxati (namuna manbalar, o'zingiznikiga almashtiring).

## Muhim: sinf fayllari alohida olinadi
`sn-jnl.cls` va `sn-*.bst` fayllari Springer Nature'ning rasmiy fayllari, shuning uchun bu papkada yo'q. Ikki yo'l bor:
1. **Overleaf (oson):** Overleaf'da "Springer Nature LaTeX Template" shablonini oching, ichidagi `sn-article.tex` o'rniga `main.tex` mazmunini qo'ying va `references.bib` ni yuklang.
2. **Kompyuterda:** Springer Nature'ning mualliflar uchun LaTeX sahifasidan shablon arxivini yuklab, ichidagi `sn-jnl.cls` va `sn-*.bst` fayllarini `main.tex` yoniga qo'ying.

## Kompilyatsiya
Tartib: `pdflatex main`, `bibtex main`, `pdflatex main`, `pdflatex main`.

## Muhim
- Havolalar uslubi `\documentclass[sn-mathphys-num]{sn-jnl}` qatoridagi parametr bilan belgilanadi. Jurnal talabiga qarab o'zgartiring (`sn-basic`, `sn-vancouver`, `sn-apacite` va boshqalar).
- Jurnalning "Instructions for Authors" sahifasini o'qing. Declarations bo'limi bandlari jurnalga qarab farq qiladi.
- `references.bib` ichidagi manbalar namuna. Har bir manbani Scopus yoki Google Scholar'da tekshiring.
