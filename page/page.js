if (!self.glob) {
	self.glob = {};
}
self.exCache = new Map();
self.glob.lang = localStorage.getItem(`lang`) || navigator.language.substr(0, 2);
const acceprLanguages = new Set(["en", "ru"]),
	defLang = `ru`;
function getLangInc(path, lang, isErr, cache = mw_incCache) {
	if (!acceprLanguages.has(lang)) {
		lang = defLang;
	}
	const r = new Request(`${path}/${lang}.html`),
		c = cache.get(r.url);
	if (c !== undefined) {
		return cache !== self.exCache ? r : c;
	}
	return fetch(r)
		.then(res => {
			if (res.ok) {
				return res;
			}
			if (defLang === lang) {
				return isErr && getLangInc("/page/err/404", lang, false);
			}
			const r = new Request(`${path}/${defLang}.html`);
			return cache.has(r.url) ? r : fetch(r)
				.then(res => res.ok ? res : isErr && getLangInc("/page/err/404", false));
		})
		.then(res => {
			if (cache !== self.exCache) {
				return res;
			}
			cache.set(res.url, res);
			return res;
		});
}
function getLangEx(path, lang) {
	const r = getLangInc(path, lang, false, self.exCache);
	return r.then ? r.then(res => res.url) : r.url;
}
function getExText(path) {
	const url = mw_getUrl(path),
		t = self.exCache.get(url);
	if (t !== undefined) {
		return t;
	}
	const tt = fetch(new Request(url))
		.then(res => res.text());
	self.exCache.set(url, tt);
	return tt;
}
