export function onInput($cnt, $iframe) {//, fillingOff, s) {
	for (const sync of $iframe.contentWindow.mw_syncInRender) {
		$iframe.contentWindow.mw_cancelSync(sync, 8);
	}
//	await $iframe.contentWindow.mw_getCurRender();
	const $body = $iframe.contentDocument.body;
	for (let $i = $body.firstChild; $i !== null; $i = $body.firstChild) {
		$iframe.contentWindow.mw_removeChild($i);
	}
	$body.innerHTML = $cnt.textContent;
	for (let $i = $body.firstChild; $i !== null; $i = $i.nextSibling) {
//		if ($i.nodeType === 1) {
			$iframe.contentWindow.mw_preRender($i);
//		}
	}
	$iframe.contentWindow.mw_render(undefined, 0)
		.then(() => resize($iframe));
/*
//	if (s && s !== sync) {
//		return;
//	}
	for (let $i = $view.firstChild; $i !== null; $i = $view.firstChild) {
		mw_removeChild($i);
	}
//	if (debug === undefined) {
//		debug = self.mw_debugLevel;
//	}
//	self.mw_debugLevel = 1;
	$view.innerHTML = '<div scope.glob=""' + (fillingOff ? "" : ` is_filling='' on.mount.self='this.removeAttribute("is_filling")'`) + `
		exec='if (this._init) { return }
			this._init = true;
			const pSet = new Set();
			for (const $s of this.querySelectorAll("script")) {
				if ($s.type !== "module") {
					self.eval($s.textContent);
					continue;
				}
				pSet.add(import($s.src || URL.createObjectURL(new Blob([$s.textContent], {
						type: "text/javascript"
					})))
						.then(m => {
							for (const i in m) {
								const j = m[i];
								glob[mw_p_target][j.name !== undefined ? j.name : i] = m[i];
							}
						}));
			}
			return Promise.all(pSet);'>${code}</div>`;
	mw_render($view.firstElementChild)
//		.then(() => setTimeout(() => self.mw_debugLevel = debug, 500))
		.catch(err => {
			self.mw_debugLevel = debug;
			throw err;
		});*/
}
export function onLoad(scope, $iframe) {
	if (!$iframe.src) {
		return;
	}
	scope.code = prepareCode($iframe.contentDocument.body.innerHTML);
	$iframe.contentDocument.documentElement.addEventListener("render", () => resize($iframe));
}
function prepareCode(code) {
	return code.trim().replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}
function resize($iframe) {
	$iframe.style.height = "";
	$iframe.style.height = $iframe.contentDocument.scrollingElement.scrollHeight + "px";
}
export function onKeyDown($e, evt) {
	const val = $e.textContent,
		pos = self.getSelection().focusOffset;
	if (evt.key === "Tab") {
		evt.preventDefault();
		const newPos = pos + 1;
		$e.textContent = val.substr(0, pos) + "\t" + val.substr(pos);
		setSelectionRange($e, newPos, newPos);
		return;
	}
	if (evt.key !== "Enter") {
		return;
	}
	const toSpaceVal = val.substr(0, pos);
	let spaceBeginIdx = 0,
		spaceCount = 0;
	for (let i = toSpaceVal.length - 1; i > -1; i--) {
		if (toSpaceVal[i - 1] !== "\n" && i !== 0) {
			continue;
		}
		spaceBeginIdx = i;
		const toSpaceValLen = toSpaceVal.length;
		for (; i < toSpaceValLen; i++) {
			const c = toSpaceVal[i]
			if (c !== " " && c !== "\t") {
				break;
			}
			spaceCount++;
		}
		break;
	}
//	if (spaceCount === 0) {
//		return;
//	}
	evt.preventDefault();
	const newPos = pos + spaceCount + 1;
	$e.textContent = val.substr(0, pos) + "\n" + val.substr(spaceBeginIdx, spaceCount) + val.substr(pos);
	setSelectionRange($e, newPos, newPos);
}
function setSelectionRange($e, begin, end) {
	const range = document.createRange(),
		sel = window.getSelection();
	sel.removeAllRanges();
	if (begin <= end) {
		range.setStart($e.firstChild, begin);
		range.setEnd($e.firstChild, end);
	} else {
		range.setStart($e.firstChild, end);
		range.setEnd($e.firstChild, begin);
	}
	sel.addRange(range);
}
