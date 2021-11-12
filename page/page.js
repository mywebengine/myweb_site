if (!self.glob) {
	self.glob = {};
}
self.glob.lang = localStorage.getItem(`lang`) || navigator.language.substr(0, 2);
const acceprLanguages = new Set(["en", "ru"]),
	defLang = `ru`;
function getLangInc(path, lang, isErr) {
	if (!acceprLanguages.has(lang)) {
		lang = defLang;
	}
	const r = new Request(`${path}/${lang}.html`);
	return mw_incCache.has(r.url) ? r : fetch(r)
		.then(res => {
			if (res.ok) {
				return res;
			}
			if (defLang === lang) {
				return isErr && getLangInc("/page/err/404", lang, false);
			}
			const r = new Request(`${path}/${defLang}.html`);
			return mw_incCache.has(r.url) ? r : fetch(r)
				.then(res => {
					if (res.ok) {
						return res;
					}
					return isErr && getLangInc("/page/err/404", false);
				});
		});
}
