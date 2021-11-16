//let sync = 0;
export function go($view, code) {
//	const s = ++sync;
//	setTimeout(() => _go($view, code, s), 500);
	_go($view, code);
}
export function _go($view, code, s) {
//	if (s && s !== sync) {
//		return;
//	}
	for (let $i = $view.firstChild; $i !== null; $i = $view.firstChild) {
		mw_removeChild($i);
	}
	const debug = self.mw_debugLevel;
	self.mw_debugLevel = 1;
	$view.innerHTML = `<div scope.glob="" is_filling="" on.mount.self='this.removeAttribute("is_filling")'
		exec='if (this._init) { return }
			this._init = true;
			const pSet = new Set();
			for (const $s of this.querySelectorAll("script")) {
				if ($s.type !== "module") {
					new Function("glob", $s.textContent).apply(self, [glob[mw_p_target]]);
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
		.then(() => self.mw_debugLevel = debug)
		.catch(err => {
			self.mw_debugLevel = debug;
			throw err;
		});
}
export function keyDown($e, evt) {
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
