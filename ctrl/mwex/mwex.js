//let sync = 0;
export function go($e, code) {
//	const s = ++sync;
//	setTimeout(() => _go($e, code, s), 500);
	_go($e, code);
}
export function _go($e, code, s) {
//	if (s && s !== sync) {
//		return;
//	}
	const $c = $e.querySelector(".mwex-view");
	if ($c.firstChild !== null) {
		mw_removeChild($c.firstChild);
	}
	const debug = self.mw_debugLevel;
	self.mw_debugLevel = 1;
	$c.innerHTML = `<div scope="glob" is_filling="" on.mount.self='this.removeAttribute("is_filling")'
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
	mw_render($c.firstElementChild)
		.then(() => self.mw_debugLevel = debug)
		.catch(err => {
			self.mw_debugLevel = debug;
			throw err;
		});
}
export function keyDown($e, evt) {
	if (evt.key === "Tab") {
		evt.preventDefault();
		const pos = $e.selectionStart,
			newPos = pos + 1,
			val = $e.value;
		$e.value = val.substr(0, pos) + "\t" + val.substr(pos);
		$e.setSelectionRange(newPos, newPos);
		return;
	}
	if (evt.key !== "Enter") {
		return;
	}
	const pos = $e.selectionStart,
		val = $e.value,
		toSpaceVal = val.substr(0, pos);
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
	if (spaceCount === 0) {
		return;
	}
	evt.preventDefault();
	const newPos = pos + spaceCount + 1;
	$e.value = val.substr(0, pos) + "\n" + val.substr(spaceBeginIdx, spaceCount) + val.substr(pos);
	$e.setSelectionRange(newPos, newPos);
}
